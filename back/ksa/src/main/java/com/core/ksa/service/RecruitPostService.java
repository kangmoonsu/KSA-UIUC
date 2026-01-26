package com.core.ksa.service;

import com.core.ksa.domain.RecruitPost;
import com.core.ksa.domain.User;
import com.core.ksa.dto.RecruitPostListResponseDto;
import com.core.ksa.dto.RecruitPostRequestDto;
import com.core.ksa.dto.RecruitPostResponseDto;
import com.core.ksa.repository.RecruitPostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecruitPostService {

        private final RecruitPostRepository recruitPostRepository;
        private final UserRepository userRepository;

        @Transactional
        public Long createPost(RecruitPostRequestDto requestDto, String clerkId) {
                User author = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (author.getRole() != User.Role.ADMIN && author.getRole() != User.Role.MASTER) {
                        throw new IllegalStateException("Only ADMIN or MASTER can create recruit posts");
                }

                RecruitPost post = RecruitPost.builder()
                                .title(requestDto.getTitle())
                                .content(requestDto.getContent())
                                .author(author)
                                .companyName(requestDto.getCompanyName())
                                .roles(requestDto.getRoles())
                                .location(requestDto.getLocation())
                                .applicationLinks(requestDto.getApplicationLinks())
                                .build();

                return recruitPostRepository.save(post).getId();
        }

        public RecruitPostListResponseDto getPosts(Pageable pageable) {
                Page<RecruitPostResponseDto> posts = recruitPostRepository.findAll(pageable)
                                .map(RecruitPostResponseDto::new);
                return new RecruitPostListResponseDto(posts);
        }

        @Transactional
        public RecruitPostResponseDto getPost(Long id) {
                RecruitPost post = recruitPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
                post.setViewCount(post.getViewCount() + 1);
                return new RecruitPostResponseDto(post);
        }

        @Transactional
        public void updatePost(Long id, RecruitPostRequestDto requestDto, String clerkId) {
                RecruitPost post = recruitPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                user.getRole() != User.Role.MASTER && user.getRole() != User.Role.ADMIN) {
                        throw new IllegalStateException("Not authorized to update this post");
                }

                post.setTitle(requestDto.getTitle());
                post.setContent(requestDto.getContent());
                post.setCompanyName(requestDto.getCompanyName());
                post.setRoles(requestDto.getRoles());
                post.setLocation(requestDto.getLocation());
                post.setApplicationLinks(requestDto.getApplicationLinks());
        }

        @Transactional
        public void deletePost(Long id, String clerkId) {
                RecruitPost post = recruitPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                user.getRole() != User.Role.MASTER && user.getRole() != User.Role.ADMIN) {
                        throw new IllegalStateException("Not authorized to delete this post");
                }

                recruitPostRepository.delete(post);
        }
}
