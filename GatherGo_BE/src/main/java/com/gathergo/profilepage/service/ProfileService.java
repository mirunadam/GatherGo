package com.gathergo.profilepage.service;

import com.gathergo.model.User;
import com.gathergo.profilepage.dto.UpdateProfileRequest;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {
    public String updateProfile(UpdateProfileRequest request) throws Exception {
        UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(request.getUid());

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            updateRequest.setEmail(request.getEmail());
        }

        if (request.getFullname() != null) {
            updateRequest.setDisplayName(request.getFullname());
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            // Ensure it follows E.164 format (+ country code)
            String phone = request.getPhone().trim();
            if (phone.startsWith("0")) {
                phone = "+40" + phone.substring(1);
            } else if (!phone.startsWith("+")) {
                phone = "+" + phone;
            }

            try {
                updateRequest.setPhoneNumber(phone);
            } catch (IllegalArgumentException e) {
                throw new Exception("Phone number must be in format +40712345678");
            }
            updateRequest.setPhoneNumber(phone);
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            updateRequest.setPassword(request.getPassword());
        }

        if (request.getProfilePictureUrl() != null && !request.getProfilePictureUrl().trim().isEmpty()) {
            updateRequest.setPhotoUrl(request.getProfilePictureUrl());
        }

        FirebaseAuth.getInstance().updateUser(updateRequest);
        return "Firebase Profile updated successfully!";
    }

    public UpdateProfileRequest getUserProfile(String uid) throws Exception {
        UserRecord userRecord = FirebaseAuth.getInstance().getUser(uid);

        UpdateProfileRequest dto = new UpdateProfileRequest();
        dto.setUid(userRecord.getUid());
        dto.setEmail(userRecord.getEmail());
        dto.setFullname(userRecord.getDisplayName() != null ? userRecord.getDisplayName() : "");
        dto.setPhone(userRecord.getPhoneNumber() != null ? userRecord.getPhoneNumber() : "");
        dto.setProfilePictureUrl(userRecord.getPhotoUrl() != null ? userRecord.getPhotoUrl() : "");

        return dto;
    }
}
