package com.gathergo.loginpage;

import com.gathergo.loginpage.dto.LoginRequest;
import com.gathergo.loginpage.dto.RegisterRequest;
import com.gathergo.loginpage.service.AuthManager;
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
}
