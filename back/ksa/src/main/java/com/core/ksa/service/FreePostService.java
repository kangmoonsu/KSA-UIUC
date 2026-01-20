package com.core.ksa.service;

import com.core.ksa.domain.FreePost;
import com.core.ksa.domain.User;
import com.core.ksa.dto.FreePostCreateRequestDto;
import com.core.ksa.dto.FreePostResponseDto;
import com.core.ksa.repository.FreePostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FreePostService {

    private final FreePostRepository freePostRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long createPost(FreePostCreateRequestDto requestDto, String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (requestDto.isNotice() && user.getRole() == User.Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can create notices");
        }

        FreePost post = FreePost.builder()
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .author(user)
                .isNotice(requestDto.isNotice())
                .build();

        return freePostRepository.save(post).getId();
    }

    public com.core.ksa.dto.FreeBoardListResponseDto getPosts(Pageable pageable) {
        java.util.List<FreePostResponseDto> notices = freePostRepository.findAllByIsNoticeTrueOrderByCreatedAtDesc()
                .stream().map(FreePostResponseDto::new).toList();
        Page<FreePostResponseDto> posts = freePostRepository.findAllByIsNoticeFalseOrderByCreatedAtDesc(pageable)
                .map(FreePostResponseDto::new);
        return new com.core.ksa.dto.FreeBoardListResponseDto(notices, posts);
    }

    @Transactional
    public FreePostResponseDto getPost(Long id) {
        FreePost post = freePostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        post.setViewCount(post.getViewCount() + 1);
        return new FreePostResponseDto(post);
    }

    @Transactional
    public void updatePost(Long id, FreePostCreateRequestDto requestDto, String clerkId) {
        FreePost post = freePostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!post.getAuthor().getClerkId().equals(clerkId) && user.getRole() == User.Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this post");
        }

        if (requestDto.isNotice() && user.getRole() == User.Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can set notices");
        }

        post.setTitle(requestDto.getTitle());
        post.setContent(requestDto.getContent());
        post.setNotice(requestDto.isNotice());
    }

    @Transactional
    public void deletePost(Long id, String clerkId) {
        FreePost post = freePostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!post.getAuthor().getClerkId().equals(clerkId) && user.getRole() == User.Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this post");
        }

        freePostRepository.delete(post);
    }
}
