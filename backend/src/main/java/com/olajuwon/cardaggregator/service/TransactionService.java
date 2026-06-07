package com.olajuwon.cardaggregator.service;

import com.olajuwon.cardaggregator.model.PlaidItem;
import com.olajuwon.cardaggregator.model.Transaction;
import com.olajuwon.cardaggregator.model.User;
import com.olajuwon.cardaggregator.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PlaidService plaidService;

    public List<Transaction> syncTransactions(User user) throws Exception {
        List<PlaidItem> items = plaidService.getPlaidItems(user);
        List<Transaction> allSaved = new ArrayList<>();

        for (PlaidItem item : items) {
            List<com.plaid.client.model.Transaction> plaidTransactions =
                    plaidService.getTransactions(item);

            for (com.plaid.client.model.Transaction pt : plaidTransactions) {
                if (transactionRepository.existsById(pt.getTransactionId())) {
                    continue;
                }

                Transaction t = new Transaction();
                t.setTransactionId(pt.getTransactionId());
                t.setName(pt.getName());
                t.setAmount(pt.getAmount());
                t.setDate(pt.getDate());
                t.setCategory(determineCategory(pt));
                t.setMerchantName(pt.getMerchantName());
                t.setPlaidItem(item);

                allSaved.add(transactionRepository.save(t));
            }
        }
        return allSaved;
    }

    public List<Transaction> getUserTransactions(User user) {
        List<PlaidItem> items = plaidService.getPlaidItems(user);
        return transactionRepository.findByPlaidItemIn(items);
    }

    private String determineCategory(com.plaid.client.model.Transaction pt) {
        if (pt.getCategory() != null && !pt.getCategory().isEmpty()) {
            return pt.getCategory().get(0);
        }

        String name = pt.getName().toLowerCase();

        if (name.contains("uber") || name.contains("lyft") || name.contains("airline") ||
                name.contains("airways") || name.contains("united") || name.contains("delta")) {
            return "Travel";
        }
        if (name.contains("mcdonald") || name.contains("starbucks") || name.contains("kfc") ||
                name.contains("chipotle") || name.contains("restaurant") || name.contains("food") ||
                name.contains("pizza") || name.contains("burger") || name.contains("cafe")) {
            return "Food & Drink";
        }
        if (name.contains("amazon") || name.contains("walmart") || name.contains("target") ||
                name.contains("shop") || name.contains("store") || name.contains("market")) {
            return "Shopping";
        }
        if (name.contains("netflix") || name.contains("spotify") || name.contains("hulu") ||
                name.contains("disney") || name.contains("apple") || name.contains("google")) {
            return "Subscriptions";
        }
        if (name.contains("gym") || name.contains("fitness") || name.contains("climbing") ||
                name.contains("sport") || name.contains("bike") || name.contains("bicycle")) {
            return "Health & Fitness";
        }
        if (name.contains("payment") || name.contains("deposit") || name.contains("credit") ||
                name.contains("ach") || name.contains("transfer")) {
            return "Payments & Transfers";
        }

        return "Uncategorized";
    }
}