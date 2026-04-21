package com.core.ksa.dto;

import com.core.ksa.domain.CarPost;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CarPostResponseDto {
    private Long id;
    private String title;
    private String content;
    private int price;
    private int year;
    private int mileage;
    private String modelName;
    private String writer;
    private Long writerId;
    private String writerClerkId;
    private String createdAt;
    private String status;
    private List<String> imageUrls;

    public static CarPostResponseDto from(CarPost post) {
        return CarPostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .price(post.getPrice())
                .year(post.getYear())
                .mileage(post.getMileage())
                .modelName(post.getModelName())
                .writer(post.getAuthor() != null
                        ? (post.getAuthor().getNickname() != null ? post.getAuthor().getNickname()
                                : post.getAuthor().getName())
                        : "Unknown")
                .writerId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .writerClerkId(post.getAuthor() != null ? post.getAuthor().getClerkId() : null)
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : "")
                .status(post.getItemStatus())
                .imageUrls(post.getImageUrls())
                .build();
    }
}
