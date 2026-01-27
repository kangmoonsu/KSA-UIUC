package com.core.ksa.dto;

import com.core.ksa.domain.HousingPost;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class HousingPostCreateRequestDto {
    private String title;
    private String content;
    private String detail; // Deprecated, but kept for safety during transition
    private int price;
    private String location; // Mapped to address in Entity
    private HousingPost.HousingType housingType;
    private String status; // AVAILABLE, RESERVED, SOLD
    private List<String> imageUrls;
}
