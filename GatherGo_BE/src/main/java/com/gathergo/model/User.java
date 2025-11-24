package com.gathergo.model;

public class User {
    private String uid;
    private String role;
    private String username;
    private String fullName; // or agencyName
    private String email;
    private String phone;

    public User() {}

    public User(String uid, String role, String username, String fullName, String email, String phone) {
        this.uid = uid;
        this.role = role;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
    }

    // Getters
    public String getUid() {
        return uid;
    }

    public String getRole() {
        return role;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    // Setters
    public void setUid(String uid) {
        this.uid = uid;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
