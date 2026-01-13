package com.core.ksa.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class FleaPostCreateRequestDto {
    private String title;
    private String content;
    private String type; // BUY, SELL
    private String contactPlace;
    private List<Item> items;

    @Data
    @NoArgsConstructor
    public static class Item {
        private String name;
        private int price;
        private String description;
        private String link;
        private String status; // AVAILABLE, RESERVED, SOLD
        private List<String> imageUrls;
    }
}
