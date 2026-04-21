package com.core.ksa.controller;

import com.core.ksa.dto.CarouselImageResponseDto;
import com.core.ksa.service.CarouselImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carousel")
@RequiredArgsConstructor
public class CarouselImageController {

    private final CarouselImageService carouselImageService;

    @GetMapping
    public ResponseEntity<List<CarouselImageResponseDto>> getAllImages() {
        return ResponseEntity.ok(carouselImageService.getAllImages().stream()
                .map(CarouselImageResponseDto::new)
                .collect(Collectors.toList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<CarouselImageResponseDto> addImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(new CarouselImageResponseDto(carouselImageService.addImage(file)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> deleteImage(@PathVariable(name = "id") Long id) {
        carouselImageService.deleteImage(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/order")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> updateOrder(@RequestBody List<Long> ids) {
        carouselImageService.updateOrder(ids);
        return ResponseEntity.ok().build();
    }
}
