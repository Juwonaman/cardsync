package com.olajuwon.cardaggregator.service;

import com.olajuwon.cardaggregator.dto.SummaryResponse;
import com.olajuwon.cardaggregator.model.PlaidItem;
import com.olajuwon.cardaggregator.model.Transaction;
import com.olajuwon.cardaggregator.model.User;
import com.olajuwon.cardaggregator.repository.PlaidItemRepository;
import com.olajuwon.cardaggregator.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class SummaryService {

    private final TransactionRepository transactionRepository;
    private final PlaidService plaidService;

    public SummaryResponse getSummary(User user) {
        List <PlaidItem> items = plaidService.getPlaidItems(user);
        List<Transaction> transactions = transactionRepository.findByPlaidItemIn(items);

        double totalSpent = 0;
        Map<String, Double> spendingByCategory = new HashMap<>();
        Map<String, Double> spendingByCard = new HashMap<>();

        for(Transaction tx : transactions){
            double amount = Math.abs(tx.getAmount());
            totalSpent += amount;

            //group category
            String category = tx.getCategory() != null ? tx.getCategory() : "Uncategorized";
            spendingByCategory.merge(category, amount, Double::sum);

            //group card/bank
            String cardName = tx.getPlaidItem().getInstitutionName();
            spendingByCard.merge(cardName, amount, Double::sum);

        }

        String highestCategory = spendingByCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");


        return new SummaryResponse(
                totalSpent,
                transactions.size(),
                spendingByCategory,
                spendingByCard,
                highestCategory
        );
    }
}
