package com.core.ksa.controller;

import com.core.ksa.dto.JobPostCreateRequestDto;
import com.core.ksa.dto.JobPostResponseDto;
import com.core.ksa.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public Page<JobPostResponseDto> getAllJobs(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return jobService.getAllJobs(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostResponseDto> getJobById(
            @PathVariable(name = "id") Long id) {
        JobPostResponseDto job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }

    @PostMapping
    public ResponseEntity<Void> createPost(
            @RequestBody JobPostCreateRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        jobService.createPost(request, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePost(
            @PathVariable(name = "id") Long id,
            @RequestBody JobPostCreateRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        jobService.updatePost(id, request, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable(name = "id") Long id,
            @AuthenticationPrincipal Jwt jwt) {
        jobService.deletePost(id, jwt.getSubject());
        return ResponseEntity.ok().build();
    }
}
