package com.olajuwon.cardaggregator.repository;

import com.olajuwon.cardaggregator.model.PlaidItem;
import com.olajuwon.cardaggregator.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaidItemRepository extends JpaRepository<PlaidItem, Long> {
    List<PlaidItem> findByUser(User user);
}