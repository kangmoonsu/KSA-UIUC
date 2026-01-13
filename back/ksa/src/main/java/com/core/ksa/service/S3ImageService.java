package com.core.ksa.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import io.awspring.cloud.s3.S3Resource;
import io.awspring.cloud.s3.S3Template;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3ImageService {

    private final S3Template s3Template;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    public String uploadImage(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String key = UUID.randomUUID().toString() + "." + extension;

        try {
            S3Resource s3Resource = s3Template.upload(bucketName, key, file.getInputStream());
            return s3Resource.getURL().toString();
        } catch (IOException e) {
            log.error("Failed to upload image to S3", e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}
