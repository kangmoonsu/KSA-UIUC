package com.core.ksa.repository;

import com.core.ksa.domain.FreePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FreePostRepository extends JpaRepository<FreePost, Long> {

    @Query("SELECT f FROM FreePost f ORDER BY f.isNotice DESC, f.createdAt DESC")
    Page<FreePost> findAllOrdered(Pageable pageable);

    java.util.List<FreePost> findAllByIsNoticeTrueOrderByCreatedAtDesc();

    Page<FreePost> findAllByIsNoticeFalseOrderByCreatedAtDesc(Pageable pageable);
}
