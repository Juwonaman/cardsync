package com.olajuwon.cardaggregator.controller;

import com.olajuwon.cardaggregator.dto.AuthResponse;
import com.olajuwon.cardaggregator.service.AuthService;
import com.olajuwon.cardaggregator.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request){
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody Map<String, String> request){
        return ResponseEntity.ok(
                authService.login(request.get("email"), request.get("password"))
        );
    }

}
