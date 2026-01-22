package com.core.ksa.dto;

import com.core.ksa.domain.Popup;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class PopupResponseDto {
    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
    private String creatorNickname;

    public PopupResponseDto(Popup popup) {
        this.id = popup.getId();
        this.title = popup.getTitle();
        this.imageUrl = popup.getImageUrl();
        this.linkUrl = popup.getLinkUrl();
        this.startDate = popup.getStartDate();
        this.endDate = popup.getEndDate();
        this.active = popup.isActive();
        this.creatorNickname = popup.getCreator().getNickname() != null ? popup.getCreator().getNickname()
                : popup.getCreator().getName();
    }
}
