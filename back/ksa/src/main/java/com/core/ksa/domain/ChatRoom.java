package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post; // Can be null if it's a direct inquiry not linked to a post? Requirement says
                       // "Post based".

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private MarketItem marketItem; // For Flea Market items

    private String postCategory; // FLEA, CAR, HOUSING, JOB

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    private String lastMessage;

    private LocalDateTime lastMessageAt;

    @Builder
    public ChatRoom(Post post, MarketItem marketItem, String postCategory, User buyer, User seller) {
        this.post = post;
        this.marketItem = marketItem;
        this.postCategory = postCategory;
        this.buyer = buyer;
        this.seller = seller;
        this.lastMessageAt = LocalDateTime.now();
    }

    public void updateLastMessage(String message, LocalDateTime time) {
        this.lastMessage = message;
        this.lastMessageAt = time;
    }
}
