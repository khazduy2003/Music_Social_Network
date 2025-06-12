package com.musicsocial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EntityScan("com.musicsocial.domain")
@EnableJpaRepositories("com.musicsocial.repository")
@EnableScheduling
public class MusicSocialApplication {
    public static void main(String[] args) {
        SpringApplication.run(MusicSocialApplication.class, args);
    }
} 