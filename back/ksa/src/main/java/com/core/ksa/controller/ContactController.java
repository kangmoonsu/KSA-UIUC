package com.core.ksa.controller;

import com.core.ksa.dto.ContactRequest;
import com.core.ksa.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<String> sendContact(@ModelAttribute ContactRequest request) {
        try {
            emailService.sendContactEmail(
                    request.getTitle(),
                    request.getEmail(),
                    request.getContent(),
                    request.getFile());
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            log.error("Failed to send contact email", e);
            return ResponseEntity.internalServerError().body("Failed to send email: " + e.getMessage());
        }
    }
}
