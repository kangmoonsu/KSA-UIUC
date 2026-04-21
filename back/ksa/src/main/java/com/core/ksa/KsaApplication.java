package com.core.ksa;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.TimeZone;

@EnableJpaAuditing
@SpringBootApplication
public class KsaApplication {

    @PostConstruct
    public void init() {
        // Set default timezone to Chicago
        TimeZone.setDefault(TimeZone.getTimeZone("America/Chicago"));
    }

    public static void main(String[] args) {
        SpringApplication.run(KsaApplication.class, args);
    }
}