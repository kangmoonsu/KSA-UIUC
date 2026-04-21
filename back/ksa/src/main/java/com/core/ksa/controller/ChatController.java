package com.core.ksa.controller;

import com.core.ksa.domain.*;
import com.core.ksa.dto.ChatMessageDto;
import com.core.ksa.dto.ChatRoomResponseDto;
import com.core.ksa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatController {

        private final ChatRoomRepository chatRoomRepository;
        private final ChatMessageRepository chatMessageRepository;
        private final PostRepository postRepository;
        private final MarketItemRepository marketItemRepository;
        private final UserRepository userRepository;
        private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
        private final NotificationRepository notificationRepository;

        @PostMapping("/room")
        @Transactional
        public ResponseEntity<?> createOrGetRoom(
                        @RequestBody Map<String, Object> params,
                        @AuthenticationPrincipal Jwt jwt) {

                String clerkId = jwt.getSubject();
                User buyer = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "User not found"));

                // MASTER and ADMIN roles cannot start inquiries
                if (buyer.getRole() == User.Role.ADMIN || buyer.getRole() == User.Role.MASTER) {
                        return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                                        .body("Admins/Masters cannot initiate inquiries");
                }

                Long postId = params.get("postId") != null ? Long.valueOf(params.get("postId").toString()) : null;
                Long itemId = params.get("itemId") != null ? Long.valueOf(params.get("itemId").toString()) : null;
                String category = (String) params.get("category");

                ChatRoom chatRoom;

                if (itemId != null) {
                        // Flea Market specific item chat
                        MarketItem item = marketItemRepository.findById(itemId)
                                        .orElseThrow(() -> new RuntimeException("Item not found"));
                        User seller = item.getMarketPost().getAuthor();

                        if (buyer.getId().equals(seller.getId())) {
                                return ResponseEntity.badRequest().body("Cannot chat with yourself");
                        }

                        chatRoom = chatRoomRepository.findByMarketItemAndBuyerAndSeller(item, buyer, seller)
                                        .map(room -> {
                                                // Re-activate if buyer had left
                                                if (!room.isBuyerActive()) {
                                                        room.setBuyerActive(true);
                                                        chatRoomRepository.save(room);
                                                }
                                                return room;
                                        })
                                        .orElseGet(() -> chatRoomRepository.save(ChatRoom.builder()
                                                        .post(item.getMarketPost())
                                                        .marketItem(item)
                                                        .postCategory("FLEA")
                                                        .buyer(buyer)
                                                        .seller(seller)
                                                        .build()));
                } else if (postId != null) {
                        // General post chat (Car, Housing, Job)
                        Post post = postRepository.findById(postId)
                                        .orElseThrow(() -> new RuntimeException("Post not found"));
                        User seller = post.getAuthor();

                        if (buyer.getId().equals(seller.getId())) {
                                return ResponseEntity.badRequest().body("Cannot chat with yourself");
                        }

                        chatRoom = chatRoomRepository.findByPostAndBuyerAndSeller(post, buyer, seller)
                                        .map(room -> {
                                                // Re-activate if buyer had left
                                                if (!room.isBuyerActive()) {
                                                        room.setBuyerActive(true);
                                                        chatRoomRepository.save(room);
                                                }
                                                return room;
                                        })
                                        .orElseGet(() -> chatRoomRepository.save(ChatRoom.builder()
                                                        .post(post)
                                                        .postCategory(category)
                                                        .buyer(buyer)
                                                        .seller(seller)
                                                        .build()));
                } else {
                        return ResponseEntity.badRequest().body("Invalid parameters");
                }

                return ResponseEntity.ok(Map.of("roomId", chatRoom.getId()));
        }

        @GetMapping("/rooms")
        public ResponseEntity<List<ChatRoomResponseDto>> getMyRooms(@AuthenticationPrincipal Jwt jwt) {
                String clerkId = jwt.getSubject();
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<ChatRoom> rooms = chatRoomRepository.findByBuyerOrSellerOrderByLastMessageAtDesc(user, user);
                List<ChatRoomResponseDto> response = rooms.stream()
                                .filter(room -> {
                                        if (room.getBuyer().getId().equals(user.getId())) {
                                                return room.isBuyerActive();
                                        } else {
                                                return room.isSellerActive();
                                        }
                                })
                                .map(room -> {
                                        if (room.getPost() != null) {
                                                org.hibernate.Hibernate.initialize(room.getPost());
                                                if (room.getPost() instanceof com.core.ksa.domain.MarketPost marketPost) {
                                                        org.hibernate.Hibernate.initialize(marketPost.getItems());
                                                }
                                        }
                                        if (room.getMarketItem() != null) {
                                                org.hibernate.Hibernate.initialize(room.getMarketItem());
                                        }
                                        org.hibernate.Hibernate.initialize(room.getBuyer());
                                        org.hibernate.Hibernate.initialize(room.getSeller());
                                        return ChatRoomResponseDto.from(room, user.getId());
                                })
                                .toList();

                return ResponseEntity.ok(response);
        }

        @GetMapping("/room/{roomId}")
        public ResponseEntity<ChatRoomResponseDto> getRoomInfo(
                        @PathVariable("roomId") Long roomId,
                        @AuthenticationPrincipal Jwt jwt) {
                String clerkId = jwt.getSubject();
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                ChatRoom room = chatRoomRepository.findById(roomId)
                                .orElseThrow(() -> new RuntimeException("Room not found"));

                // Check if user is part of the room
                if (!room.getBuyer().getId().equals(user.getId()) && !room.getSeller().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).build();
                }

                // Explicitly initialize lazy loaded associations
                if (room.getPost() != null) {
                        org.hibernate.Hibernate.initialize(room.getPost());
                        if (room.getPost() instanceof com.core.ksa.domain.MarketPost marketPost) {
                                org.hibernate.Hibernate.initialize(marketPost.getItems());
                        }
                }
                if (room.getMarketItem() != null) {
                        org.hibernate.Hibernate.initialize(room.getMarketItem());
                }
                org.hibernate.Hibernate.initialize(room.getBuyer());
                org.hibernate.Hibernate.initialize(room.getSeller());

                return ResponseEntity.ok(ChatRoomResponseDto.from(room, user.getId()));
        }

        @GetMapping("/room/{roomId}/messages")
        public ResponseEntity<List<ChatMessageDto>> getMessages(
                        @PathVariable("roomId") Long roomId,
                        @AuthenticationPrincipal Jwt jwt) {
                String clerkId = jwt.getSubject();
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                ChatRoom room = chatRoomRepository.findById(roomId)
                                .orElseThrow(() -> new RuntimeException("Room not found"));

                if (!room.getBuyer().getId().equals(user.getId()) && !room.getSeller().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).build();
                }

                List<ChatMessage> messages = chatMessageRepository.findByChatRoomOrderByCreatedAtAsc(room);
                return ResponseEntity.ok(messages.stream().map(ChatMessageDto::from).toList());
        }

        @PostMapping("/room/{roomId}/read")
        @Transactional
        public ResponseEntity<Void> markAsRead(
                        @PathVariable("roomId") Long roomId,
                        @AuthenticationPrincipal Jwt jwt) {
                String clerkId = jwt.getSubject();
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                ChatRoom room = chatRoomRepository.findById(roomId)
                                .orElseThrow(() -> new RuntimeException("Room not found"));

                List<ChatMessage> unreadMessages = chatMessageRepository.findByChatRoomOrderByCreatedAtAsc(room)
                                .stream()
                                .filter(m -> !m.getSender().getId().equals(user.getId()) && !m.isRead())
                                .toList();

                unreadMessages.forEach(ChatMessage::read);
                return ResponseEntity.ok().build();
        }

        @PostMapping("/room/{roomId}/leave")
        @Transactional
        public ResponseEntity<Void> leaveRoom(
                        @PathVariable("roomId") Long roomId,
                        @AuthenticationPrincipal Jwt jwt) {
                String clerkId = jwt.getSubject();
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                ChatRoom room = chatRoomRepository.findById(roomId)
                                .orElseThrow(() -> new RuntimeException("Room not found"));

                if (!room.getBuyer().getId().equals(user.getId()) && !room.getSeller().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).build();
                }

                room.leave(user);

                // Create LEAVE system message
                ChatMessage leaveMessage = ChatMessage.builder()
                                .chatRoom(room)
                                .sender(user)
                                .content(user.getNickname() + "님이 채팅방을 나갔습니다.")
                                .messageType(ChatMessage.MessageType.LEAVE)
                                .build();
                chatMessageRepository.save(leaveMessage);

                // Update last message
                room.updateLastMessage(leaveMessage.getContent(), LocalDateTime.now());
                chatRoomRepository.save(room);

                // Broadcast leave message
                messagingTemplate.convertAndSend("/topic/room." + room.getId(),
                                com.core.ksa.dto.ChatMessageDto.from(leaveMessage));

                // Send Notification to Partner
                User recipient = room.getBuyer().getId().equals(user.getId()) ? room.getSeller() : room.getBuyer();
                Notification notification = Notification.builder()
                                .recipient(recipient)
                                .message(user.getNickname() + "님이 채팅방을 나갔습니다.")
                                .relatedUrl("/chat/room/" + room.getId())
                                .relatedChatRoom(room)
                                .build();
                notificationRepository.save(notification);

                messagingTemplate.convertAndSendToUser(recipient.getClerkId(), "/queue/notifications",
                                com.core.ksa.dto.NotificationDto.from(notification));

                return ResponseEntity.ok().build();
        }
}
