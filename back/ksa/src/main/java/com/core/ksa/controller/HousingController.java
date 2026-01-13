package com.core.ksa.controller;

import com.core.ksa.dto.HousingPostCreateRequestDto;
import com.core.ksa.dto.HousingPostResponseDto;
import com.core.ksa.service.HousingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    public Page<HousingPostResponseDto> getAllHousings(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return housingService.getAllHousings(pageable);
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
