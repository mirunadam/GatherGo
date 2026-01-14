package com.gathergo.loginpage.service;

import com.gathergo.exception.BadRequestException;
import com.gathergo.loginpage.dto.RegisterRequest;
import com.gathergo.model.Role;
import com.gathergo.model.User;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.stereotype.Service;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.database.DatabaseError;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class AuthManager {

    private static final String API_KEY = "AIzaSyBWMaiHl8SrSuOIqasCiLBMOroK01LSwJY";

    public String register(RegisterRequest request) throws Exception {

        // VALIDATION
        if (request.getRole() == null) {
            throw new BadRequestException("Invalid role. Must be USER or AGENCY.");
        }

        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new BadRequestException("Invalid email.");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new BadRequestException("Username cannot be empty.");
        }

        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new BadRequestException("Full name cannot be empty.");
        }

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new BadRequestException("Phone cannot be empty.");
        }


        // 🔹 CONNECT TO firebase realtime database
        DatabaseReference usersRef = FirebaseDatabase.getInstance()
                .getReference("users");

        // 🔹 CHECK IF USERNAME EXISTS
        String url = "https://gathergo-9da0b-default-rtdb.firebaseio.com/users.json";

        java.net.URL obj = new java.net.URL(url);
        java.net.HttpURLConnection con = (java.net.HttpURLConnection) obj.openConnection();
        con.setRequestMethod("GET");

        if (con.getResponseCode() == 200) {
            java.io.BufferedReader in = new java.io.BufferedReader(
                    new java.io.InputStreamReader(con.getInputStream())
            );

            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            if (response.toString().contains("\"username\":\"" + request.getUsername() + "\"")) {
                throw new BadRequestException("Username is already taken.");
            }
        }


        // 🔹 CREATE USER IN FIREBASE AUTH
        UserRecord.CreateRequest creator = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setDisplayName(request.getUsername());

        UserRecord userRecord = FirebaseAuth.getInstance().createUser(creator);

        String uid = userRecord.getUid();

        try {
            UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(uid)
                    .setPhoneNumber(request.getPhone());

            FirebaseAuth.getInstance().updateUser(updateRequest);
        } catch (Exception e) {
            // Log the error but don't stop the process if Auth update fails
            // after account creation is already successful
            System.err.println("Failed to update Auth phone number: " + e.getMessage());
        }

        // 🔹 SAVE USER PROFILE IN REALTIME DB
        User profile = new User(
                uid,
                request.getRole(),
                request.getUsername(),
                request.getFullName(),
                request.getEmail(),
                request.getPhone()
        );

        usersRef.child(uid).setValueAsync(profile);

        return uid;
    }


    // LOGIN
    public String login(String email, String password) throws Exception {

        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY;

        String payload = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\",\"returnSecureToken\":true}",
                email, password
        );

        java.net.URL obj = new java.net.URL(url);
        java.net.HttpURLConnection con = (java.net.HttpURLConnection) obj.openConnection();
        con.setRequestMethod("POST");
        con.setRequestProperty("Content-Type", "application/json");
        con.setDoOutput(true);

        java.io.OutputStream os = con.getOutputStream();
        os.write(payload.getBytes("UTF-8"));
        os.close();

        if (con.getResponseCode() >= 400) {
            java.io.BufferedReader errReader =
                    new java.io.BufferedReader(new java.io.InputStreamReader(con.getErrorStream()));

            StringBuilder errResponse = new StringBuilder();
            String line;
            while ((line = errReader.readLine()) != null) {
                errResponse.append(line);
            }
            throw new BadRequestException("Login failed: " + errResponse);
        }

        java.io.BufferedReader in =
                new java.io.BufferedReader(new java.io.InputStreamReader(con.getInputStream()));

        String inputLine;
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        return response.toString();
    }


    public String googleAutoCreateUser(FirebaseToken token) {

        String uid = token.getUid();
        String email = token.getEmail();
        String name = token.getName();

        DatabaseReference userRef = FirebaseDatabase.getInstance()
                .getReference("users")
                .child(uid);

        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> roleResult = new AtomicReference<>(Role.USER.name());

        userRef.addListenerForSingleValueEvent(new com.google.firebase.database.ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    // ✅ User already exists → return stored role
                    String role = snapshot.child("role").getValue(String.class);
                    roleResult.set(role);
                } else {
                    // ✅ First Google login → auto-create USER
                    User profile = new User(
                            uid,
                            Role.USER,
                            name,
                            name,
                            email,
                            ""
                    );
                    userRef.setValueAsync(profile);
                    roleResult.set(Role.USER.name());
                }
                latch.countDown();
            }

            @Override
            public void onCancelled(DatabaseError error) {
                latch.countDown();
            }
        });

        try {
            latch.await(); // ✅ Wait until Firebase responds
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return roleResult.get();
    }

    public User getUserById(String uid) throws InterruptedException {
        DatabaseReference userRef = FirebaseDatabase.getInstance()
                .getReference("users")
                .child(uid);

        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<User> userProfile = new AtomicReference<>();

        userRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    User user = snapshot.getValue(User.class);
                    userProfile.set(user);
                }
                latch.countDown();
            }

            @Override
            public void onCancelled(DatabaseError error) {
                latch.countDown();
            }
        });

        latch.await(); // Wait for Firebase to return the data
        return userProfile.get();
    }

}