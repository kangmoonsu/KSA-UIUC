package com.core.ksa.repository;

import com.core.ksa.domain.MarketPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketPostRepository extends JpaRepository<MarketPost, Long>, MarketPostRepositoryCustom {
}
