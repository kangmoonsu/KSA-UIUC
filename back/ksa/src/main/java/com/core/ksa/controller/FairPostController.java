package com.core.ksa.controller;

import com.core.ksa.dto.FairPostListResponseDto;
import com.core.ksa.dto.FairPostRequestDto;
import com.core.ksa.dto.FairPostResponseDto;
import com.core.ksa.service.FairPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market/fair")
@RequiredArgsConstructor
public class FairPostController {

    private final FairPostService fairPostService;

    @GetMapping
    public ResponseEntity<FairPostListResponseDto> getPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(fairPostService.getPosts(pageable));
    }

    @PostMapping
    public ResponseEntity<Long> createPost(@RequestBody FairPostRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(fairPostService.createPost(requestDto, jwt.getClaimAsString("sub")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FairPostResponseDto> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(fairPostService.getPost(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePost(@PathVariable Long id, @RequestBody FairPostRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        fairPostService.updatePost(id, requestDto, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        fairPostService.deletePost(id, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }
}
