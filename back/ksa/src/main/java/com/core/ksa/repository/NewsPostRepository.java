package com.core.ksa.repository;

import com.core.ksa.domain.NewsPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface NewsPostRepository extends JpaRepository<NewsPost, Long> {

    @Query("select n from NewsPost n join fetch n.author order by n.id desc")
    Page<NewsPost> findAllWithAuthor(Pageable pageable);
}
