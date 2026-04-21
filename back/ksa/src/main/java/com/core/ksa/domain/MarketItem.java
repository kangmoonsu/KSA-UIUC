package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@lombok.Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MarketItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_post_id", nullable = false)
    private Post marketPost;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int price; // Using int or BigDecimal. Int is simpler for now, but BigDecimal is safer for
                       // money. KSA usually deals in USD, integers often fine.

    private String description;

    private String link; // External link

    private String itemStatus; // AVAILABLE, SOLD

    // Images 3 max. Could be ElementCollection
    @Column(length = 2000)
    private String imageUrls; // Comma separated for simplicity, or separate table.

    @Builder
    public MarketItem(Post marketPost, String name, int price, String description, String link,
            String imageUrls, String itemStatus) {
        this.marketPost = marketPost;
        this.name = name;
        this.price = price;
        this.description = description;
        this.link = link;
        this.imageUrls = imageUrls;
        this.itemStatus = itemStatus != null ? itemStatus : "AVAILABLE";
    }
}
