package com.core.ksa.controller;

import com.core.ksa.service.GreetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/greetings")
@RequiredArgsConstructor
public class GreetingController {

    private final GreetingService service;

    @GetMapping
    public ResponseEntity<String> getGreeting() {
        return ResponseEntity.ok(service.getGreeting());
    }

    @PutMapping
    @PreAuthorize("hasAuthority('MASTER')")
    public ResponseEntity<Void> updateGreeting(@RequestBody String content) {
        service.updateGreeting(content);
        return ResponseEntity.ok().build();
    }
}
