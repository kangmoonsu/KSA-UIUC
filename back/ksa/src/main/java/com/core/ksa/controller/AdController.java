package com.core.ksa.controller;

import com.core.ksa.dto.AdDto;
import com.core.ksa.service.AdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ads")
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;

    @GetMapping("/active")
    public ResponseEntity<List<AdDto>> getActiveAds() {
        return ResponseEntity.ok(adService.getActiveAds());
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<List<AdDto>> getAllAds() {
        return ResponseEntity.ok(adService.getAllAds());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Long> createAd(@RequestBody AdDto adDto,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(adService.createAd(adDto, jwt.getSubject()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> updateAd(@PathVariable(name = "id") Long id,
            @RequestBody AdDto adDto) {
        adService.updateAd(id, adDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> deleteAd(@PathVariable(name = "id") Long id) {
        adService.deleteAd(id);
        return ResponseEntity.ok().build();
    }
}
