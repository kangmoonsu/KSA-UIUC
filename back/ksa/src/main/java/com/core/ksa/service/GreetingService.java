package com.core.ksa.service;

import com.core.ksa.domain.Greeting;
import com.core.ksa.repository.GreetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GreetingService {

    private final GreetingRepository repository;

    public String getGreeting() {
        return repository.findById(1L)
                .map(Greeting::getContent)
                .orElse(""); // Default empty
    }

    @Transactional
    public void updateGreeting(String content) {
        Greeting greeting = repository.findById(1L)
                .orElse(new Greeting(""));
        greeting.update(content);
        repository.save(greeting);
    }
}
