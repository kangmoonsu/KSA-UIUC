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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    public void deleteImage(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            return;
        }

        try {
            // Extract key from URL
            // Support comma separated urls
            if (imageUrl.contains(",")) {
                for (String url : imageUrl.split(",")) {
                    deleteImage(url.trim());
                }
                return;
            }

            // Example URL: https://bucket-name.s3.region.amazonaws.com/key
            String[] parts = imageUrl.split("/");
            String key = parts[parts.length - 1];

            s3Template.deleteObject(bucketName, key);
        } catch (Exception e) {
            log.warn("Failed to delete image from S3: {}", imageUrl, e);
        }
    }

    public void deleteImagesFromHtml(String html) {
        if (!StringUtils.hasText(html)) {
            return;
        }

        // Pattern for S3 URLs. Adjust based on your bucket URL format.
        // Assuming urls like: https://[bucket].s3.[region].amazonaws.com/[key]
        Pattern pattern = Pattern.compile("https://[^/]*" + Pattern.quote(bucketName) + "[^/ \"]*/([^/ \"]+)");
        Matcher matcher = pattern.matcher(html);

        while (matcher.find()) {
            String imageUrl = matcher.group(0);
            deleteImage(imageUrl);
        }
    }
}
