package com.core.ksa.service;

import com.core.ksa.dto.CarPostCreateRequestDto;
import com.core.ksa.dto.CarPostResponseDto;
import com.core.ksa.domain.User;
import com.core.ksa.domain.CarPost;
import com.core.ksa.repository.CarPostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CarService {

        private final CarPostRepository carPostRepository;
        private final UserRepository userRepository;

        @Transactional(readOnly = true)
        public org.springframework.data.domain.Page<CarPostResponseDto> getAllCars(
                        org.springframework.data.domain.Pageable pageable) {
                return carPostRepository.findAll(pageable)
                                .map(CarPostResponseDto::from);
        }

        @Transactional(readOnly = true)
        public CarPostResponseDto getCarById(Long id) {
                CarPost post = carPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Car post not found"));
                return CarPostResponseDto.from(post);
        }

        public void createPost(CarPostCreateRequestDto request, String clerkId) {
                User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                CarPost post = CarPost.builder()
                                .title(request.getTitle())
                                .content(request.getContent())
                                .author(user)
                                .price(request.getPrice())
                                .modelName(request.getModelName())
                                .year(request.getYear())
                                .mileage(request.getMileage())
                                .imageUrls(request.getImageUrls())
                                .build();
                carPostRepository.save(post);
        }

        public void updatePost(Long id, CarPostCreateRequestDto request, String clerkId) {
                CarPost post = carPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Car post not found"));

                // Verify ownership
                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                // Update fields
                post.setTitle(request.getTitle());
                post.setContent(request.getContent());
                post.setPrice(request.getPrice());
                post.setModelName(request.getModelName());
                post.setYear(request.getYear());
                post.setMileage(request.getMileage());
                post.setItemStatus(request.getStatus());

                // Update images
                if (request.getImageUrls() != null) {
                        post.getImageUrls().clear();
                        post.getImageUrls().addAll(request.getImageUrls());
                }

                carPostRepository.save(post);
        }

        public void deletePost(Long id, String clerkId) {
                CarPost post = carPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND, "Car post not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                carPostRepository.delete(post);
        }
}
