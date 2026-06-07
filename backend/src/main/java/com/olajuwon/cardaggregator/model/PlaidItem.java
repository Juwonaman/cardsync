package com.olajuwon.cardaggregator.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Entity
@Table(name = "plaid_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaidItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String accessToken;

    @Column(nullable = false)
    private String itemId;

    @Column
    private String institutionName;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
