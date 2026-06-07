package com.olajuwon.cardaggregator.controller;

import com.olajuwon.cardaggregator.model.PlaidItem;
import com.olajuwon.cardaggregator.model.User;
import com.olajuwon.cardaggregator.repository.UserRepository;
import com.olajuwon.cardaggregator.service.PlaidService;
import com.olajuwon.cardaggregator.security.JwtUtil;
import com.plaid.client.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/plaid")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PlaidController  {

    private final PlaidService plaidService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private User getUserFromToken(String authHeader){
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/link-token")
    public ResponseEntity<Map<String, String>> createLinkToken(
            @RequestHeader("Authorization") String authHeader) throws IOException {
        User user = getUserFromToken(authHeader);
        String linkToken = plaidService.createLinkToken(user);
        return ResponseEntity.ok(Map.of("link_token", linkToken));
    }

    @PostMapping("/exchange-token")
    public ResponseEntity<Map<String, String>> exchangeToken(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) throws IOException {
        User user = getUserFromToken(authHeader);
        plaidService.exchangePublicToken(
                body.get("public_token"),
                body.get("institution_name"),
                user
        );
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestHeader("Authorization") String authHeader) throws IOException{
        User user = getUserFromToken(authHeader);
        List<PlaidItem> items = plaidService.getPlaidItems(user);
        List<Transaction> allTransactions = new java.util.ArrayList<>();
        for (PlaidItem item : items) {
            allTransactions.addAll(plaidService.getTransactions(item));
        }
        return ResponseEntity.ok(allTransactions);
    }
    @GetMapping("/accounts")
    public ResponseEntity<List<Map<String, String>>> getAccounts(
            @RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        List<PlaidItem> items = plaidService.getPlaidItems(user);
        List<Map<String, String>> accounts = items.stream()
                .map(item -> Map.of(
                        "id", String.valueOf(item.getId()),
                        "institutionName", item.getInstitutionName()
                ))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(accounts);
    }

}
