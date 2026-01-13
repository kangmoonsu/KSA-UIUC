package com.core.ksa.controller;

import com.core.ksa.dto.UserDto;
import com.core.ksa.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class WebhookController {

    private final UserService userService;
    private final ObjectMapper objectMapper;

    @Value("${clerk.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleClerkWebhook(
            @RequestHeader Map<String, String> headers,
            @RequestBody String payload) {
        // Verify Webhook manually
        String svixId = headers.get("svix-id");
        String svixTimestamp = headers.get("svix-timestamp");
        String svixSignature = headers.get("svix-signature");

        if (svixId == null || svixTimestamp == null || svixSignature == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing svix headers");
        }

        try {
            verifySignature(payload, svixId, svixTimestamp, svixSignature, webhookSecret);
        } catch (Exception e) {
            log.error("Webhook Verification Failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String type = root.path("type").asText();
            JsonNode data = root.path("data");

            if ("user.created".equals(type) || "user.updated".equals(type)) {
                String clerkId = data.path("id").asText();
                String email = "";
                if (data.has("email_addresses") && data.path("email_addresses").isArray()
                        && data.path("email_addresses").size() > 0) {
                    email = data.path("email_addresses").get(0).path("email_address").asText();
                }

                String firstName = data.path("first_name").asText();
                String lastName = data.path("last_name").asText();
                String imageUrl = data.path("image_url").asText();
                String name = (firstName + " " + lastName).trim();
                if (name.isEmpty())
                    name = "User";

                UserDto.SyncRequest req = new UserDto.SyncRequest();
                req.setClerkId(clerkId);
                req.setEmail(email);
                req.setName(name);
                req.setProfileImageUrl(imageUrl);

                userService.syncUser(req);
                log.info("Synced user: {}", clerkId);
            }

            return ResponseEntity.ok("Received");
        } catch (Exception e) {
            log.error("Failed to process webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Processing error");
        }
    }

    private void verifySignature(String payload, String svixId, String svixTimestamp, String svixSignature,
            String secret) throws Exception {
        String[] signatures = svixSignature.split(" ");
        String toSign = svixId + "." + svixTimestamp + "." + payload;

        // Remove "whsec_" prefix if present
        if (secret.startsWith("whsec_")) {
            secret = secret.substring(6);
        }

        byte[] secretBytes = java.util.Base64.getDecoder().decode(secret);
        javax.crypto.Mac hmac = javax.crypto.Mac.getInstance("HmacSHA256");
        hmac.init(new javax.crypto.spec.SecretKeySpec(secretBytes, "HmacSHA256"));
        byte[] hash = hmac.doFinal(toSign.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        String computedSignature = java.util.Base64.getEncoder().encodeToString(hash);

        boolean valid = false;
        for (String sig : signatures) {
            // Svix signatures are often just "v1,signature"
            if (sig.equals("v1," + computedSignature)) {
                valid = true;
                break;
            }
        }

        // Fallback or exact check
        if (!valid && svixSignature.contains(computedSignature)) {
            valid = true;
        }

        if (!valid) {
            throw new SecurityException("Invalid signature");
        }
    }
}
