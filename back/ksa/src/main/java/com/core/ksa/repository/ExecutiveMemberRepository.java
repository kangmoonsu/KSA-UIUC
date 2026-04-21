package com.core.ksa.repository;

import com.core.ksa.domain.ExecutiveMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecutiveMemberRepository extends JpaRepository<ExecutiveMember, Long> {
    List<ExecutiveMember> findByIsCurrentTrueOrderByDisplayOrderAsc();

    List<ExecutiveMember> findByIsCurrentFalseOrderByPeriodDescIdAsc();

    List<ExecutiveMember> findAllByOrderByPeriodDescDisplayOrderAscIdAsc();
}
