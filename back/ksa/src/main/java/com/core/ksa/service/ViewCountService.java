package com.core.ksa.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ViewCountService {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Extracts a unique identifier for the client.
     * Use Clerk User ID if logged in, otherwise use IP address.
     */
    public String getClientIdentifier(HttpServletRequest request, Jwt jwt) {
        if (jwt != null) {
            return jwt.getSubject(); // Clerk User ID
        }

        // Standard way to get client IP behind proxies
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Checks if this view should be counted as a new view.
     * Uses Redis to track views per post per user/IP for 24 hours.
     */
    public boolean shouldIncrementView(String postType, Long postId, String identifier) {
        if (identifier == null)
            return true;

        String key = String.format("view:%s:%d:%s", postType, postId, identifier);

        // Check if key exists
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            return false;
        }

        // Set key with 24 hours expiration
        redisTemplate.opsForValue().set(key, "1", 24, TimeUnit.HOURS);
        return true;
    }
}
