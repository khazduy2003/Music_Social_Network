package com.musicsocial.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    
    /**
     * Store audio file and return the file path
     * @param file the audio file to store
     * @param userId the user ID for organizing files
     * @return the relative file path
     */
    String storeAudioFile(MultipartFile file, Long userId);
    
    /**
     * Store image file and return the file path
     * @param file the image file to store
     * @param userId the user ID for organizing files
     * @return the relative file path
     */
    String storeImageFile(MultipartFile file, Long userId);
    
    /**
     * Delete a file
     * @param filePath the file path to delete
     */
    void deleteFile(String filePath);
    
    /**
     * Get the full URL for accessing a file
     * @param filePath the relative file path
     * @return the full URL
     */
    String getFileUrl(String filePath);
} 