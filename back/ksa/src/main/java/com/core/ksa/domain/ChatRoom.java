package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@lombok.Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Post post; // Can be null if it's a direct inquiry not linked to a post? Requirement says
                       // "Post based".

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
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

    @Column(nullable = false)
    private boolean buyerActive = true;
    @Column(nullable = false)
    private boolean sellerActive = true;

    public boolean isBuyerActive() {
        return buyerActive;
    }

    public boolean isSellerActive() {
        return sellerActive;
    }

    @Builder
    public ChatRoom(Post post, MarketItem marketItem, String postCategory, User buyer, User seller) {
        this.post = post;
        this.marketItem = marketItem;
        this.postCategory = postCategory;
        this.buyer = buyer;
        this.seller = seller;
        this.lastMessageAt = LocalDateTime.now();
        this.buyerActive = true;
        this.sellerActive = true;
    }

    public void updateLastMessage(String message, LocalDateTime time) {
        this.lastMessage = message;
        this.lastMessageAt = time;
    }

    public void leave(User user) {
        if (buyer.getId().equals(user.getId())) {
            this.buyerActive = false;
        } else if (seller.getId().equals(user.getId())) {
            this.sellerActive = false;
        }
    }

    public boolean isBothLeft() {
        return !buyerActive && !sellerActive;
    }
}
