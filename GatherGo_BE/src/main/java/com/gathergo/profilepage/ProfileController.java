package com.gathergo.profilepage;

import com.gathergo.profilepage.dto.UpdateProfileRequest;
import com.gathergo.profilepage.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{uid}")
    public ResponseEntity<?> getProfile(@PathVariable String uid) {
        try {
            return ResponseEntity.ok(profileService.getUserProfile(uid));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("User not found in Firebase");
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody UpdateProfileRequest request) {
        try {
            String result = profileService.updateProfile(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
