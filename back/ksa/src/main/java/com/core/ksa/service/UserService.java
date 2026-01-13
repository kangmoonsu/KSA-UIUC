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
                        .profileImageUrl(request.getProfileImageUrl())
                        .role(User.Role.USER) // Default role
                        .build()));
    }

    @Transactional(readOnly = true)
    public UserDto.UserProfileResponse getUserProfile(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.UserProfileResponse.from(user);
    }

    public void updateNickname(String clerkId, String nickname) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.updateProfile(nickname, user.getProfileImageUrl());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.core.ksa.dto.MyPostResponseDto> getMyPosts(String clerkId,
            org.springframework.data.domain.Pageable pageable) {
        com.core.ksa.domain.User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found: " + clerkId));
        org.springframework.data.domain.Page<com.core.ksa.domain.Post> posts = postRepository.findAllByAuthor(user,
                pageable);
        System.out.println("DEBUG: Found " + posts.getTotalElements() + " posts for user: " + user.getEmail());
        return posts.map(com.core.ksa.dto.MyPostResponseDto::from);
    }
}
