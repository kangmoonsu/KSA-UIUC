package com.core.ksa.controller;

import com.core.ksa.dto.CarPostCreateRequestDto;
import com.core.ksa.dto.CarPostResponseDto;
import com.core.ksa.service.CarService;
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
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @GetMapping
    public Page<CarPostResponseDto> getAllCars(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return carService.getAllCars(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarPostResponseDto> getCarById(
            @PathVariable(name = "id") Long id) {
        CarPostResponseDto car = carService.getCarById(id);
        return ResponseEntity.ok(car);
    }

    @PostMapping
    public ResponseEntity<Void> createPost(
            @RequestBody CarPostCreateRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        carService.createPost(request, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePost(
            @PathVariable(name = "id") Long id,
            @RequestBody CarPostCreateRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        carService.updatePost(id, request, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable(name = "id") Long id,
            @AuthenticationPrincipal Jwt jwt) {
        carService.deletePost(id, jwt.getSubject());
        return ResponseEntity.ok().build();
    }
}
