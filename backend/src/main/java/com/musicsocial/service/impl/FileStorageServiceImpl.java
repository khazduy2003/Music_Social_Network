package com.musicsocial.service.impl;

import com.musicsocial.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.server.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String AUDIO_DIR = "audio";
    private static final String IMAGE_DIR = "images";

    @Override
    public String storeAudioFile(MultipartFile file, Long userId) {
        return storeFile(file, userId, AUDIO_DIR);
    }

    @Override
    public String storeImageFile(MultipartFile file, Long userId) {
        return storeFile(file, userId, IMAGE_DIR);
    }

    private String storeFile(MultipartFile file, Long userId, String subDir) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new RuntimeException("Cannot store empty file");
            }

            // Clean filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            if (originalFilename.contains("..")) {
                throw new RuntimeException("Invalid filename: " + originalFilename);
            }

            // Generate unique filename
            String extension = getFileExtension(originalFilename);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueFilename = String.format("%s_%s_%s%s", 
                userId, timestamp, UUID.randomUUID().toString().substring(0, 8), extension);

            // Create directory structure: uploads/audio/userId/ or uploads/images/userId/
            Path userDir = Paths.get(uploadDir, subDir, userId.toString());
            Files.createDirectories(userDir);

            // Store file
            Path targetLocation = userDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path
            String relativePath = String.format("%s/%s/%s", subDir, userId, uniqueFilename);
            log.info("File stored successfully: {}", relativePath);
            return relativePath;

        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadDir, filePath);
            Files.deleteIfExists(path);
            log.info("File deleted successfully: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filePath, e);
        }
    }

    @Override
    public String getFileUrl(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return null;
        }
        return String.format("%s/api/files/%s", baseUrl, filePath);
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
} 