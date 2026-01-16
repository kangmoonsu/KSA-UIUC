package com.core.ksa;

import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DatabaseInitialiser implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Running DatabaseInitialiser...");
        // This is a one-time check or setup if needed
        System.out.println("DatabaseInitialiser completed.");

    }
}
