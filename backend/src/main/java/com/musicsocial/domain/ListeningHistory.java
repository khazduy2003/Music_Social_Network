package com.musicsocial.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "listening_history")
public class ListeningHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @Column(name = "played_at")
    private LocalDateTime playedAt;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "count_as_play")
    private Boolean countAsPlay = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        playedAt = LocalDateTime.now();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Additional getters and setters
    public void setTrack(Track track) {
        this.track = track;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Track getTrack() {
        return track;
    }
    
    public void setCountAsPlay(Boolean countAsPlay) {
        this.countAsPlay = countAsPlay;
    }
    
    public Boolean getCountAsPlay() {
        return countAsPlay != null ? countAsPlay : true;
    }
} 