package com.core.ksa.repository;

import com.core.ksa.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    org.springframework.data.domain.Page<Post> findAllByAuthor(com.core.ksa.domain.User author,
            org.springframework.data.domain.Pageable pageable);
}
