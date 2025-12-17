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
            // 1. Remove quotes if the token was sent as a JSON string
            String cleanedToken = idToken.replace("\"", "");

            // 2. Verify the token using your existing service
            FirebaseToken decoded = AuthService.verifyToken(cleanedToken);
            String uid = decoded.getUid();
            String email = decoded.getEmail();

            // 3. Get/Create user role
            String role = authManager.googleAutoCreateUser(decoded);

            // 4. Return the full response
            return ResponseEntity.ok(new AuthResponse(
                    cleanedToken,
                    uid,
                    role,
                    email
            ));

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid Google token: " + e.getMessage());
        }
    }
}
