package com.core.ksa.controller;

import com.core.ksa.dto.HousingPostCreateRequestDto;
import com.core.ksa.dto.HousingPostResponseDto;
import com.core.ksa.service.HousingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/housings")
@RequiredArgsConstructor
public class HousingController {

    private final HousingService housingService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<HousingPostResponseDto>> getHousings(
            @org.springframework.data.web.PageableDefault(size = 10) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(housingService.getAllHousings(pageable));
    }

    @GetMapping("/latest")
    public ResponseEntity<java.util.List<HousingPostResponseDto>> getLatestPosts(
            @RequestParam(name = "limit", defaultValue = "4") int limit) {
        return ResponseEntity.ok(housingService.getLatestPosts(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HousingPostResponseDto> getHousingById(
            @PathVariable(name = "id") Long id) {
        HousingPostResponseDto housing = housingService.getHousingById(id);
        return ResponseEntity.ok(housing);
    }

    @PostMapping
    public void createPost(
            @RequestBody HousingPostCreateRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        housingService.createPost(request, jwt.getSubject());
    }

    @PutMapping("/{id}")
    public void updatePost(
            @PathVariable(name = "id") Long id,
            @RequestBody HousingPostCreateRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        housingService.updatePost(id, request, jwt.getSubject());
    }

    @DeleteMapping("/{id}")
    public void deletePost(
            @PathVariable(name = "id") Long id,
            @AuthenticationPrincipal Jwt jwt) {
        housingService.deletePost(id, jwt.getSubject());
    }
}
