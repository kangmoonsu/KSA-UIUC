package com.core.ksa.repository;

import com.core.ksa.domain.CarPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarPostRepository extends JpaRepository<CarPost, Long> {
}
