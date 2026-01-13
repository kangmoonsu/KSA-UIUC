package com.core.ksa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class KsaApplication {

    public static void main(String[] args) {
        SpringApplication.run(KsaApplication.class, args);
    }

}