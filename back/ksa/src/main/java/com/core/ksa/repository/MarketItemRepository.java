package com.core.ksa.repository;

import com.core.ksa.domain.MarketItem;
import com.core.ksa.domain.MarketPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketItemRepository extends JpaRepository<MarketItem, Long> {
    List<MarketItem> findByMarketPostId(Long marketPostId);

    List<MarketItem> findAllByMarketPostIn(List<MarketPost> marketPosts);

    List<MarketItem> findByMarketPost(MarketPost marketPost);

    void deleteByMarketPost(MarketPost marketPost);
}
