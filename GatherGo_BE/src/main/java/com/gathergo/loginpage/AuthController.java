package com.gathergo.loginpage;

import com.gathergo.loginpage.dto.AuthResponse;
import com.gathergo.loginpage.dto.LoginRequest;
import com.gathergo.loginpage.dto.RegisterRequest;
import com.gathergo.loginpage.service.AuthManager;
import com.gathergo.loginpage.service.AuthService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.gathergo.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
//@CrossOrigin("*")
public class AuthController {

    private final AuthManager authManager;

    public AuthController(AuthManager authManager) {
        this.authManager = authManager;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) throws Exception {
        return authManager.register(request);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) throws Exception {
        return authManager.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody String idToken) {
        try {
            FirebaseToken decoded = AuthService.verifyToken(idToken);
            String uid = decoded.getUid();

            // Auto-create user profile if needed
            String role = authManager.googleAutoCreateUser(decoded);

            return ResponseEntity.ok(new AuthResponse(
                    idToken,
                    uid,
                    role
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid Google token: " + e.getMessage());
        }
    }

    @GetMapping("/getUserInfo")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        try {
            // 1. Extract the token from the "Bearer <token>" string
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing Authorization header");
            }
            String idToken = authHeader.substring(7);

            // 2. Use Firebase Admin SDK to verify the token and get the UID
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            // 3. Now use that UID to get the profile from your database
            User user = authManager.getUserById(uid);

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token: " + e.getMessage());
        }
    }
}