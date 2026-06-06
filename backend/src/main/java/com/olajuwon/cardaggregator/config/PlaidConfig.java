package com.olajuwon.cardaggregator.config;

import com.plaid.client.ApiClient;
import com.plaid.client.request.PlaidApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PlaidConfig {

    @Value("${plaid.client-id}")
    private String clientId;

    @Value("${plaid.secret}")
    private String secret;

    @Bean
    public PlaidApi plaidApi() {
        ApiClient apiClient = new ApiClient();
        apiClient.setPlaidAdapter(ApiClient.Sandbox);
        apiClient.setCredentials(clientId, secret);
        return apiClient.createService(PlaidApi.class);
    }
}