package com.core.ksa.controller;

import com.core.ksa.dto.RecruitPostListResponseDto;
import com.core.ksa.dto.RecruitPostRequestDto;
import com.core.ksa.dto.RecruitPostResponseDto;
import com.core.ksa.service.RecruitPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market/recruit")
@RequiredArgsConstructor
public class RecruitPostController {

    private final RecruitPostService recruitPostService;

    @GetMapping
    public ResponseEntity<RecruitPostListResponseDto> getPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(recruitPostService.getPosts(pageable));
    }

    @PostMapping
    public ResponseEntity<Long> createPost(@RequestBody RecruitPostRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(recruitPostService.createPost(requestDto, jwt.getClaimAsString("sub")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecruitPostResponseDto> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(recruitPostService.getPost(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePost(@PathVariable Long id, @RequestBody RecruitPostRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        recruitPostService.updatePost(id, requestDto, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        recruitPostService.deletePost(id, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }
}
