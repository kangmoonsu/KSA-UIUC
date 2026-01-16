package com.core.ksa.dto;

import com.core.ksa.domain.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderClerkId;
    private String senderName;
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String messageType;

    public static ChatMessageDto from(ChatMessage message) {
        return ChatMessageDto.builder()
                .id(message.getId())
                .roomId(message.getChatRoom().getId())
                .senderId(message.getSender().getId())
                .senderClerkId(message.getSender().getClerkId())
                .senderName(message.getSender().getName())
                .content(message.getContent())
                .isRead(message.isRead())
                .createdAt(message.getCreatedAt())
                .messageType(message.getMessageType().name())
                .build();
    }
}
