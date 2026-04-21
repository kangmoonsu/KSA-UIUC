package com.core.ksa.service;

import com.core.ksa.dto.JobPostCreateRequestDto;
import com.core.ksa.dto.JobPostResponseDto;
import com.core.ksa.domain.User;
import com.core.ksa.domain.JobPost;
import com.core.ksa.repository.JobPostRepository;
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
public class JobService {

        private final JobPostRepository jobPostRepository;
        private final UserRepository userRepository;
        private final ChatRoomRepository chatRoomRepository;
        private final ChatMessageRepository chatMessageRepository;
        private final NotificationRepository notificationRepository;
        private final UserActionLogRepository logRepository;
        private final S3ImageService s3ImageService;

        @Transactional(readOnly = true)
        public org.springframework.data.domain.Page<JobPostResponseDto> getAllJobs(
                        org.springframework.data.domain.Pageable pageable) {
                return jobPostRepository.findAll(pageable)
                                .map(JobPostResponseDto::from);
        }

        @Transactional(readOnly = true)
        public JobPostResponseDto getJobById(Long id) {
                JobPost post = jobPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Job post not found"));
                return JobPostResponseDto.from(post);
        }

        public void createPost(JobPostCreateRequestDto request, String clerkId) {
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

                if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.MASTER) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN,
                                        "Admins/Masters cannot create job posts");
                }

                JobPost post = JobPost.builder()
                                .title(request.getTitle())
                                .content(request.getContent())
                                .author(user)
                                .salary(request.getSalary())
                                .location(request.getLocation())
                                .contactInfo(request.getContactInfo())
                                .itemStatus(request.getStatus())
                                .build();
                jobPostRepository.save(post);
        }

        public void updatePost(Long id, JobPostCreateRequestDto request, String clerkId) {
                JobPost post = jobPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Job post not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                post.setTitle(request.getTitle());
                post.setContent(request.getContent());
                post.setSalary(request.getSalary());
                post.setLocation(request.getLocation());
                post.setContactInfo(request.getContactInfo());
                post.setItemStatus(request.getStatus());

                jobPostRepository.save(post);
        }

        public void deletePost(Long id, String clerkId) {
                JobPost post = jobPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Job post not found"));

                User currentUser = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                currentUser.getRole() == User.Role.USER) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                // Delete images from content
                if (post.getContent() != null) {
                        s3ImageService.deleteImagesFromHtml(post.getContent());
                }

                // Chat rooms and related content must be deleted first to avoid FK constraints
                java.util.List<com.core.ksa.domain.ChatRoom> roomsToDelete = chatRoomRepository.findAllByPost(post);
                if (!roomsToDelete.isEmpty()) {
                        chatMessageRepository.deleteByChatRoomIn(roomsToDelete);
                        notificationRepository.deleteByRelatedChatRoomIn(roomsToDelete);
                        chatRoomRepository.deleteAllInBatch(roomsToDelete);
                }

                jobPostRepository.delete(post);

                // Log the deletion action
                logRepository.save(com.core.ksa.domain.UserActionLog.builder()
                                .user(post.getAuthor())
                                .actionType(com.core.ksa.domain.UserActionLog.ActionType.DELETE_POST)
                                .description("Deleted post: " + post.getTitle())
                                .actorName(currentUser.getNickname())
                                .build());
        }
}
