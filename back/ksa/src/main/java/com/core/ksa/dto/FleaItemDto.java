package com.core.ksa.dto;

import com.core.ksa.domain.MarketItem;
import lombok.Builder;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

@Data
@Builder
public class FleaItemDto {
    private Long id;
    private String name;
    private int price;
    private String status;
    private List<String> imageUrls;

    public static FleaItemDto from(MarketItem item) {
        return FleaItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .price(item.getPrice())
                .status(item.getItemStatus())
                .imageUrls(item.getImageUrls() != null && !item.getImageUrls().isEmpty()
                        ? Arrays.asList(item.getImageUrls().split(","))
                        : List.of())
                .build();
    }
}
