package com.core.ksa.domain;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class HousingPost extends Post {

    private int price; // Per month
    private String address;

    @Enumerated(EnumType.STRING)
    private HousingType housingType;

    public enum HousingType {
        SUBLEASE, ROOMMATE, TAKEOVER
    }

    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    private List<String> imageUrls;

    private String itemStatus; // AVAILABLE, COMPLETED

    @Builder
    public HousingPost(String title, String content, User author, int price, String address, HousingType housingType,
            List<String> imageUrls, String itemStatus) {
        super(title, content, author);
        this.price = price;
        this.address = address;
        this.housingType = housingType;
        this.imageUrls = imageUrls;
        this.itemStatus = itemStatus != null ? itemStatus : "AVAILABLE";
    }
}
