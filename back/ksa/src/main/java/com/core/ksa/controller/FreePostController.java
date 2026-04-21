package com.core.ksa.controller;

import com.core.ksa.dto.FreePostCreateRequestDto;
import com.core.ksa.dto.FreePostResponseDto;
import com.core.ksa.service.FreePostService;
import com.core.ksa.service.ViewCountService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/free")
@RequiredArgsConstructor
public class FreePostController {

    private final FreePostService freePostService;
    private final ViewCountService viewCountService;

    @PostMapping
    public ResponseEntity<Long> createPost(@RequestBody FreePostCreateRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(freePostService.createPost(requestDto, jwt.getSubject()));
    }

    @GetMapping
    public ResponseEntity<com.core.ksa.dto.FreeBoardListResponseDto> getPosts(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(freePostService.getPosts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FreePostResponseDto> getPost(@PathVariable(name = "id") Long id,
            HttpServletRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        String identifier = viewCountService.getClientIdentifier(request, jwt);
        return ResponseEntity.ok(freePostService.getPost(id, identifier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePost(@PathVariable(name = "id") Long id,
            @RequestBody FreePostCreateRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        freePostService.updatePost(id, requestDto, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable(name = "id") Long id,
            @AuthenticationPrincipal Jwt jwt) {
        freePostService.deletePost(id, jwt.getSubject());
        return ResponseEntity.ok().build();
    }
}
