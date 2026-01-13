package com.core.ksa.service;

import com.core.ksa.dto.JobPostCreateRequestDto;
import com.core.ksa.dto.JobPostResponseDto;
import com.core.ksa.domain.User;
import com.core.ksa.domain.JobPost;
import com.core.ksa.repository.JobPostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class JobService {

    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<JobPostResponseDto> getAllJobs(
            org.springframework.data.domain.Pageable pageable) {
        return jobPostRepository.findAll(pageable)
                .map(JobPostResponseDto::from);
    }

    @Transactional(readOnly = true)
    public JobPostResponseDto getJobById(Long id) {
        JobPost post = jobPostRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Job post not found"));
        return JobPostResponseDto.from(post);
    }

    public void createPost(JobPostCreateRequestDto request, String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobPost post = JobPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(user)
                .salary(request.getSalary())
                .location(request.getLocation())
                .contactInfo(request.getContactInfo())
                .itemStatus(request.getStatus())
                .build();
        jobPostRepository.save(post);
    }

    public void updatePost(Long id, JobPostCreateRequestDto request, String clerkId) {
        JobPost post = jobPostRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Job post not found"));

        if (!post.getAuthor().getClerkId().equals(clerkId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setSalary(request.getSalary());
        post.setLocation(request.getLocation());
        post.setContactInfo(request.getContactInfo());
        post.setItemStatus(request.getStatus());

        jobPostRepository.save(post);
    }

    public void deletePost(Long id, String clerkId) {
        JobPost post = jobPostRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Job post not found"));

        if (!post.getAuthor().getClerkId().equals(clerkId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
        }

        jobPostRepository.delete(post);
    }
}
