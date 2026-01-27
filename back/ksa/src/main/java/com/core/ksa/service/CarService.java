package com.core.ksa.service;

import com.core.ksa.dto.CarPostCreateRequestDto;
import com.core.ksa.dto.CarPostResponseDto;
import com.core.ksa.domain.User;
import com.core.ksa.domain.CarPost;
import com.core.ksa.repository.CarPostRepository;
import com.core.ksa.repository.UserRepository;
import com.core.ksa.repository.ChatRoomRepository;
import com.core.ksa.repository.ChatMessageRepository;
import com.core.ksa.repository.NotificationRepository;
import com.core.ksa.repository.UserActionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CarService {

        private final CarPostRepository carPostRepository;
        private final UserRepository userRepository;
        private final ChatRoomRepository chatRoomRepository;
        private final ChatMessageRepository chatMessageRepository;
        private final NotificationRepository notificationRepository;
        private final UserActionLogRepository logRepository;
        private final S3ImageService s3ImageService;

        @Transactional(readOnly = true)
        public org.springframework.data.domain.Page<CarPostResponseDto> getAllCars(
                        org.springframework.data.domain.Pageable pageable) {
                return carPostRepository.findAll(pageable)
                                .map(CarPostResponseDto::from);
        }

        @Transactional(readOnly = true)
        public CarPostResponseDto getCarById(Long id) {
                CarPost post = carPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Car post not found"));
                return CarPostResponseDto.from(post);
        }

        public void createPost(CarPostCreateRequestDto request, String clerkId) {
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

                if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.MASTER) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN,
                                        "Admins/Masters cannot create car posts");
                }

                CarPost post = CarPost.builder()
                                .title(request.getTitle())
                                .content(request.getContent())
                                .author(user)
                                .price(request.getPrice())
                                .modelName(request.getModelName())
                                .year(request.getYear())
                                .mileage(request.getMileage())
                                .imageUrls(request.getImageUrls())
                                .build();
                carPostRepository.save(post);
        }

        public void updatePost(Long id, CarPostCreateRequestDto request, String clerkId) {
                CarPost post = carPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Car post not found"));

                // Verify ownership
                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                // Update fields
                post.setTitle(request.getTitle());
                post.setContent(request.getContent());
                post.setPrice(request.getPrice());
                post.setModelName(request.getModelName());
                post.setYear(request.getYear());
                post.setMileage(request.getMileage());
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

                carPostRepository.save(post);
        }

        public void deletePost(Long id, String clerkId) {
                CarPost post = carPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Car post not found"));

                User currentUser = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                currentUser.getRole() == User.Role.USER) {
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

                carPostRepository.delete(post);

                // Log the deletion action
                logRepository.save(com.core.ksa.domain.UserActionLog.builder()
                                .user(post.getAuthor())
                                .actionType(com.core.ksa.domain.UserActionLog.ActionType.DELETE_POST)
                                .description("Deleted post: " + post.getTitle())
                                .actorName(currentUser.getNickname())
                                .build());
        }
}
