package com.core.ksa.repository;

import com.core.ksa.domain.Ad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdRepository extends JpaRepository<Ad, Long> {
    List<Ad> findAllByIsActiveOrderByOrderIndexAsc(boolean isActive);
}
