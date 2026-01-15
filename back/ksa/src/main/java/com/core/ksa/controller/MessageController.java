package com.core.ksa.controller;

import com.core.ksa.domain.ChatMessage;
import com.core.ksa.domain.ChatRoom;
import com.core.ksa.domain.User;
import com.core.ksa.domain.Notification;
import com.core.ksa.dto.ChatMessageDto;
import com.core.ksa.dto.NotificationDto;
import com.core.ksa.repository.ChatMessageRepository;
import com.core.ksa.repository.ChatRoomRepository;
import com.core.ksa.repository.NotificationRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class MessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @MessageMapping("/chat/send")
    @Transactional
    public void sendMessage(ChatMessageDto messageDto) {
        ChatRoom room = chatRoomRepository.findById(messageDto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        User sender = userRepository.findByClerkId(messageDto.getSenderClerkId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .content(messageDto.getContent())
                .build();

        chatMessageRepository.save(message);

        // Update last message in room
        room.updateLastMessage(message.getContent(), LocalDateTime.now());

        // Broadcast message to room topic
        messagingTemplate.convertAndSend("/topic/room." + room.getId(), ChatMessageDto.from(message));

        // Send Notification to Recipient
        User recipient = room.getBuyer().getId().equals(sender.getId()) ? room.getSeller() : room.getBuyer();
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(sender.getName() + "님으로부터 새 메시지: " + message.getContent())
                .relatedUrl("/chat/room/" + room.getId())
                .relatedChatRoom(room)
                .build();
        notificationRepository.save(notification);

        // Real-time notification via user-specific topic
        messagingTemplate.convertAndSendToUser(recipient.getClerkId(), "/queue/notifications",
                NotificationDto.from(notification));
    }
}
