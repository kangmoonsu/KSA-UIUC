package com.core.ksa.domain;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CarPost extends Post {

    private int price;
    private String modelName;
    private int year;
    private int mileage;
    private String itemStatus; // AVAILABLE, RESERVED, SOLD

    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    private List<String> imageUrls; // Max 5

    @Builder
    public CarPost(String title, String content, User author, int price, String modelName, int year, int mileage,
            List<String> imageUrls, String itemStatus) {
        super(title, content, author);
        this.price = price;
        this.modelName = modelName;
        this.year = year;
        this.mileage = mileage;
        this.imageUrls = imageUrls;
        this.itemStatus = itemStatus != null ? itemStatus : "AVAILABLE";
    }
}
