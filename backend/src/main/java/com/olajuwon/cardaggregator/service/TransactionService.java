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
                t.setCategory(pt.getCategory() != null && !pt.getCategory().isEmpty()
                        ? pt.getCategory().get(0) : "Uncategorized");
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
}