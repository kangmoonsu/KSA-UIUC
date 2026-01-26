package com.core.ksa.service;

import com.core.ksa.domain.FairPost;
import com.core.ksa.domain.User;
import com.core.ksa.dto.FairPostListResponseDto;
import com.core.ksa.dto.FairPostRequestDto;
import com.core.ksa.dto.FairPostResponseDto;
import com.core.ksa.repository.FairPostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FairPostService {

        private final FairPostRepository fairPostRepository;
        private final UserRepository userRepository;

        @Transactional
        public Long createPost(FairPostRequestDto requestDto, String clerkId) {
                User author = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (author.getRole() != User.Role.ADMIN && author.getRole() != User.Role.MASTER) {
                        throw new IllegalStateException("Only ADMIN or MASTER can create fair posts");
                }

                FairPost post = FairPost.builder()
                                .title(requestDto.getTitle())
                                .content(requestDto.getContent())
                                .author(author)
                                .eventDate(requestDto.getEventDate())
                                .location(requestDto.getLocation())
                                .build();

                return fairPostRepository.save(post).getId();
        }

        public FairPostListResponseDto getPosts(Pageable pageable) {
                Page<FairPostResponseDto> posts = fairPostRepository.findAll(pageable)
                                .map(FairPostResponseDto::new);
                return new FairPostListResponseDto(posts);
        }

        @Transactional
        public FairPostResponseDto getPost(Long id) {
                FairPost post = fairPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
                post.setViewCount(post.getViewCount() + 1);
                return new FairPostResponseDto(post);
        }

        @Transactional
        public void updatePost(Long id, FairPostRequestDto requestDto, String clerkId) {
                FairPost post = fairPostRepository.findById(id)
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
                FairPost post = fairPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                user.getRole() != User.Role.MASTER && user.getRole() != User.Role.ADMIN) {
                        throw new IllegalStateException("Not authorized to delete this post");
                }

                fairPostRepository.delete(post);
        }
}
