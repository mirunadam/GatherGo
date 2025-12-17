package com.gathergo.loginpage.dto;

public class AuthResponse {
    private String token; // firebase id token
    private String uid;   // firebase unique id
    private String role;  // USER or AGENCY
    private String email; // ✅ Added for frontend welcome message

    // No-argument constructor for JSON parsing
    public AuthResponse() {}

    public AuthResponse(String token, String uid, String role, String email) {
        this.token = token;
        this.uid = uid;
        this.role = role;
        this.email = email;
    }

    // Getters
    public String getToken() { return token; }
    public String getUid() { return uid; }
    public String getRole() { return role; }
    public String getEmail() { return email; }

    // Setters (Required for Spring to build the object)
    public void setToken(String token) { this.token = token; }
    public void setUid(String uid) { this.uid = uid; }
    public void setRole(String role) { this.role = role; }
    public void setEmail(String email) { this.email = email; }
}
