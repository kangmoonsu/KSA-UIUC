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
}
