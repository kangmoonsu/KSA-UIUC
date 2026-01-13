package com.core.ksa.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class CarPostCreateRequestDto {
    private String title;
    private int price;
    private String modelName;
    private int year;
    private int mileage;
    private String content;
    private String status; // AVAILABLE, RESERVED, SOLD
    private List<String> imageUrls;
}
