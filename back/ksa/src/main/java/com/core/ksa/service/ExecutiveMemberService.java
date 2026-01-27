package com.core.ksa.service;

import com.core.ksa.domain.ExecutiveMember;
import com.core.ksa.dto.ExecutiveMemberRequestDto;
import com.core.ksa.dto.ExecutiveMemberResponseDto;
import com.core.ksa.repository.ExecutiveMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExecutiveMemberService {

    private final ExecutiveMemberRepository repository;
    private final S3ImageService s3ImageService;

    public List<ExecutiveMemberResponseDto> getCurrentExecutives() {
        return repository.findByIsCurrentTrueOrderByDisplayOrderAsc().stream()
                .map(ExecutiveMemberResponseDto::new)
                .collect(Collectors.toList());
    }

    public Map<String, List<ExecutiveMemberResponseDto>> getPastExecutivesGrouped() {
        List<ExecutiveMember> pastMembers = repository.findByIsCurrentFalseOrderByPeriodDescIdAsc();
        return pastMembers.stream()
                .map(ExecutiveMemberResponseDto::new)
                .collect(Collectors.groupingBy(ExecutiveMemberResponseDto::getPeriod));
    }

    @Transactional
    public ExecutiveMemberResponseDto createExecutive(ExecutiveMemberRequestDto dto) {
        ExecutiveMember member = ExecutiveMember.builder()
                .name(dto.getName())
                .position(dto.getPosition())
                .period(dto.getPeriod())
                .major(dto.getMajor())
                .imageUrl(dto.getImageUrl())
                .email(dto.getEmail())
                .isCurrent(dto.isCurrent())
                .displayOrder(dto.getDisplayOrder())
                .build();
        return new ExecutiveMemberResponseDto(repository.save(member));
    }

    @Transactional
    public ExecutiveMemberResponseDto updateExecutive(Long id, ExecutiveMemberRequestDto dto) {
        ExecutiveMember member = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        // Delete old image if it changed
        if (member.getImageUrl() != null && !member.getImageUrl().equals(dto.getImageUrl())) {
            s3ImageService.deleteImage(member.getImageUrl());
        }

        member.update(
                dto.getName(),
                dto.getPosition(),
                dto.getPeriod(),
                dto.getMajor(),
                dto.getImageUrl(),
                dto.getEmail(),
                dto.isCurrent(),
                dto.getDisplayOrder());
        return new ExecutiveMemberResponseDto(member);
    }

    @Transactional
    public void archiveCurrentTerm() {
        List<ExecutiveMember> currentMembers = repository.findByIsCurrentTrueOrderByDisplayOrderAsc();
        for (ExecutiveMember member : currentMembers) {
            member.update(
                    member.getName(),
                    member.getPosition(),
                    member.getPeriod(),
                    member.getMajor(),
                    member.getImageUrl(),
                    member.getEmail(),
                    false, // Set isCurrent to false
                    member.getDisplayOrder());
        }
    }

    @Transactional
    public void deleteExecutive(Long id) {
        repository.findById(id).ifPresent(member -> {
            if (member.getImageUrl() != null) {
                s3ImageService.deleteImage(member.getImageUrl());
            }
            repository.delete(member);
        });
    }
}
