package com.gathergo.loginpage.service;

import com.gathergo.exception.BadRequestException;
import com.gathergo.loginpage.dto.RegisterRequest;
import com.gathergo.model.User;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.stereotype.Service;

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
}
