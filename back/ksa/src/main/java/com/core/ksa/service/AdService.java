package com.core.ksa.service;

import com.core.ksa.domain.Ad;
import com.core.ksa.domain.User;
import com.core.ksa.dto.AdDto;
import com.core.ksa.repository.AdRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdService {

    private final AdRepository adRepository;
    private final UserRepository userRepository;
    private final S3ImageService s3ImageService;

    public List<AdDto> getAllAds() {
        return adRepository.findAll()
                .stream()
                .map(AdDto::new)
                .collect(Collectors.toList());
    }

    public List<AdDto> getActiveAds() {
        return adRepository.findAllByIsActiveOrderByOrderIndexAsc(true)
                .stream()
                .map(AdDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Long createAd(AdDto adDto, String clerkId) {
        User creator = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Ad ad = Ad.builder()
                .imageUrl(adDto.getImageUrl())
                .targetUrl(adDto.getTargetUrl())
                .orderIndex(adDto.getOrderIndex())
                .isActive(adDto.isActive())
                .creator(creator)
                .build();

        return adRepository.save(ad).getId();
    }

    @Transactional
    public void updateAd(Long id, AdDto adDto) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ad not found"));

        if (ad.getImageUrl() != null && !ad.getImageUrl().equals(adDto.getImageUrl())) {
            s3ImageService.deleteImage(ad.getImageUrl());
        }

        ad.setImageUrl(adDto.getImageUrl());
        ad.setTargetUrl(adDto.getTargetUrl());
        ad.setOrderIndex(adDto.getOrderIndex());
        ad.setActive(adDto.isActive());
    }

    @Transactional
    public void deleteAd(Long id) {
        adRepository.findById(id).ifPresent(ad -> {
            if (ad.getImageUrl() != null) {
                s3ImageService.deleteImage(ad.getImageUrl());
            }
            adRepository.delete(ad);
        });
    }
}
