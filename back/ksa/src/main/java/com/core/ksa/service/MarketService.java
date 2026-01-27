package com.core.ksa.service;

import com.core.ksa.domain.MarketItem;
import com.core.ksa.domain.MarketPost;
import com.core.ksa.domain.User;
import com.core.ksa.dto.MarketPostCreateRequestDto;
import com.core.ksa.dto.MarketPostResponseDto;
import com.core.ksa.repository.MarketItemRepository;
import com.core.ksa.repository.MarketPostRepository;
import com.core.ksa.repository.UserRepository;
import com.core.ksa.repository.ChatRoomRepository;
import com.core.ksa.repository.ChatMessageRepository;
import com.core.ksa.repository.NotificationRepository;
import com.core.ksa.repository.UserActionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketService {

        private final MarketPostRepository marketPostRepository;
        private final MarketItemRepository marketItemRepository;
        private final UserRepository userRepository;
        private final ChatRoomRepository chatRoomRepository;
        private final ChatMessageRepository chatMessageRepository;
        private final NotificationRepository notificationRepository;
        private final UserActionLogRepository logRepository;
        private final S3ImageService s3ImageService;

        @Transactional
        public Long createMarketPost(MarketPostCreateRequestDto requestDto, String clerkId) {
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // ADMIN and MASTER roles cannot create market posts
                if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.MASTER) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN,
                                        "Admins cannot create market posts");
                }

                MarketPost marketPost = MarketPost.builder()
                                .title(requestDto.getTitle())
                                .content(requestDto.getContent())
                                .contactPlace(requestDto.getContactPlace())
                                .type(requestDto.getType())
                                .author(user)
                                .build();

                if (requestDto.getItems() != null) {
                        List<MarketItem> items = requestDto.getItems().stream()
                                        .map(itemDto -> MarketItem.builder()
                                                        .marketPost(marketPost)
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
                        marketPost.getItems().addAll(items);
                }

                MarketPost savedPost = marketPostRepository.save(marketPost);
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

                // Selective update of items
                List<MarketItem> existingItems = post.getItems();
                List<MarketPostCreateRequestDto.MarketItemDto> requestItems = requestDto.getItems();

                // 1. Identify items to remove
                List<Long> requestItemIds = requestItems != null ? requestItems.stream()
                                .map(MarketPostCreateRequestDto.MarketItemDto::getId)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList()) : List.of();

                List<MarketItem> itemsToRemove = existingItems.stream()
                                .filter(item -> !requestItemIds.contains(item.getId()))
                                .collect(Collectors.toList());

                // 2. Delete chat rooms and images for items to remove
                if (!itemsToRemove.isEmpty()) {
                        for (MarketItem item : itemsToRemove) {
                                if (item.getImageUrls() != null) {
                                        s3ImageService.deleteImage(item.getImageUrls());
                                }
                        }
                        List<com.core.ksa.domain.ChatRoom> roomsToDelete = chatRoomRepository
                                        .findAllByMarketItemIn(itemsToRemove);
                        if (!roomsToDelete.isEmpty()) {
                                chatMessageRepository.deleteByChatRoomIn(roomsToDelete);
                                notificationRepository.deleteByRelatedChatRoomIn(roomsToDelete);
                                chatRoomRepository.deleteAllInBatch(roomsToDelete);
                        }
                        existingItems.removeAll(itemsToRemove);
                }

                // 3. Update or Add items
                if (requestItems != null) {
                        for (MarketPostCreateRequestDto.MarketItemDto itemDto : requestItems) {
                                if (itemDto.getId() != null) {
                                        // Update existing
                                        existingItems.stream()
                                                        .filter(item -> item.getId().equals(itemDto.getId()))
                                                        .findFirst()
                                                        .ifPresent(item -> {
                                                                item.setName(itemDto.getName());
                                                                item.setPrice(itemDto.getPrice());
                                                                item.setDescription(itemDto.getDescription());
                                                                item.setLink(itemDto.getLink());
                                                                item.setItemStatus(itemDto.getStatus());
                                                                item.setImageUrls(itemDto.getImageUrls() != null
                                                                                ? String.join(",",
                                                                                                itemDto.getImageUrls())
                                                                                : null);
                                                        });
                                } else {
                                        // Add new
                                        MarketItem newItem = MarketItem.builder()
                                                        .marketPost(post)
                                                        .name(itemDto.getName())
                                                        .price(itemDto.getPrice())
                                                        .description(itemDto.getDescription())
                                                        .link(itemDto.getLink())
                                                        .itemStatus(itemDto.getStatus())
                                                        .imageUrls(itemDto.getImageUrls() != null
                                                                        ? String.join(",", itemDto.getImageUrls())
                                                                        : null)
                                                        .build();
                                        existingItems.add(newItem);
                                }
                        }
                }
                marketPostRepository.save(post);
        }

        @Transactional
        public void deleteMarketPost(Long id, String clerkId) {
                MarketPost post = marketPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Post not found"));

                User currentUser = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Allow deletion if author OR ADMIN/MASTER
                if (!post.getAuthor().getClerkId().equals(clerkId) &&
                                currentUser.getRole() == User.Role.USER) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                // 2.1 Delete images of all items in the post
                for (MarketItem item : post.getItems()) {
                        if (item.getImageUrls() != null) {
                                s3ImageService.deleteImage(item.getImageUrls());
                        }
                }

                // Chat rooms and related content must be deleted first to avoid FK constraints
                List<com.core.ksa.domain.ChatRoom> roomsToDelete = chatRoomRepository.findAllByPost(post);
                if (!roomsToDelete.isEmpty()) {
                        chatMessageRepository.deleteByChatRoomIn(roomsToDelete);
                        notificationRepository.deleteByRelatedChatRoomIn(roomsToDelete);
                        chatRoomRepository.deleteAllInBatch(roomsToDelete);
                }

                // Market items are deleted automatically due to CascadeType.ALL
                marketPostRepository.delete(post);

                // Log the deletion action
                logRepository.save(com.core.ksa.domain.UserActionLog.builder()
                                .user(post.getAuthor())
                                .actionType(com.core.ksa.domain.UserActionLog.ActionType.DELETE_POST)
                                .description("Deleted post: " + post.getTitle())
                                .actorName(currentUser.getNickname())
                                .build());
        }
}
