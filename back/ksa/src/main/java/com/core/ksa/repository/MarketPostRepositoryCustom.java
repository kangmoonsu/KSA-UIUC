package com.core.ksa.repository;

import com.core.ksa.domain.MarketPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MarketPostRepositoryCustom {
    Page<MarketPost> findAllByType(MarketPost.TradeType type, Pageable pageable);
    // Add search if needed
}
