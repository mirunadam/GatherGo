package com.gathergo.loginpage;

import com.gathergo.loginpage.dto.AuthResponse;
import com.gathergo.loginpage.dto.LoginRequest;
import com.gathergo.loginpage.dto.RegisterRequest;
import com.gathergo.loginpage.service.AuthManager;
import com.gathergo.loginpage.service.AuthService;
import com.google.firebase.auth.FirebaseToken;
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
}
