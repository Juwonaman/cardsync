package com.olajuwon.cardaggregator.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor



public class Transaction {

    @Id
    private String transactionId;

    @Column(nullable = false)
    private String name;

    @Column (nullable = false)
    private  Double amount;

    @Column (nullable = false)
    private LocalDate date;

    @Column
    private String category;

    @Column
    private String merchantName;

    @ManyToOne
    @JoinColumn(name = "plaid_item_id", nullable = false)
    private PlaidItem plaidItem;

}
