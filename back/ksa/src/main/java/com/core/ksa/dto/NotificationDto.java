package com.core.ksa.dto;

import com.core.ksa.domain.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private Long id;
    private String message;
    private String relatedUrl;
    private Long relatedChatRoomId;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationDto from(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .relatedUrl(notification.getRelatedUrl())
                .relatedChatRoomId(
                        notification.getRelatedChatRoom() != null ? notification.getRelatedChatRoom().getId() : null)
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
