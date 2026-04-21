package com.core.ksa.dto;

import com.core.ksa.domain.MarketPost;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class MarketPostCreateRequestDto {
    private String title;
    private String content;
    private String contactPlace;
    private MarketPost.TradeType type;
    private List<MarketItemDto> items;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class MarketItemDto {
        private Long id;
        private String name;
        private int price;
        private String description;
        private String link;
        private String status; // AVAILABLE, RESERVED, SOLD
        private List<String> imageUrls;
    }
}
