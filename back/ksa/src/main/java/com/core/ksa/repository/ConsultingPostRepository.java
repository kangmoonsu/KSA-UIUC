package com.core.ksa.repository;

import com.core.ksa.domain.ConsultingPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface ConsultingPostRepository
        extends JpaRepository<ConsultingPost, Long>, QuerydslPredicateExecutor<ConsultingPost> {
}
