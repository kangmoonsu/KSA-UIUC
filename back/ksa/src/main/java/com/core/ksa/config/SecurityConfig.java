package com.core.ksa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    private final BanCheckFilter banCheckFilter;
    private final com.core.ksa.repository.UserRepository userRepository;

    public SecurityConfig(BanCheckFilter banCheckFilter, com.core.ksa.repository.UserRepository userRepository) {
        this.banCheckFilter = banCheckFilter;
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/ws-chat/**", "/api/users/webhook", "/error", "/api/contact")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/flea/**", "/api/cars/**",
                                "/api/housings/**", "/api/jobs/**", "/api/free/**", "/api/news/**",
                                "/api/market/recruit/**", "/api/job/consulting/**", "/api/popups/active",
                                "/api/executives/current", "/api/executives/past", "/api/greetings",
                                "/api/carousel")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/contact").permitAll()
                        .requestMatchers("/api/users/admin/**").hasAnyAuthority("ADMIN", "MASTER")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {
                    jwt.jwtAuthenticationConverter(jwt1 -> {
                        String clerkId = jwt1.getSubject();
                        java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
                        userRepository.findByClerkId(clerkId).ifPresent(user -> {
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                    user.getRole().name()));
                        });
                        return new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken(
                                jwt1, authorities);
                    });
                }))
                .addFilterAfter(banCheckFilter,
                        org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "https://illinoisksa.cloud",
                "https://www.illinoisksa.cloud",
                "https://api.illinoisksa.cloud",
                "https://ksa-uiuc.vercel.app",
                "https://*.vercel.app"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin",
                "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
