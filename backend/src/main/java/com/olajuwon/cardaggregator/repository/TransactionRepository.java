package com.olajuwon.cardaggregator.repository;

import com.olajuwon.cardaggregator.model.Transaction;
import com.olajuwon.cardaggregator.model.PlaidItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String>{
    List<Transaction> findByPlaidItem(PlaidItem plaidItem);
    List<Transaction> findByPlaidItemIn(List<PlaidItem> plaidItems);
}
