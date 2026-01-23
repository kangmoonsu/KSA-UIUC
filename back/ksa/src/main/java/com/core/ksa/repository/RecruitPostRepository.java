package com.core.ksa.repository;

import com.core.ksa.domain.RecruitPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;

public interface RecruitPostRepository
        extends JpaRepository<RecruitPost, Long>, QuerydslPredicateExecutor<RecruitPost> {

    // Example custom query if needed to filter by role
    @Query("SELECT p FROM RecruitPost p JOIN p.roles r WHERE lower(r) LIKE lower(concat('%', :role, '%'))")
    Page<RecruitPost> findByRoleContaining(@Param("role") String role, Pageable pageable);
}
