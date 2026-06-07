package com.olajuwon.cardaggregator.service;

import com.olajuwon.cardaggregator.dto.SummaryResponse;
import com.olajuwon.cardaggregator.model.PlaidItem;
import com.olajuwon.cardaggregator.model.Transaction;
import com.olajuwon.cardaggregator.model.User;
import com.olajuwon.cardaggregator.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private PlaidService plaidService;

    @InjectMocks
    private SummaryService summaryService;

    @Test
    void getSummary_returnsCorrectTotalSpent() {
        User user = new User();
        PlaidItem item = new PlaidItem();

        Transaction t1 = new Transaction();
        t1.setTransactionId("tx1");
        t1.setAmount(50.00);
        t1.setCategory("Food & Drink");
        t1.setPlaidItem(item);

        Transaction t2 = new Transaction();
        t2.setTransactionId("tx2");
        t2.setAmount(100.00);
        t2.setCategory("Travel");
        t2.setPlaidItem(item);

        when(plaidService.getPlaidItems(user)).thenReturn(List.of(item));
        when(transactionRepository.findByPlaidItemIn(List.of(item)))
                .thenReturn(List.of(t1, t2));

        SummaryResponse response = summaryService.getSummary(user);

        assertEquals(150.00, response.getTotalSpent());
        assertEquals(2, response.getTransactionCount());
    }

    @Test
    void getSummary_returnsCorrectHighestCategory() {
        User user = new User();
        PlaidItem item = new PlaidItem();

        Transaction t1 = new Transaction();
        t1.setTransactionId("tx1");
        t1.setAmount(200.00);
        t1.setCategory("Travel");
        t1.setPlaidItem(item);

        Transaction t2 = new Transaction();
        t2.setTransactionId("tx2");
        t2.setAmount(50.00);
        t2.setCategory("Food & Drink");
        t2.setPlaidItem(item);

        when(plaidService.getPlaidItems(user)).thenReturn(List.of(item));
        when(transactionRepository.findByPlaidItemIn(List.of(item)))
                .thenReturn(List.of(t1, t2));

        SummaryResponse response = summaryService.getSummary(user);

        assertEquals("Travel", response.getHighestSpendingCategory());
    }

    @Test
    void getSummary_returnsEmptySummary_whenNoTransactions() {
        User user = new User();
        PlaidItem item = new PlaidItem();

        when(plaidService.getPlaidItems(user)).thenReturn(List.of(item));
        when(transactionRepository.findByPlaidItemIn(List.of(item)))
                .thenReturn(List.of());

        SummaryResponse response = summaryService.getSummary(user);

        assertEquals(0.0, response.getTotalSpent());
        assertEquals(0, response.getTransactionCount());
        assertEquals("None", response.getHighestSpendingCategory());
    }
}