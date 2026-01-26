package com.core.ksa.dto;

import com.core.ksa.domain.ConsultingPost;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ConsultingPostResponseDto {
    private Long id;
    private String title;
    private String content;
    
    private String writer;
    private Long writerId;
    private String writerClerkId;
    
    private int viewCount;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    
    private LocalDateTime eventDate;
    private String location;

    public ConsultingPostResponseDto(ConsultingPost entity) {
        this.id = entity.getId();
        this.title = entity.getTitle();
        this.content = entity.getContent();
        
        if (entity.getAuthor() != null) {
            this.writer = entity.getAuthor().getNickname() != null ? entity.getAuthor().getNickname() : entity.getAuthor().getName();
            this.writerId = entity.getAuthor().getId();
            this.writerClerkId = entity.getAuthor().getClerkId();
        } else {
            this.writer = "Unknown";
        }

        this.viewCount = entity.getViewCount();
        this.createdDate = entity.getCreatedAt();
        this.modifiedDate = entity.getUpdatedAt();
        
        this.eventDate = entity.getEventDate();
        this.location = entity.getLocation();
    }
}
