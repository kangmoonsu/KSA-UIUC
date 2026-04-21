package com.core.ksa.controller;

import com.core.ksa.dto.MarketPostCreateRequestDto;
import com.core.ksa.dto.MarketPostResponseDto;
import com.core.ksa.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flea")
@RequiredArgsConstructor
public class FleaController {

    private final MarketService marketService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<com.core.ksa.dto.MarketPostResponseDto>> getPosts(
            @RequestParam(name = "type", required = false) com.core.ksa.domain.MarketPost.TradeType type,
            @org.springframework.data.web.PageableDefault(size = 10) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(marketService.getMarketPosts(type, pageable));
    }

    @GetMapping("/latest")
    public ResponseEntity<java.util.List<com.core.ksa.dto.MarketPostResponseDto>> getLatestPosts(
            @RequestParam(name = "limit", defaultValue = "4") int limit) {
        return ResponseEntity.ok(marketService.getLatestPosts(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketPostResponseDto> getFleaById(
            @PathVariable(name = "id") Long id) {
        MarketPostResponseDto flea = marketService.getMarketPost(id);
        return ResponseEntity.ok(flea);
    }

    @PostMapping
    public ResponseEntity<Long> createPost(
            @RequestBody MarketPostCreateRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        Long postId = marketService.createMarketPost(request, jwt.getSubject());
        return ResponseEntity.ok(postId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePost(
            @PathVariable(name = "id") Long id,
            @RequestBody MarketPostCreateRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        marketService.updateMarketPost(id, request, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable(name = "id") Long id,
            @AuthenticationPrincipal Jwt jwt) {
        marketService.deleteMarketPost(id, jwt.getSubject());
        return ResponseEntity.ok().build();
    }
}
