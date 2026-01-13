package com.core.ksa.dto;

import com.core.ksa.domain.JobPost;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobPostResponseDto {
    private Long id;
    private String content;
    private String contactInfo;
    private String title;
    private String salary;
    private String location;
    private String writer;
    private Long writerId;
    private String writerClerkId;
    private String createdAt;
    private String status;

    public static JobPostResponseDto from(JobPost post) {
        return JobPostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .salary(post.getSalary())
                .location(post.getLocation())
                .contactInfo(post.getContactInfo())
                .writer(post.getAuthor() != null ? post.getAuthor().getName() : "Unknown")
                .writerId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .writerClerkId(post.getAuthor() != null ? post.getAuthor().getClerkId() : null)
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : "")
                .status(post.getItemStatus())
                .build();
    }
}
