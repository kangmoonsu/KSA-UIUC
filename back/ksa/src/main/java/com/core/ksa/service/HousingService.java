package com.core.ksa.service;

import com.core.ksa.dto.HousingPostResponseDto;
import com.core.ksa.dto.HousingPostCreateRequestDto;
import com.core.ksa.domain.HousingPost;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class HousingService {

        private final com.core.ksa.repository.UserRepository userRepository;
        private final com.core.ksa.repository.HousingPostRepository housingPostRepository;

        @Transactional(readOnly = true)
        public org.springframework.data.domain.Page<HousingPostResponseDto> getAllHousings(
                        org.springframework.data.domain.Pageable pageable) {
                return housingPostRepository.findAll(pageable)
                                .map(HousingPostResponseDto::from);
        }

        @Transactional(readOnly = true)
        public HousingPostResponseDto getHousingById(Long id) {
                com.core.ksa.domain.HousingPost post = housingPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Housing post not found"));
                return HousingPostResponseDto.from(post);
        }

        public void createPost(com.core.ksa.dto.HousingPostCreateRequestDto request, String clerkId) {
                com.core.ksa.domain.User user = userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.core.ksa.domain.HousingPost post = com.core.ksa.domain.HousingPost.builder()
                                .title(request.getTitle())
                                .content(request.getDetail()) // Use detail for Post.content too
                                .detail(request.getDetail()) // And HousingPost.detail
                                .author(user)
                                .price(request.getPrice())
                                .address(request.getLocation())
                                .housingType(request.getHousingType())
                                .imageUrls(request.getImageUrls())
                                .build();
                housingPostRepository.save(post);
        }

        public void updatePost(Long id, HousingPostCreateRequestDto request, String clerkId) {
                HousingPost post = housingPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Housing post not found"));

                // Verify ownership
                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                // Update fields
                post.setTitle(request.getTitle());
                post.setContent(request.getContent());
                post.setPrice(request.getPrice());
                post.setAddress(request.getLocation());
                post.setHousingType(request.getHousingType());
                post.setItemStatus(request.getStatus());
                post.setDetail(request.getDetail());

                // Update images
                if (request.getImageUrls() != null) {
                        post.getImageUrls().clear();
                        post.getImageUrls().addAll(request.getImageUrls());
                }

                housingPostRepository.save(post);
        }

        public void deletePost(Long id, String clerkId) {
                HousingPost post = housingPostRepository.findById(id)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "Housing post not found"));

                if (!post.getAuthor().getClerkId().equals(clerkId)) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.FORBIDDEN, "You are not the owner");
                }

                housingPostRepository.delete(post);
        }
}
