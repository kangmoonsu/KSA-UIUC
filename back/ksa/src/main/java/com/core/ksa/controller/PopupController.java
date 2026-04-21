package com.core.ksa.controller;

import com.core.ksa.dto.PopupCreateRequestDto;
import com.core.ksa.dto.PopupResponseDto;
import com.core.ksa.service.PopupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/popups")
@RequiredArgsConstructor
public class PopupController {

    private final PopupService popupService;

    @GetMapping("/active")
    public ResponseEntity<List<PopupResponseDto>> getActivePopups() {
        return ResponseEntity.ok(popupService.getActivePopups());
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<List<PopupResponseDto>> getAllPopups() {
        return ResponseEntity.ok(popupService.getAllPopups());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Long> createPopup(@RequestBody PopupCreateRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(popupService.createPopup(requestDto, jwt.getSubject()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> updatePopup(@PathVariable(name = "id") Long id,
            @RequestBody PopupCreateRequestDto requestDto) {
        popupService.updatePopup(id, requestDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> deletePopup(@PathVariable(name = "id") Long id) {
        popupService.deletePopup(id);
        return ResponseEntity.ok().build();
    }
}
