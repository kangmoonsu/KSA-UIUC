package com.core.ksa.service;

import com.core.ksa.domain.ConsultingPost;
import com.core.ksa.domain.User;
import com.core.ksa.dto.ConsultingPostListResponseDto;
import com.core.ksa.dto.ConsultingPostRequestDto;
import com.core.ksa.dto.ConsultingPostResponseDto;
import com.core.ksa.repository.ConsultingPostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConsultingPostService {

        private final ConsultingPostRepository consultingPostRepository;
        private final UserRepository userRepository;

        @Transactional
        public Long createPost(ConsultingPostRequestDto requestDto, String clerkId) {
                User author = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (author.getRole() != User.Role.ADMIN && author.getRole() != User.Role.MASTER) {
                        throw new IllegalStateException("Only ADMIN or MASTER can create consulting posts");
                }

                ConsultingPost post = ConsultingPost.builder()
                                .title(requestDto.getTitle())
                                .content(requestDto.getContent())
                                .author(author)
                                .eventDate(requestDto.getEventDate())
                                .location(requestDto.getLocation())
                                .build();

                return consultingPostRepository.save(post).getId();
        }

        public ConsultingPostListResponseDto getPosts(Pageable pageable) {
                Page<ConsultingPostResponseDto> posts = consultingPostRepository.findAll(pageable)
                                .map(ConsultingPostResponseDto::new);
                return new ConsultingPostListResponseDto(posts);
        }

        @Transactional
        public ConsultingPostResponseDto getPost(Long id) {
                ConsultingPost post = consultingPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
                post.setViewCount(post.getViewCount() + 1);
                return new ConsultingPostResponseDto(post);
        }

        @Transactional
        public void updatePost(Long id, ConsultingPostRequestDto requestDto, String clerkId) {
                ConsultingPost post = consultingPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                user.getRole() != User.Role.MASTER && user.getRole() != User.Role.ADMIN) {
                        throw new IllegalStateException("Not authorized to update this post");
                }

                post.setTitle(requestDto.getTitle());
                post.setContent(requestDto.getContent());
                post.setEventDate(requestDto.getEventDate());
                post.setLocation(requestDto.getLocation());
        }

        @Transactional
        public void deletePost(Long id, String clerkId) {
                ConsultingPost post = consultingPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                user.getRole() != User.Role.MASTER && user.getRole() != User.Role.ADMIN) {
                        throw new IllegalStateException("Not authorized to delete this post");
                }

                consultingPostRepository.delete(post);
        }
}
