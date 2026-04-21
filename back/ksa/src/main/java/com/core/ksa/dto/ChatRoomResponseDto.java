package com.core.ksa.dto;

import com.core.ksa.domain.Post;
import org.hibernate.Hibernate;
import com.core.ksa.domain.ChatRoom;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatRoomResponseDto {
    private Long roomId;
    private String lastMessage;
    private LocalDateTime lastMessageAt;

    // Partner Info
    private String partnerName;
    private Long partnerId;

    // Post/Item Info
    private Long postId;
    private String postTitle;
    private String category;
    private String thumbnail;

    // For Flea Market items
    private Long itemId;
    private String itemName;

    private boolean partnerActive;

    public static ChatRoomResponseDto from(ChatRoom room, Long currentUserId) {
        boolean isBuyer = room.getBuyer().getId().equals(currentUserId);
        var partner = isBuyer ? room.getSeller() : room.getBuyer();
        boolean partnerActive = isBuyer ? room.isSellerActive() : room.isBuyerActive();

        String thumbnail = null;
        if (room.getMarketItem() != null) {
            String urls = room.getMarketItem().getImageUrls();
            if (urls != null && !urls.isEmpty()) {
                thumbnail = urls.split(",")[0];
            }
        } else if (room.getPost() != null) {
            thumbnail = determinePostThumbnailByRoom(room);
        }

        return ChatRoomResponseDto.builder()
                .roomId(room.getId())
                .lastMessage(room.getLastMessage())
                .lastMessageAt(room.getLastMessageAt())
                .partnerName(partner.getName())
                .partnerId(partner.getId())
                .postId(room.getPost() != null ? room.getPost().getId() : null)
                .postTitle(room.getPost() != null ? room.getPost().getTitle()
                        : (room.getMarketItem() != null ? room.getMarketItem().getName() : "문의"))
                .category(room.getPostCategory())
                .thumbnail(thumbnail)
                .itemId(room.getMarketItem() != null ? room.getMarketItem().getId() : null)
                .itemName(room.getMarketItem() != null ? room.getMarketItem().getName() : null)
                .partnerActive(partnerActive)
                .build();
    }

    private static String determinePostThumbnailByRoom(ChatRoom room) {
        Post post = room.getPost();
        if (post == null)
            return null;

        String category = room.getPostCategory();
        Post unproxied = (Post) Hibernate.unproxy(post);

        if ("FLEA".equals(category) && unproxied instanceof com.core.ksa.domain.MarketPost marketPost) {
            return marketPost.getItems().stream()
                    .filter(item -> item.getImageUrls() != null && !item.getImageUrls().isEmpty())
                    .findFirst()
                    .map(item -> {
                        String urls = item.getImageUrls();
                        return urls.contains(",") ? urls.split(",")[0] : urls;
                    })
                    .orElse(null);
        } else if ("CAR".equals(category) && unproxied instanceof com.core.ksa.domain.CarPost carPost) {
            if (carPost.getImageUrls() != null && !carPost.getImageUrls().isEmpty()) {
                return carPost.getImageUrls().get(0);
            }
        } else if ("HOUSING".equals(category) && unproxied instanceof com.core.ksa.domain.HousingPost housingPost) {
            if (housingPost.getImageUrls() != null && !housingPost.getImageUrls().isEmpty()) {
                return housingPost.getImageUrls().get(0);
            }
        }
        return null;
    }
}
