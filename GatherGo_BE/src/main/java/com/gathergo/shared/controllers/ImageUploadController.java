package com.gathergo.shared.controllers;

import com.gathergo.shared.FirebaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageUploadController {

    private FirebaseService firebaseService;

    public ImageUploadController(FirebaseService firebaseStorageService) {
        this.firebaseService = firebaseStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            String imageUrl = firebaseService.uploadImage(file);
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed");
        }
    }
}
