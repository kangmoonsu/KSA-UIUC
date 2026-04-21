package com.core.ksa.controller;

import com.core.ksa.dto.UserDto;
import com.core.ksa.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto.UserProfileResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        return ResponseEntity.ok(userService.getUserProfile(clerkId));
    }

    @PutMapping("/me/nickname")
    public ResponseEntity<Void> updateNickname(@AuthenticationPrincipal Jwt jwt,
            @RequestBody UserDto.UpdateNicknameRequest request) {
        String clerkId = jwt.getSubject();
        userService.updateNickname(clerkId, request.getNickname());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam(name = "nickname") String nickname) {
        return ResponseEntity.ok(userService.checkNickname(nickname));
    }

    @GetMapping("/me/posts")
    public ResponseEntity<org.springframework.data.domain.Page<com.core.ksa.dto.MyPostResponseDto>> getMyPosts(
            @AuthenticationPrincipal Jwt jwt,
            @org.springframework.data.web.PageableDefault(size = 5, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        String clerkId = jwt.getSubject();
        return ResponseEntity.ok(userService.getMyPosts(clerkId, pageable));
    }

    // Admin Endpoints
    @GetMapping("/admin/users")
    public ResponseEntity<org.springframework.data.domain.Page<UserDto.UserAdminResponse>> getAllUsers(
            @RequestParam(name = "query", required = false) String query,
            @org.springframework.data.web.PageableDefault(size = 10) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(query, pageable));
    }

    @GetMapping("/admin/users/{clerkId}")
    public ResponseEntity<UserDto.UserDetailResponse> getUserDetail(@PathVariable(name = "clerkId") String clerkId) {
        return ResponseEntity.ok(userService.getUserDetail(clerkId));
    }

    @PostMapping("/admin/users/{clerkId}/ban")
    public ResponseEntity<Void> banUser(@AuthenticationPrincipal Jwt jwt,
            @PathVariable(name = "clerkId") String clerkId,
            @RequestBody UserDto.BanRequest request) {
        userService.banUser(clerkId, request, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/users/{clerkId}/unban")
    public ResponseEntity<Void> unbanUser(@AuthenticationPrincipal Jwt jwt,
            @PathVariable(name = "clerkId") String clerkId) {
        userService.unbanUser(clerkId, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/users/{clerkId}/promote")
    public ResponseEntity<Void> promoteToAdmin(@AuthenticationPrincipal Jwt jwt,
            @PathVariable(name = "clerkId") String clerkId) {
        userService.promoteToAdmin(clerkId, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/users/{clerkId}/demote")
    public ResponseEntity<Void> demoteToUser(@AuthenticationPrincipal Jwt jwt,
            @PathVariable(name = "clerkId") String clerkId) {
        userService.demoteToUser(clerkId, jwt.getSubject());
        return ResponseEntity.ok().build();
    }
}
