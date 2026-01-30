package com.core.ksa.service;

import com.core.ksa.domain.NewsPost;
import com.core.ksa.domain.User;
import com.core.ksa.dto.NewsBoardListResponseDto;
import com.core.ksa.dto.NewsPostCreateRequestDto;
import com.core.ksa.dto.NewsPostResponseDto;
import com.core.ksa.repository.NewsPostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsPostService {

        private final NewsPostRepository newsPostRepository;
        private final UserRepository userRepository;
        private final ViewCountService viewCountService;
        private final S3ImageService s3ImageService;

        @Transactional
        public Long createPost(NewsPostCreateRequestDto requestDto, String clerkId) {
                User author = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                NewsPost newsPost = NewsPost.builder()
                                .title(requestDto.getTitle())
                                .content(requestDto.getContent())
                                .author(author)
                                .build();

                return newsPostRepository.save(newsPost).getId();
        }

        public NewsBoardListResponseDto getPosts(Pageable pageable) {
                Page<NewsPostResponseDto> posts = newsPostRepository.findAllWithAuthor(pageable)
                                .map(NewsPostResponseDto::new);
                return new NewsBoardListResponseDto(posts);
        }

        public java.util.List<NewsPostResponseDto> getLatestPosts(int limit) {
                org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest
                                .of(0, limit, org.springframework.data.domain.Sort
                                                .by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
                return newsPostRepository.findAll(pageRequest)
                                .stream()
                                .map(NewsPostResponseDto::new)
                                .collect(java.util.stream.Collectors.toList());
        }

        @Transactional
        public NewsPostResponseDto getPost(Long id, String clientIdentifier) {
                NewsPost newsPost = newsPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

                if (viewCountService.shouldIncrementView("NEWS", id, clientIdentifier)) {
                        newsPost.setViewCount(newsPost.getViewCount() + 1);
                }

                return new NewsPostResponseDto(newsPost);
        }

        @Transactional
        public void updatePost(Long id, NewsPostCreateRequestDto requestDto, String clerkId) {
                NewsPost newsPost = newsPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!newsPost.getAuthor().getClerkId().equals(clerkId) &&
                                user.getRole() != User.Role.MASTER && user.getRole() != User.Role.ADMIN) {
                        throw new IllegalStateException("Not authorized to update this post");
                }

                newsPost.setTitle(requestDto.getTitle());
                newsPost.setContent(requestDto.getContent());
        }

        @Transactional
        public void deletePost(Long id, String clerkId) {
                NewsPost newsPost = newsPostRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (!newsPost.getAuthor().getClerkId().equals(clerkId) &&
                                user.getRole() != User.Role.MASTER && user.getRole() != User.Role.ADMIN) {
                        throw new IllegalStateException("Not authorized to delete this post");
                }

                // Delete images from content
                if (newsPost.getContent() != null) {
                        s3ImageService.deleteImagesFromHtml(newsPost.getContent());
                }

                newsPostRepository.delete(newsPost);
        }
}
