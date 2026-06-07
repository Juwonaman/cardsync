package com.olajuwon.cardaggregator.controller;

import com.olajuwon.cardaggregator.dto.SummaryResponse;
import com.olajuwon.cardaggregator.model.User;
import com.olajuwon.cardaggregator.repository.UserRepository;
import com.olajuwon.cardaggregator.security.JwtUtil;
import com.olajuwon.cardaggregator.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")

public class SummaryController {

    private final SummaryService summaryService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private User getUserFromToken(String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<SummaryResponse> getSummary(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        return ResponseEntity.ok(summaryService.getSummary(user));
    }
}
