package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "user_action_logs")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserActionLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    private String description; // e.g. "Banned for 3 days", "Promoted to ADMIN"

    private String actorName; // Name of the admin who performed the action

    @Builder
    public UserActionLog(User user, ActionType actionType, String description, String actorName) {
        this.user = user;
        this.actionType = actionType;
        this.description = description;
        this.actorName = actorName;
    }

    public enum ActionType {
        BAN, UNBAN, PROMOTE, DEMOTE, DELETE_POST
    }
}
