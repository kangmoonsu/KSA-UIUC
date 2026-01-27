package com.core.ksa.controller;

import com.core.ksa.dto.ExecutiveMemberRequestDto;
import com.core.ksa.dto.ExecutiveMemberResponseDto;
import com.core.ksa.service.ExecutiveMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/executives")
@RequiredArgsConstructor
public class ExecutiveMemberController {

    private final ExecutiveMemberService service;

    @GetMapping("/current")
    public ResponseEntity<List<ExecutiveMemberResponseDto>> getCurrentExecutives() {
        return ResponseEntity.ok(service.getCurrentExecutives());
    }

    @GetMapping("/past")
    public ResponseEntity<Map<String, List<ExecutiveMemberResponseDto>>> getPastExecutives() {
        return ResponseEntity.ok(service.getPastExecutivesGrouped());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<ExecutiveMemberResponseDto> createExecutive(@RequestBody ExecutiveMemberRequestDto dto) {
        return ResponseEntity.ok(service.createExecutive(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<ExecutiveMemberResponseDto> updateExecutive(@PathVariable(name = "id") Long id,
            @RequestBody ExecutiveMemberRequestDto dto) {
        return ResponseEntity.ok(service.updateExecutive(id, dto));
    }

    @PostMapping("/archive")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> archiveCurrentTerm() {
        service.archiveCurrentTerm();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MASTER')")
    public ResponseEntity<Void> deleteExecutive(@PathVariable(name = "id") Long id) {
        service.deleteExecutive(id);
        return ResponseEntity.ok().build();
    }
}
