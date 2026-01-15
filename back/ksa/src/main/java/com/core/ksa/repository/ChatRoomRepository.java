package com.core.ksa.repository;

import com.core.ksa.domain.ChatRoom;
import com.core.ksa.domain.MarketItem;
import com.core.ksa.domain.Post;
import com.core.ksa.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // Find existing chat room between buyer and seller for a post
    Optional<ChatRoom> findByPostAndBuyerAndSeller(Post post, User buyer, User seller);

    // Find existing chat room for a specific market item
    Optional<ChatRoom> findByMarketItemAndBuyerAndSeller(MarketItem marketItem, User buyer, User seller);

    // List all chat rooms for a user (either buyer or seller)
    List<ChatRoom> findByBuyerOrSellerOrderByLastMessageAtDesc(User buyer, User seller);
}
