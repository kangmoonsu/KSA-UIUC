package com.core.ksa.controller;

import com.core.ksa.dto.UserDto;
import com.core.ksa.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/sync")
    public ResponseEntity<?> syncUser(@RequestBody UserDto.SyncRequest request, @AuthenticationPrincipal Jwt jwt) {
        // Optionally verify jwt.getSubject() matches request.getClerkId() for security
        if (jwt != null && !jwt.getSubject().equals(request.getClerkId())) {
            return ResponseEntity.status(403).body("Clerk ID mismatch");
        }

        userService.syncUser(request);
        return ResponseEntity.ok().build();
    }
}
