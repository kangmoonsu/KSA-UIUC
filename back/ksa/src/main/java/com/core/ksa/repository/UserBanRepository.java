package com.core.ksa.repository;

import com.core.ksa.domain.User;
import com.core.ksa.domain.UserBan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserBanRepository extends JpaRepository<UserBan, Long> {
    Optional<UserBan> findByUser(User user);

    void deleteByUser(User user);
}
