package com.core.ksa.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MarketPost extends Post {

    private String contactPlace;

    @Enumerated(EnumType.STRING)
    private TradeType type;

    public enum TradeType {
        BUY, SELL
    }

    @jakarta.persistence.OneToMany(mappedBy = "marketPost", fetch = jakarta.persistence.FetchType.EAGER)
    private java.util.List<MarketItem> items = new java.util.ArrayList<>();

    // Items will be managed by a separate entity referencing this post or
    // ElementCollection
    // Given the requirement "물품당 최대 3장 사진", implementing MarketItem entity is
    // better.

    @Builder
    public MarketPost(String title, String content, User author, String contactPlace, TradeType type) {
        super(title, content, author);
        this.contactPlace = contactPlace;
        this.type = type;
    }
}
