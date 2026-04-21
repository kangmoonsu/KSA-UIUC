package com.core.ksa.config;

import com.core.ksa.domain.User;
import com.core.ksa.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class BanCheckFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String clerkId = jwt.getSubject();

            // Skip check for sync endpoint as it's needed to detect ban on login
            String path = request.getRequestURI();
            if (!path.contains("/api/auth/sync")) {
                User user = userRepository.findByClerkId(clerkId).orElse(null);
                if (user != null && user.isBanned()) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter()
                            .write("{\"error\": \"BANNED\", \"message\": \"Your account has been banned.\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
