package com.core.ksa.controller;

import com.core.ksa.service.S3ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final S3ImageService s3ImageService;

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = s3ImageService.uploadImage(file);
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", imageUrl);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/multiple")
    public ResponseEntity<Map<String, List<String>>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files) {
        List<String> imageUrls = files.stream()
                .map(s3ImageService::uploadImage)
                .collect(Collectors.toList());

        Map<String, List<String>> response = new HashMap<>();
        response.put("imageUrls", imageUrls);
        return ResponseEntity.ok(response);
    }
}
