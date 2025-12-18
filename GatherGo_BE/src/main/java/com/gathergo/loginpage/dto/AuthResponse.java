package com.gathergo.loginpage.dto;

public class AuthResponse {
    private String token;//firebase id token,used to authenticate request from Angular->backend
    private String uid;//firebase unique id of the user,needed to fetch user profile info
    private String role;//again daca e USER sau AGENCY

    public AuthResponse(String token, String uid, String role) {
        this.token = token;
        this.uid = uid;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getUid() {
        return uid;
    }

    public String getRole() {
        return role;
    }
}