package com.core.ksa.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Destination prefix for messages from server to client
        config.enableSimpleBroker("/topic", "/queue");
        // Destination prefix for messages from client to server
        config.setApplicationDestinationPrefixes("/app");
        // User specific destination prefix
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint for connecting to WebSocket
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // In production, restrict this to your domain
                .withSockJS();
    }
}
