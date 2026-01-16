package com.core.ksa.repository;

import com.core.ksa.domain.User;
import com.core.ksa.domain.UserActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserActionLogRepository extends JpaRepository<UserActionLog, Long> {
    List<UserActionLog> findAllByUserOrderByCreatedAtDesc(User user);
}
