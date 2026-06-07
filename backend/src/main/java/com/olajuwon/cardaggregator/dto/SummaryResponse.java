package com.olajuwon.cardaggregator.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.Map;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class SummaryResponse {
    private Double totalSpent;
    private Integer transactionCount;
    private Map<String, Double> spendingByCategory;
    private Map<String, Double> spendingByCard;
    private String highestSpendingCategory;

}
