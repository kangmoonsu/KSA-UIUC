package com.core.ksa.controller;

import com.core.ksa.dto.NewsBoardListResponseDto;
import com.core.ksa.dto.NewsPostCreateRequestDto;
import com.core.ksa.dto.NewsPostResponseDto;
import com.core.ksa.service.NewsPostService;
import com.core.ksa.service.ViewCountService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsPostController {

    private final NewsPostService newsPostService;
    private final ViewCountService viewCountService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Long> createPost(@RequestBody NewsPostCreateRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(newsPostService.createPost(requestDto, jwt.getSubject()));
    }

    @GetMapping
    public ResponseEntity<NewsBoardListResponseDto> getPosts(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(newsPostService.getPosts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsPostResponseDto> getPost(@PathVariable(name = "id") Long id,
            HttpServletRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String identifier = viewCountService.getClientIdentifier(request, jwt);
        return ResponseEntity.ok(newsPostService.getPost(id, identifier));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> updatePost(@PathVariable(name = "id") Long id,
            @RequestBody NewsPostCreateRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        newsPostService.updatePost(id, requestDto, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> deletePost(@PathVariable(name = "id") Long id,
            @AuthenticationPrincipal Jwt jwt) {
        newsPostService.deletePost(id, jwt.getSubject());
        return ResponseEntity.ok().build();
    }
}
