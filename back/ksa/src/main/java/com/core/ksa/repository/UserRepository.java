package com.core.ksa.repository;

import com.core.ksa.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByClerkId(String clerkId);

    Optional<User> findByEmail(String email);

    boolean existsByClerkId(String clerkId);

    boolean existsByNickname(String nickname);

    org.springframework.data.domain.Page<User> findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase(
            String email, String nickname, org.springframework.data.domain.Pageable pageable);
}
