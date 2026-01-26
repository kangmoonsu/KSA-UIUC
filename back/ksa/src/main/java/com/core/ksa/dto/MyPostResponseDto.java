package com.core.ksa.dto;

import com.core.ksa.domain.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MyPostResponseDto {
    private Long id;
    private String title;
    private String category; // FLEA, JOB, HOUSING, CAR
    private String status;
    private int viewCount;
    private LocalDateTime createdAt;
    private String imageUrl; // Thumbnail

    public static MyPostResponseDto from(Post post) {
        String category = determineCategory(post);
        String status = determineStatus(post);
        String imageUrl = determineImageUrl(post);

        return MyPostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .category(category)
                .status(status)
                .viewCount(post.getViewCount())
                .createdAt(post.getCreatedAt())
                .imageUrl(imageUrl)
                .build();
    }

    private static String determineCategory(Post post) {
        String className = post.getClass().getSimpleName();
        if (post instanceof MarketPost || className.contains("MarketPost"))
            return "FLEA";
        if (post instanceof JobPost || className.contains("JobPost"))
            return "JOB";
        if (post instanceof HousingPost || className.contains("HousingPost"))
            return "HOUSING";
        if (post instanceof CarPost || className.contains("CarPost"))
            return "CAR";
        if (post instanceof FreePost || className.contains("FreePost"))
            return "FREE";
        if (post instanceof RecruitPost || className.contains("RecruitPost"))
            return "RECRUIT";
        if (post instanceof FairPost || className.contains("FairPost"))
            return "FAIR";
        if (post instanceof NewsPost || className.contains("NewsPost"))
            return "NEWS";
        return "UNKNOWN";
    }

    private static String determineStatus(Post post) {
        if (post instanceof MarketPost marketPost) {
            return marketPost.getItems().stream().findFirst()
                    .map(item -> item.getItemStatus())
                    .orElse("AVAILABLE");
        }
        if (post instanceof JobPost jobPost)
            return jobPost.getItemStatus();
        if (post instanceof HousingPost housingPost)
            return housingPost.getItemStatus();
        if (post instanceof CarPost carPost)
            return carPost.getItemStatus();
        return "Active";
    }

    private static String determineImageUrl(Post post) {
        if (post instanceof MarketPost marketPost) {
            return marketPost.getItems().stream().findFirst()
                    .map(item -> {
                        String urls = item.getImageUrls();
                        if (urls == null || urls.isEmpty())
                            return null;
                        return urls.contains(",") ? urls.split(",")[0] : urls;
                    })
                    .orElse(null);
        }
        if (post instanceof HousingPost housingPost) {
            return (housingPost.getImageUrls() != null && !housingPost.getImageUrls().isEmpty())
                    ? housingPost.getImageUrls().get(0)
                    : null;
        }
        if (post instanceof CarPost carPost) {
            return (carPost.getImageUrls() != null && !carPost.getImageUrls().isEmpty()) ? carPost.getImageUrls().get(0)
                    : null;
        }
        // Jobs usually don't have images or handle differently
        return null;
    }
}
