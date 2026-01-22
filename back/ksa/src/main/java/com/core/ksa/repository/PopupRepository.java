package com.core.ksa.repository;

import com.core.ksa.domain.Popup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PopupRepository extends JpaRepository<Popup, Long> {

    @Query("SELECT p FROM Popup p WHERE p.isActive = true AND p.startDate <= :now AND p.endDate >= :now ORDER BY p.startDate DESC")
    List<Popup> findActivePopups(@Param("now") LocalDateTime now);
}
