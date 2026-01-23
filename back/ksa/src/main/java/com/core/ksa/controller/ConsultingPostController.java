package com.core.ksa.controller;

import com.core.ksa.dto.ConsultingPostListResponseDto;
import com.core.ksa.dto.ConsultingPostRequestDto;
import com.core.ksa.dto.ConsultingPostResponseDto;
import com.core.ksa.service.ConsultingPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/job/consulting")
@RequiredArgsConstructor
public class ConsultingPostController {

    private final ConsultingPostService consultingPostService;

    @GetMapping
    public ResponseEntity<ConsultingPostListResponseDto> getPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(consultingPostService.getPosts(pageable));
    }

    @PostMapping
    public ResponseEntity<Long> createPost(@RequestBody ConsultingPostRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(consultingPostService.createPost(requestDto, jwt.getClaimAsString("sub")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultingPostResponseDto> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(consultingPostService.getPost(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePost(@PathVariable Long id, @RequestBody ConsultingPostRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        consultingPostService.updatePost(id, requestDto, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        consultingPostService.deletePost(id, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }
}
