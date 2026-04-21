package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(indexes = @Index(name = "idx_chat_message_room", columnList = "chat_room_id"))
public class ChatMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private boolean isRead;

    public enum MessageType {
        TALK, ENTER, LEAVE
    }

    @Enumerated(EnumType.STRING)
    private MessageType messageType;

    @Builder
    public ChatMessage(ChatRoom chatRoom, User sender, String content, MessageType messageType) {
        this.chatRoom = chatRoom;
        this.sender = sender;
        this.content = content;
        this.isRead = false;
        this.messageType = messageType != null ? messageType : MessageType.TALK;
    }

    public void read() {
        this.isRead = true;
    }
}
