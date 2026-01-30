package com.core.ksa.service;

import com.core.ksa.dto.HousingPostResponseDto;
import com.core.ksa.dto.HousingPostCreateRequestDto;
import com.core.ksa.domain.HousingPost;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class HousingService {

        private final com.core.ksa.repository.UserRepository userRepository;
        private final com.core.ksa.repository.HousingPostRepository housingPostRepository;
        private final com.core.ksa.repository.ChatRoomRepository chatRoomRepository;
        private final com.core.ksa.repository.ChatMessageRepository chatMessageRepository;
        private final com.core.ksa.repository.NotificationRepository notificationRepository;
        private final com.core.ksa.repository.UserActionLogRepository logRepository;
        private final S3ImageService s3ImageService;

        @Transactional(readOnly = true)
        public org.springframework.data.domain.Page<HousingPostResponseDto> getAllHousings(
                        org.springframework.data.domain.Pageable pageable) {
                return housingPostRepository.findAll(pageable)
                                .map(HousingPostResponseDto::from);
        }

        @Transactional(readOnly = true)
        public java.util.List<HousingPostResponseDto> getLatestPosts(int limit) {
                org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest
                                .of(0, limit, org.springframework.data.domain.Sort
                                                .by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
                return housingPostRepository.findAll(pageRequest)
                                .getContent()
                                .stream()
                                .map(HousingPostResponseDto::from)
                                .collect(java.util.stream.Collectors.toList());
        }

        @Transactional(readOnly = true)
        public HousingPostResponseDto getHousingById(Long id) {
                com.core.ksa.domain.HousingPost post = housingPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Housing post not found"));
                return HousingPostResponseDto.from(post);
        }

        public void createPost(com.core.ksa.dto.HousingPostCreateRequestDto request, String clerkId) {
                com.core.ksa.domain.User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

                if (user.getRole() == com.core.ksa.domain.User.Role.ADMIN
                                || user.getRole() == com.core.ksa.domain.User.Role.MASTER) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN,
                                        "Admins/Masters cannot create housing posts");
                }

                com.core.ksa.domain.HousingPost post = com.core.ksa.domain.HousingPost.builder()
                                .title(request.getTitle())
                                .content(request.getContent() != null ? request.getContent()
                                                : (request.getDetail() != null ? request.getDetail() : ""))
                                .author(user)
                                .price(request.getPrice())
                                .address(request.getLocation())
                                .housingType(request.getHousingType())
                                .imageUrls(request.getImageUrls())
                                .build();
                housingPostRepository.save(post);
        }

        public void updatePost(Long id, HousingPostCreateRequestDto request, String clerkId) {
                HousingPost post = housingPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Housing post not found"));

                // Verify ownership
                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                // Update fields
                post.setTitle(request.getTitle());
                post.setContent(request.getContent() != null ? request.getContent()
                                : (request.getDetail() != null ? request.getDetail() : ""));
                post.setPrice(request.getPrice());
                post.setAddress(request.getLocation());
                post.setHousingType(request.getHousingType());
                post.setItemStatus(request.getStatus());

                // Update images
                if (request.getImageUrls() != null) {
                        // Delete old images that are not in the new list
                        for (String oldUrl : post.getImageUrls()) {
                                if (!request.getImageUrls().contains(oldUrl)) {
                                        s3ImageService.deleteImage(oldUrl);
                                }
                        }
                        post.getImageUrls().clear();
                        post.getImageUrls().addAll(request.getImageUrls());
                }

                housingPostRepository.save(post);
        }

        public void deletePost(Long id, String clerkId) {
                HousingPost post = housingPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Housing post not found"));

                com.core.ksa.domain.User currentUser = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                currentUser.getRole() == com.core.ksa.domain.User.Role.USER) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                // Delete images
                if (post.getImageUrls() != null) {
                        for (String url : post.getImageUrls()) {
                                s3ImageService.deleteImage(url);
                        }
                }

                // Chat rooms and related content must be deleted first to avoid FK constraints
                java.util.List<com.core.ksa.domain.ChatRoom> roomsToDelete = chatRoomRepository.findAllByPost(post);
                if (!roomsToDelete.isEmpty()) {
                        chatMessageRepository.deleteByChatRoomIn(roomsToDelete);
                        notificationRepository.deleteByRelatedChatRoomIn(roomsToDelete);
                        chatRoomRepository.deleteAllInBatch(roomsToDelete);
                }

                housingPostRepository.delete(post);

                // Log the deletion action
                logRepository.save(com.core.ksa.domain.UserActionLog.builder()
                                .user(post.getAuthor())
                                .actionType(com.core.ksa.domain.UserActionLog.ActionType.DELETE_POST)
                                .description("Deleted post: " + post.getTitle())
                                .actorName(currentUser.getNickname())
                                .build());
        }
}
