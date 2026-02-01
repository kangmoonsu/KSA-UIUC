package com.core.ksa.service;

import com.core.ksa.domain.Comment;
import com.core.ksa.domain.Post;
import com.core.ksa.domain.User;
import com.core.ksa.dto.CommentRequestDto;
import com.core.ksa.dto.CommentResponseDto;
import com.core.ksa.repository.CommentRepository;
import com.core.ksa.repository.FreePostRepository;
import com.core.ksa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final FreePostRepository postRepository; // Currently using FreePostRepository for Post retrieval
    private final UserRepository userRepository;

    @Transactional
    public void createComment(Long postId, CommentRequestDto requestDto, String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.isCommentEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Comments are disabled for this post");
        }

        Comment parent = null;
        if (requestDto.getParentId() != null) {
            parent = commentRepository.findById(requestDto.getParentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found"));
        }

        Comment comment = new Comment(requestDto.getContent(), user, post, parent, requestDto.isSecret());
        commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
    }

    public List<CommentResponseDto> getComments(Long postId, String clerkId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        User currentUser = null;
        if (clerkId != null) {
            currentUser = userRepository.findByClerkId(clerkId).orElse(null);
        }

        Map<Long, CommentResponseDto> map = new HashMap<>();
        List<CommentResponseDto> roots = new ArrayList<>();

        // First pass: Convert to DTO and handle secret logic
        for (Comment comment : comments) {
            CommentResponseDto dto = new CommentResponseDto(comment);

            // Secret Logic
            if (comment.isSecret()) {
                boolean canView = false;
                if (currentUser != null) {
                    if (currentUser.getRole() == User.Role.ADMIN)
                        canView = true;
                    if (comment.getAuthor().getId().equals(currentUser.getId()))
                        canView = true;
                    if (comment.getPost().getAuthor().getId().equals(currentUser.getId()))
                        canView = true;
                }

                if (!canView) {
                    dto.setContent("비밀 댓글입니다.");
                }
            }

            // Deleted Logic overrides Secret (if we want to show "Deleted comment" instead
            // of secret)
            if (comment.isDeleted()) {
                dto.setContent("삭제된 댓글입니다.");
            }

            map.put(comment.getId(), dto);
        }

        // Second pass: Build hierarchy
        for (Comment comment : comments) {
            CommentResponseDto dto = map.get(comment.getId());
            if (comment.getParent() != null) {
                CommentResponseDto parentDto = map.get(comment.getParent().getId());
                if (parentDto != null) {
                    parentDto.addChild(dto);
                } else {
                    // Parent might be hard deleted or not in list? Should be in list if integrity
                    // holds
                    roots.add(dto);
                }
            } else {
                roots.add(dto);
            }
        }

        return roots;
    }

    @Transactional
    public void deleteComment(Long commentId, String clerkId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!comment.getAuthor().getClerkId().equals(clerkId) && user.getRole() != User.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this comment");
        }

        comment.setDeleted(true);
        // We don't decrease commentCount because the slot is still taken in the tree?
        // Or we strictly count visible comments? Usually soft deletes count is tricky.
        // Let's keep count for now or decrease it depending on requirement.
        // Plan didn't specify, but usually "Deleted" placeholder remains, so count
        // might stay.
        // However, user might expect count to go down. Let's decrease it for now to
        // reflect "active" comments?
        // Actually typical nested comment systems keep the count including deleted ones
        // if they have children.
        // If it's a leaf node, we could hard delete. But let's stick to simple soft
        // delete for all.
        // I won't touch commentCount for soft delete to avoid confusion with "There are
        // 5 comments" but seeing only 4.
    }
}
