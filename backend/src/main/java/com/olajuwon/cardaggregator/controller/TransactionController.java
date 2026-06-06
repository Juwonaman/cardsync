package com.olajuwon.cardaggregator.controller;

import com.olajuwon.cardaggregator.model.Transaction;
import com.olajuwon.cardaggregator.model.User;
import com.olajuwon.cardaggregator.repository.UserRepository;
import com.olajuwon.cardaggregator.security.JwtUtil;
import com.olajuwon.cardaggregator.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private User getUserFromToken(String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/sync")
    public ResponseEntity<List<Transaction>> syncTransactions(
            @RequestHeader("Authorization") String authHeader) throws Exception {
        User user = getUserFromToken(authHeader);
        List<Transaction> transactions = transactionService.syncTransactions(user);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        List<Transaction> transactions = transactionService.getUserTransactions(user);
        return ResponseEntity.ok(transactions);
    }
}