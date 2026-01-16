package com.core.ksa.service;

import com.core.ksa.domain.User;
import com.core.ksa.dto.UserDto;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final com.core.ksa.repository.PostRepository postRepository;
    private final com.core.ksa.repository.UserActionLogRepository logRepository;

    public User syncUser(UserDto.SyncRequest request) {
        return userRepository.findByClerkId(request.getClerkId())
                .map(user -> {
                    user.updateProfile(request.getName(), request.getProfileImageUrl());
                    return user;
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .clerkId(request.getClerkId())
                        .email(request.getEmail())
                        .name(request.getName())
                        .nickname(request.getName()) // 초기 닉네임은 이름으로 설정
                        .profileImageUrl(request.getProfileImageUrl())
                        .role(User.Role.USER) // Default role
                        .build()));
    }

    @Transactional(readOnly = true)
    public UserDto.UserProfileResponse getUserProfile(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found: " + clerkId));
        return UserDto.UserProfileResponse.from(user);
    }

    public void updateNickname(String clerkId, String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "이미 사용 중인 닉네임입니다.");
        }
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found: " + clerkId));
        user.updateNickname(nickname);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean checkNickname(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.core.ksa.dto.MyPostResponseDto> getMyPosts(String clerkId,
            org.springframework.data.domain.Pageable pageable) {
        com.core.ksa.domain.User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found: " + clerkId));
        org.springframework.data.domain.Page<com.core.ksa.domain.Post> posts = postRepository.findAllByAuthor(user,
                pageable);
        System.out.println("DEBUG: Found " + posts.getTotalElements() + " posts for user: " + user.getEmail());
        return posts.map(com.core.ksa.dto.MyPostResponseDto::from);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UserDto.UserAdminResponse> getAllUsers(String query,
            org.springframework.data.domain.Pageable pageable) {
        if (query == null || query.isBlank()) {
            return userRepository.findAll(pageable).map(UserDto.UserAdminResponse::from);
        }
        return userRepository.findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase(query, query, pageable)
                .map(UserDto.UserAdminResponse::from);
    }

    @Transactional(readOnly = true)
    public UserDto.UserDetailResponse getUserDetail(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found: " + clerkId));

        java.util.List<com.core.ksa.dto.MyPostResponseDto> posts = postRepository.findAllByAuthor(user,
                org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
                .map(com.core.ksa.dto.MyPostResponseDto::from)
                .getContent();

        java.util.List<UserDto.UserActionLogResponse> logs = logRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(UserDto.UserActionLogResponse::from)
                .collect(java.util.stream.Collectors.toList());

        return UserDto.UserDetailResponse.from(user, posts, logs);
    }

    public void banUser(String clerkId, UserDto.BanRequest request, String actorClerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found: " + clerkId));

        User actor = userRepository.findByClerkId(actorClerkId).orElse(null);
        String actorName = actor != null ? actor.getNickname() : "System";

        user.ban(request.getReason(), request.getExpiresAt());
        userRepository.save(user);

        logRepository.save(com.core.ksa.domain.UserActionLog.builder()
                .user(user)
                .actionType(com.core.ksa.domain.UserActionLog.ActionType.BAN)
                .description("Reason: " + request.getReason()
                        + (request.getExpiresAt() != null ? ", Until: " + request.getExpiresAt() : ", Permanent"))
                .actorName(actorName)
                .build());
    }

    public void unbanUser(String clerkId, String actorClerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found: " + clerkId));

        User actor = userRepository.findByClerkId(actorClerkId).orElse(null);
        String actorName = actor != null ? actor.getNickname() : "System";

        user.unban();
        userRepository.save(user);

        logRepository.save(com.core.ksa.domain.UserActionLog.builder()
                .user(user)
                .actionType(com.core.ksa.domain.UserActionLog.ActionType.UNBAN)
                .description("Unbanned")
                .actorName(actorName)
                .build());
    }

    public void promoteToAdmin(String clerkId, String requesterClerkId) {
        User requester = userRepository.findByClerkId(requesterClerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Requester not found"));

        User target = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Target user not found: " + clerkId));

        // ADMIN can promote USER to ADMIN, MASTER can promote anyone to ADMIN
        if (requester.getRole() == User.Role.MASTER || requester.getRole() == User.Role.ADMIN) {
            target.setRole(User.Role.ADMIN);
            userRepository.save(target);

            logRepository.save(com.core.ksa.domain.UserActionLog.builder()
                    .user(target)
                    .actionType(com.core.ksa.domain.UserActionLog.ActionType.PROMOTE)
                    .description("Promoted to ADMIN")
                    .actorName(requester.getNickname())
                    .build());
        } else {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Permission denied");
        }
    }

    public void demoteToUser(String clerkId, String requesterClerkId) {
        User requester = userRepository.findByClerkId(requesterClerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Requester not found"));

        User target = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Target user not found: " + clerkId));

        // Only MASTER can demote ADMIN to USER
        if (requester.getRole() == User.Role.MASTER) {
            target.setRole(User.Role.USER);
            userRepository.save(target);

            logRepository.save(com.core.ksa.domain.UserActionLog.builder()
                    .user(target)
                    .actionType(com.core.ksa.domain.UserActionLog.ActionType.DEMOTE)
                    .description("Demoted to USER")
                    .actorName(requester.getNickname())
                    .build());
        } else {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Only MASTER can demote users");
        }
    }
}
