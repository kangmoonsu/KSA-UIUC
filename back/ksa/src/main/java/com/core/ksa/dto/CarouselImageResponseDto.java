package com.core.ksa.dto;

import com.core.ksa.domain.CarouselImage;
import lombok.Getter;

@Getter
public class CarouselImageResponseDto {
    private Long id;
    private String imageUrl;
    private Integer orderIndex;

    public CarouselImageResponseDto(CarouselImage carouselImage) {
        this.id = carouselImage.getId();
        this.imageUrl = carouselImage.getImageUrl();
        this.orderIndex = carouselImage.getOrderIndex();
    }
}
