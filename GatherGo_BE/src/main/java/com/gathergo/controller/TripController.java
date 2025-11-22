package com.gathergo.controller;

import com.gathergo.service.AuthService;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @PostMapping("/create")
    public ResponseEntity<String> createTrip(@RequestHeader("Authorization") String authHeader) {
        try {
            // Remove the "Bearer " prefix
            String idToken = authHeader.replace("Bearer ", "").trim();

            // Verify with Firebase
            FirebaseToken decodedToken = AuthService.verifyToken(idToken);

            // Extract user ID
            String uid = decodedToken.getUid();

            // Return success message
            return ResponseEntity.ok("Trip created for user: " + uid);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
    }
    @GetMapping("/testFirebase")
    public ResponseEntity<String> testFirebase() {
        return ResponseEntity.ok("Firebase is working!");
    }
}
