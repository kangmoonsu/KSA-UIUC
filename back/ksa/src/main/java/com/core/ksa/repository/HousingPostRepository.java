package com.core.ksa.repository;

import com.core.ksa.domain.HousingPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HousingPostRepository extends JpaRepository<HousingPost, Long> {
}
