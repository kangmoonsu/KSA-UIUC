package com.core.ksa.controller;

import com.core.ksa.dto.CommentRequestDto;
import com.core.ksa.dto.CommentResponseDto;
import com.core.ksa.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Void> createComment(
            @PathVariable Long postId,
            @RequestBody CommentRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        commentService.createComment(postId, requestDto, jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponseDto>> getComments(
            @PathVariable Long postId,
            @AuthenticationPrincipal Jwt jwt) {
        // Jwt can be null if public access is allowed (configured in SecurityConfig)
        String clerkId = (jwt != null) ? jwt.getSubject() : null;
        return ResponseEntity.ok(commentService.getComments(postId, clerkId));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal Jwt jwt) {
        commentService.deleteComment(commentId, jwt.getSubject());
        return ResponseEntity.ok().build();
    }
}
