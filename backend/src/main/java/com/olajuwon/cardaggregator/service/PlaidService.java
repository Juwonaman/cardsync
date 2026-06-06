package com.olajuwon.cardaggregator.service;

import com.olajuwon.cardaggregator.model.PlaidItem;
import com.olajuwon.cardaggregator.model.User;
import com.olajuwon.cardaggregator.repository.PlaidItemRepository;
import com.plaid.client.model.*;
import com.plaid.client.request.PlaidApi;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import retrofit2.Response;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;



@Service
@RequiredArgsConstructor
public class PlaidService {

    private final PlaidApi plaidApi;
    private final PlaidItemRepository plaidItemRepository;

    @Value("${plaid.client-id}")
    private String clientId;

    @Value("${plaid.secret}")
    private String secret;

    public String createLinkToken(User user) throws IOException {
        LinkTokenCreateRequestUser requestUser = new LinkTokenCreateRequestUser()
                .clientUserId(user.getId().toString());

        LinkTokenCreateRequest request = new LinkTokenCreateRequest()
                .clientId(clientId)
                .secret(secret)
                .user(requestUser)
                .clientName("Card Aggregator")
                .products(Arrays.asList(Products.TRANSACTIONS))
                .countryCodes(Arrays.asList(CountryCode.US))
                .language("en");

        Response<LinkTokenCreateResponse> response = plaidApi
                .linkTokenCreate(request)
                .execute();

//        System.out.println("Response code: " + response.code());
//        System.out.println("Response headers: " + response.headers());
//        System.out.println("Error body: " + (response.errorBody() != null ? response.errorBody().string() : "null"));

        if (!response.isSuccessful()) {
            throw new RuntimeException("Plaid error: " + response.code());
        }

        return response.body().getLinkToken();
    }

    public PlaidItem exchangePublicToken(String publicToken, String institutionName, User user) throws IOException {
        ItemPublicTokenExchangeRequest request = new ItemPublicTokenExchangeRequest()
                .clientId(clientId)
                .secret(secret)
                .publicToken(publicToken);
        Response<ItemPublicTokenExchangeResponse> response = plaidApi
                .itemPublicTokenExchange(request)
                .execute();

        PlaidItem item = new PlaidItem();
        item.setAccessToken(response.body().getAccessToken());
        item.setItemId(response.body().getItemId());
        item.setInstitutionName(institutionName);
        item.setUser(user);

        return plaidItemRepository.save(item);
    }

    public List<Transaction> getTransactions(PlaidItem plaidItem) throws IOException {
        TransactionsGetRequestOptions options = new TransactionsGetRequestOptions()
                .count(100);

        TransactionsGetRequest request = new TransactionsGetRequest()
                .clientId(clientId)
                .secret(secret)
                .accessToken(plaidItem.getAccessToken())
                .startDate(java.time.LocalDate.now().minusDays(30))
                .endDate(java.time.LocalDate.now())
                .options(options);

        Response<TransactionsGetResponse> response = plaidApi
                .transactionsGet(request)
                .execute();

        return response.body().getTransactions();
    }

    public List<PlaidItem> getPlaidItems(User user){
        return plaidItemRepository.findByUser(user);
    }

}
