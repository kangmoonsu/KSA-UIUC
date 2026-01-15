package com.core.ksa.dto;

import com.core.ksa.domain.HousingPost;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HousingPostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String detail;
    private String location;
    private int price;
    private String housingType;
    private String writer;
    private Long writerId;
    private String writerClerkId;
    private boolean isOwner;
    private String status;
    private List<String> imageUrls;
    private String createdAt;
    private String updatedAt;

    public static HousingPostResponseDto from(HousingPost post) {
        return HousingPostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .detail(post.getDetail())
                .location(post.getAddress())
                .price(post.getPrice())
                .housingType(post.getHousingType().name())
                .writer(post.getAuthor() != null
                        ? (post.getAuthor().getNickname() != null ? post.getAuthor().getNickname()
                                : post.getAuthor().getName())
                        : "Unknown")
                .writerId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .writerClerkId(post.getAuthor() != null ? post.getAuthor().getClerkId() : null)
                .isOwner(false) // Needs context to determine
                .status(post.getItemStatus())
                .imageUrls(post.getImageUrls())
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : "")
                .updatedAt(post.getUpdatedAt() != null ? post.getUpdatedAt().toString() : "")
                .build();
    }
}
