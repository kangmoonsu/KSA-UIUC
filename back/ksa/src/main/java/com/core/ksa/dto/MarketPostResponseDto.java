package com.core.ksa.dto;

import com.core.ksa.domain.MarketItem;
import com.core.ksa.domain.MarketPost;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class MarketPostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String writer;
    private Long writerId;
    private String location;
    private MarketPost.TradeType type;
    private int viewCount;
    private String createdAt;
    private String writerClerkId;
    private List<MarketItemResponseDto> items;

    public MarketPostResponseDto(MarketPost post, List<MarketItem> items) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.writer = post.getAuthor() != null
                ? (post.getAuthor().getNickname() != null ? post.getAuthor().getNickname() : post.getAuthor().getName())
                : "Unknown";
        this.writerId = post.getAuthor() != null ? post.getAuthor().getId() : null;
        this.location = post.getContactPlace();
        this.type = post.getType();
        this.viewCount = post.getViewCount();
        this.createdAt = post.getCreatedAt() != null ? post.getCreatedAt().toString() : "";
        this.writerClerkId = post.getAuthor() != null ? post.getAuthor().getClerkId() : null;
        this.items = items.stream().map(MarketItemResponseDto::new).collect(Collectors.toList());
    }

    @Getter
    @NoArgsConstructor
    public static class MarketItemResponseDto {
        private Long id;
        private String name;
        private int price;
        private String description;
        private String productLink;
        private String status;
        private List<String> imageUrls;

        public MarketItemResponseDto(MarketItem item) {
            this.id = item.getId();
            this.name = item.getName();
            this.price = item.getPrice();
            this.description = item.getDescription();
            this.productLink = item.getLink();
            this.status = item.getItemStatus();
            // Assuming imageUrls is comma separated
            this.imageUrls = item.getImageUrls() != null && !item.getImageUrls().isEmpty()
                    ? List.of(item.getImageUrls().split(","))
                    : List.of();
        }
    }
}
