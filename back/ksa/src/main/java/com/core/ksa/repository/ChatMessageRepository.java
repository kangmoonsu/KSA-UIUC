package com.core.ksa.repository;

import com.core.ksa.domain.ChatMessage;
import com.core.ksa.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Collection;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessage m WHERE m.chatRoom IN :chatRooms")
    void deleteByChatRoomIn(@Param("chatRooms") Collection<ChatRoom> chatRooms);
}
