package com.core.ksa.service;

import com.core.ksa.domain.MarketItem;
import com.core.ksa.domain.MarketPost;
import com.core.ksa.domain.User;
import com.core.ksa.dto.MarketPostCreateRequestDto;
import com.core.ksa.dto.MarketPostResponseDto;
import com.core.ksa.repository.MarketItemRepository;
import com.core.ksa.repository.MarketPostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketService {

        private final MarketPostRepository marketPostRepository;
        private final MarketItemRepository marketItemRepository;
        private final UserRepository userRepository;

        @Transactional
        public Long createMarketPost(MarketPostCreateRequestDto requestDto, String clerkId) {
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                MarketPost marketPost = MarketPost.builder()
                                .title(requestDto.getTitle())
                                .content(requestDto.getContent())
                                .contactPlace(requestDto.getContactPlace())
                                .type(requestDto.getType())
                                .author(user)
                                .build();

                MarketPost savedPost = marketPostRepository.save(marketPost);

                if (requestDto.getItems() != null) {
                        List<MarketItem> items = requestDto.getItems().stream()
                                        .map(itemDto -> MarketItem.builder()
                                                        .marketPost(savedPost)
                                                        .name(itemDto.getName())
                                                        .price(itemDto.getPrice())
                                                        .description(itemDto.getDescription())
                                                        .link(itemDto.getLink())
                                                        .itemStatus(itemDto.getStatus())
                                                        .imageUrls(itemDto.getImageUrls() != null
                                                                        ? String.join(",", itemDto.getImageUrls())
                                                                        : null)
                                                        .build())
                                        .collect(Collectors.toList());
                        marketItemRepository.saveAll(items);
                }

                return savedPost.getId();
        }

        public Page<MarketPostResponseDto> getMarketPosts(MarketPost.TradeType type, Pageable pageable) {
                Page<MarketPost> posts = marketPostRepository.findAllByType(type, pageable);
                System.out.println("Fetched Market Posts: " + posts.getTotalElements());

                // Optimization: Fetch all items for these posts in one query (or let Hibernate
                // batch fetch if configured)
                // Here we'll do a valid manual fetch to avoid N+1
                List<MarketPost> postList = posts.getContent();
                List<MarketItem> allItems = marketItemRepository.findAllByMarketPostIn(postList);

                Map<Long, List<MarketItem>> itemsByPostId = allItems.stream()
                                .collect(Collectors.groupingBy(item -> item.getMarketPost().getId()));

                return posts.map(post -> new MarketPostResponseDto(post,
                                itemsByPostId.getOrDefault(post.getId(), List.of())));
        }

        public MarketPostResponseDto getMarketPost(Long id) {
                MarketPost post = marketPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Post not found"));
                List<MarketItem> items = marketItemRepository.findByMarketPost(post);
                return new MarketPostResponseDto(post, items);
        }

        @Transactional
        public void updateMarketPost(Long id, MarketPostCreateRequestDto requestDto, String clerkId) {
                // Find post
                MarketPost post = marketPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Post not found"));

                // Verify ownership
                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                // Update post fields
                post.setTitle(requestDto.getTitle());
                post.setContent(requestDto.getContent());
                post.setContactPlace(requestDto.getContactPlace());
                post.setType(requestDto.getType());

                // Delete old items and create new ones
                marketItemRepository.deleteByMarketPost(post);

                if (requestDto.getItems() != null) {
                        List<MarketItem> items = requestDto.getItems().stream()
                                        .map(itemDto -> MarketItem.builder()
                                                        .marketPost(post)
                                                        .name(itemDto.getName())
                                                        .price(itemDto.getPrice())
                                                        .description(itemDto.getDescription())
                                                        .link(itemDto.getLink())
                                                        .itemStatus(itemDto.getStatus())
                                                        .imageUrls(itemDto.getImageUrls() != null
                                                                        ? String.join(",", itemDto.getImageUrls())
                                                                        : null)
                                                        .build())
                                        .collect(Collectors.toList());
                        marketItemRepository.saveAll(items);
                }
        }

        @Transactional
        public void deleteMarketPost(Long id, String clerkId) {
                MarketPost post = marketPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Post not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                marketItemRepository.deleteByMarketPost(post);
                marketPostRepository.delete(post);
        }
}
