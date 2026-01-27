package com.core.ksa.service;

import com.core.ksa.domain.CarouselImage;
import com.core.ksa.repository.CarouselImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarouselImageService {

    private final CarouselImageRepository carouselImageRepository;
    private final S3ImageService s3ImageService;

    public List<CarouselImage> getAllImages() {
        return carouselImageRepository.findAllByOrderByOrderIndexAsc();
    }

    @Transactional
    public CarouselImage addImage(MultipartFile file) {
        String imageUrl = s3ImageService.uploadImage(file);

        // Next order index
        int nextIndex = carouselImageRepository.findAll()
                .stream()
                .mapToInt(CarouselImage::getOrderIndex)
                .max()
                .orElse(-1) + 1;

        CarouselImage carouselImage = CarouselImage.builder()
                .imageUrl(imageUrl)
                .orderIndex(nextIndex)
                .build();

        return carouselImageRepository.save(carouselImage);
    }

    @Transactional
    public void deleteImage(Long id) {
        carouselImageRepository.findById(id).ifPresent(img -> {
            s3ImageService.deleteImage(img.getImageUrl());
            carouselImageRepository.delete(img);
        });
    }

    @Transactional
    public void updateOrder(List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            Long id = ids.get(i);
            int finalI = i;
            carouselImageRepository.findById(id).ifPresent(img -> {
                img.setOrderIndex(finalI);
            });
        }
    }
}
