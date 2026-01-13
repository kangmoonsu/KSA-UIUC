package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    private String message;
    private String relatedUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_chat_room_id")
    private ChatRoom relatedChatRoom; // Optional

    private boolean isRead;

    @Builder
    public Notification(User recipient, String message, String relatedUrl, ChatRoom relatedChatRoom) {
        this.recipient = recipient;
        this.message = message;
        this.relatedUrl = relatedUrl;
        this.relatedChatRoom = relatedChatRoom;
        this.isRead = false;
    }

    public void read() {
        this.isRead = true;
    }
}
