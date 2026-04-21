package com.core.ksa.repository;

import com.core.ksa.domain.FairPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface FairPostRepository
                extends JpaRepository<FairPost, Long>, QuerydslPredicateExecutor<FairPost> {
}
