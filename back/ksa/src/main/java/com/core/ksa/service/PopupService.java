package com.core.ksa.service;

import com.core.ksa.domain.Popup;
import com.core.ksa.domain.User;
import com.core.ksa.dto.PopupCreateRequestDto;
import com.core.ksa.dto.PopupResponseDto;
import com.core.ksa.repository.PopupRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PopupService {

    private final PopupRepository popupRepository;
    private final UserRepository userRepository;

    public List<PopupResponseDto> getActivePopups() {
        LocalDateTime chicagoNow = LocalDateTime.now(ZoneId.of("America/Chicago"));
        return popupRepository.findActivePopups(chicagoNow)
                .stream()
                .map(PopupResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<PopupResponseDto> getAllPopups() {
        return popupRepository.findAll()
                .stream()
                .map(PopupResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Long createPopup(PopupCreateRequestDto requestDto, String clerkId) {
        User creator = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDateTime chicagoNow = LocalDateTime.now(ZoneId.of("America/Chicago"));

        // Ensure endDate is also treated relative to Chicago if needed
        // (Assuming frontend sends UTC, but we want to store Chicago wall clock)
        // If the system TZ is already Chicago, LocalDateTime.now() is fine.
        // But to be safe and explicit:
        Popup popup = Popup.builder()
                .title(requestDto.getTitle())
                .imageUrl(requestDto.getImageUrl())
                .linkUrl(requestDto.getLinkUrl())
                .startDate(chicagoNow)
                .endDate(requestDto.getEndDate())
                .isActive(requestDto.isActive())
                .creator(creator)
                .build();

        return popupRepository.save(popup).getId();
    }

    @Transactional
    public void updatePopup(Long id, PopupCreateRequestDto requestDto) {
        Popup popup = popupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Popup not found"));

        popup.setTitle(requestDto.getTitle());
        popup.setImageUrl(requestDto.getImageUrl());
        popup.setLinkUrl(requestDto.getLinkUrl());
        if (requestDto.getStartDate() != null) {
            popup.setStartDate(requestDto.getStartDate());
        }
        popup.setEndDate(requestDto.getEndDate());
        popup.setActive(requestDto.isActive());
    }

    @Transactional
    public void deletePopup(Long id) {
        popupRepository.deleteById(id);
    }
}
