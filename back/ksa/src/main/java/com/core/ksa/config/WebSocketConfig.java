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
        // Enable a simple memory-based message broker to carry the greeting messages
        // back to the client on destinations prefixed with "/topic" and "/queue".
        config.enableSimpleBroker("/topic", "/queue");
        // Defines the prefix for messages that are bound for methods annotated with
        // @MessageMapping.
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registers the "/ws-stomp" endpoint, enabling SockJS fallback options so that
        // alternate transports can be used if WebSocket is not available.
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("http://localhost:5173", "https://*.illinoisksa.org")
                .withSockJS();
    }
}
