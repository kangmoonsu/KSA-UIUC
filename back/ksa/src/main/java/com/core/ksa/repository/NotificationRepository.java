package com.core.ksa.repository;

import com.core.ksa.domain.Notification;
import com.core.ksa.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    long countByRecipientAndIsReadFalse(User recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient = :recipient AND n.isRead = false")
    void markAllAsRead(@Param("recipient") User recipient);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient = :recipient AND n.isRead = true")
    void deleteReadNotifications(@Param("recipient") User recipient);

    @Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM Notification n WHERE n.relatedChatRoom IN :chatRooms")
    void deleteByRelatedChatRoomIn(@Param("chatRooms") java.util.Collection<com.core.ksa.domain.ChatRoom> chatRooms);
}
