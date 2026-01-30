package com.core.ksa.dto;

import com.core.ksa.domain.Ad;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdDto {
    private Long id;
    private String imageUrl;
    private String targetUrl;
    private Integer orderIndex;
    private boolean active;
    private String creatorNickname;

    public AdDto(Ad ad) {
        this.id = ad.getId();
        this.imageUrl = ad.getImageUrl();
        this.targetUrl = ad.getTargetUrl();
        this.orderIndex = ad.getOrderIndex();
        this.active = ad.isActive();
        this.creatorNickname = ad.getCreator().getNickname() != null ? ad.getCreator().getNickname()
                : ad.getCreator().getName();
    }
}
