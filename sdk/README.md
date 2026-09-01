# Northveil Client SDK — Universal Multi-Chain Web3 & Non-Custodial MPC Protocol

[![npm version](https://img.shields.io/npm/v/northveil-sdk.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/northveil-sdk)
[![Python Version](https://img.shields.io/badge/Python-3.8%2B-yellow.svg?style=flat-square)](https://pypi.org/project/northveil/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![NPM Downloads](https://img.shields.io/npm/dm/northveil-sdk.svg?style=flat-square)](https://www.npmjs.com/package/northveil-sdk)

The official software development kit for connecting applications, dApps, and autonomous AI agents to the **Northveil Protocol**. Enables developers across all major programming ecosystems to interact with non-custodial hardware MPC vaults, biometric WebAuthn approvals, multi-chain asset transfers, real-time token valuations across 37+ blockchains, smart contract deployments (ERC-20, ERC-721 NFTs), automated DEX swaps, and autonomous agent execution guardrails.

---

## 📦 Package Installation by Language

| Language | Package Name / Command | Registry |
|---|---|---|
| **TypeScript / JavaScript** | `npm install northveil-sdk` | [npm](https://www.npmjs.com/package/northveil-sdk) |
| **Python** | `pip install northveil` | [PyPI](https://pypi.org/project/northveil/) |
| **Rust** | `cargo add reqwest serde serde_json tokio` | [crates.io](https://crates.io) |
| **Go (Golang)** | `go get github.com/Fortunehack45/Northveil-SDK` | [Go Modules](https://pkg.go.dev/) |
| **Java / Kotlin** | `implementation("xyz.northveil:northveil-sdk:1.2.0")` | Maven Central |
| **C# / .NET** | `dotnet add package Northveil.SDK` | NuGet |
| **PHP** | `composer require northveil/northveil-sdk` | Packagist |
| **Ruby** | `gem install northveil` | RubyGems |
| **Swift (iOS/macOS)** | `.package(url: "https://github.com/Fortunehack45/Northveil-SDK", from: "1.2.0")` | Swift Package Manager |
| **C++** | `vcpkg install cpr nlohmann-json` | vcpkg / CMake |

---

## 🚀 Quickstarts in 10 Programming Languages

### 1. TypeScript & JavaScript (Node.js & Modern Web)
```typescript
import { NorthveilClient } from 'northveil-sdk';

const client = new NorthveilClient({
  apiKey: process.env.NORTHVEIL_API_KEY || 'nv_live_9f82a17b09c82415d8a9',
  walletAddress: process.env.NORTHVEIL_WALLET_ADDRESS || '0x59148d6a9dff263a772b5a84280bc88530f38636'
});

async function run() {
  // 1. Inspect Non-Custodial Multi-Chain Portfolio (37+ Blockchains)
  const portfolio = await client.getPortfolio();
  console.log(`Total Portfolio Value: $${portfolio.totalUsdValue || portfolio.summary?.totalValueUsd} USD`);

  // 2. Fetch Real-Time Multi-Asset Token Prices
  const prices = await client.getRealtimePrices(['ETH', 'BTC', 'SOL', 'BNB']);
  console.log('Live Prices:', prices.prices);

  // 3. Stage a Non-Custodial Transaction Request
  const stagedTx = await client.prepareTransaction({
    recipient: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
    amount: 0.05,
    asset: 'ETH',
    network: 'sepolia'
  });
  console.log(`Approval Token Generated: ${stagedTx.approvalToken}`);
  console.log(`Sign Unsigned Payload locally on device:`, stagedTx.unsignedTransaction);

  // 4. Deploy an ERC-721 NFT Collection
  const nft = await client.deploySmartContract({
    contractType: 'erc721',
    contractName: 'CyberApe NFT',
    symbol: 'CAPE',
    totalSupply: 10000,
    network: 'sepolia'
  });
  console.log(`NFT Deployed at: ${nft.contractAddress}`);
}

run();
```

---

### 2. Python (3.8+)
```python
import os
import requests

NORTHVEIL_API_URL = "https://mcp.northveil.xyz"
API_KEY = os.getenv("NORTHVEIL_API_KEY", "nv_live_9f82a17b09c82415d8a9")
WALLET_ADDRESS = os.getenv("NORTHVEIL_WALLET_ADDRESS", "0x59148d6a9dff263a772b5a84280bc88530f38636")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
    "X-API-Key": API_KEY,
    "x-wallet-address": WALLET_ADDRESS
}

# 1. Fetch Multi-Chain Balances & Valuations
portfolio = requests.post(f"{NORTHVEIL_API_URL}/api/v1/tools/get_portfolio", json={"walletAddress": WALLET_ADDRESS}, headers=headers).json()
print("Portfolio:", portfolio)

# 2. Stage Non-Custodial Transfer
staged = requests.post(f"{NORTHVEIL_API_URL}/api/v1/transactions/prepare", json={
    "walletAddress": WALLET_ADDRESS,
    "recipient": "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417",
    "amount": 0.01,
    "asset": "ETH",
    "network": "sepolia"
}, headers=headers).json()
print(f"Staged Request ID: {staged.get('requestId')} | Approval Token: {staged.get('approvalToken')}")
```

---

### 3. Rust (Async Tokio)
```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(AUTHORIZATION, HeaderValue::from_static("Bearer nv_live_9f82a17b09c82415d8a9"));
    headers.insert("X-API-Key", HeaderValue::from_static("nv_live_9f82a17b09c82415d8a9"));
    headers.insert("x-wallet-address", HeaderValue::from_static("0x59148d6a9dff263a772b5a84280bc88530f38636"));

    // Query Multi-Chain On-Chain Balances
    let res = client.post("https://mcp.northveil.xyz/api/v1/tools/get_portfolio")
        .headers(headers)
        .json(&json!({
            "walletAddress": "0x59148d6a9dff263a772b5a84280bc88530f38636",
            "hideZeroBalances": false
        }))
        .send().await?.text().await?;

    println!("Northveil Portfolio: \n{}", res);
    Ok(())
}
```

---

### 4. Go (Golang)
```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func main() {
	payload, _ := json.Marshal(map[string]interface{}{
		"walletAddress": "0x59148d6a9dff263a772b5a84280bc88530f38636",
		"network":       "all",
	})

	req, _ := http.NewRequest("POST", "https://mcp.northveil.xyz/api/v1/tools/get_portfolio", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer nv_live_9f82a17b09c82415d8a9")
	req.Header.Set("X-API-Key", "nv_live_9f82a17b09c82415d8a9")
	req.Header.Set("x-wallet-address", "0x59148d6a9dff263a772b5a84280bc88530f38636")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println("Multi-Chain Balances:", string(body))
}
```

---

### 5. Java & Kotlin (JDK 17+)
```java
import java.net.URI;
import java.net.http.*;

public class NorthveilSDKTest {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String json = "{\"walletAddress\":\"0x59148d6a9dff263a772b5a84280bc88530f38636\",\"network\":\"all\"}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://mcp.northveil.xyz/api/v1/tools/get_portfolio"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer nv_live_9f82a17b09c82415d8a9")
            .header("X-API-Key", "nv_live_9f82a17b09c82415d8a9")
            .header("x-wallet-address", "0x59148d6a9dff263a772b5a84280bc88530f38636")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Portfolio JSON: " + response.body());
    }
}
```

---

### 6. C# / .NET
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        using var client = new HttpClient();
        var content = new StringContent(
            "{\"walletAddress\":\"0x59148d6a9dff263a772b5a84280bc88530f38636\"}",
            Encoding.UTF8, "application/json"
        );
        client.DefaultRequestHeaders.Add("Authorization", "Bearer nv_live_9f82a17b09c82415d8a9");
        client.DefaultRequestHeaders.Add("X-API-Key", "nv_live_9f82a17b09c82415d8a9");
        client.DefaultRequestHeaders.Add("x-wallet-address", "0x59148d6a9dff263a772b5a84280bc88530f38636");

        var response = await client.PostAsync("https://mcp.northveil.xyz/api/v1/tools/get_portfolio", content);
        Console.WriteLine(await response.Content.ReadAsStringAsync());
    }
}
```

---

### 7. C++ (libcurl)
```cpp
#include <iostream>
#include <string>
#include <curl/curl.h>

static size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
    ((std::string*)userp)->append((char*)contents, size * nmemb);
    return size * nmemb;
}

int main() {
    CURL* curl = curl_easy_init();
    if(curl) {
        std::string buffer;
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, "Authorization: Bearer nv_live_9f82a17b09c82415d8a9");
        headers = curl_slist_append(headers, "X-API-Key: nv_live_9f82a17b09c82415d8a9");
        headers = curl_slist_append(headers, "x-wallet-address: 0x59148d6a9dff263a772b5a84280bc88530f38636");

        std::string payload = "{\"walletAddress\":\"0x59148d6a9dff263a772b5a84280bc88530f38636\"}";

        curl_easy_setopt(curl, CURLOPT_URL, "https://mcp.northveil.xyz/api/v1/tools/get_portfolio");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &buffer);

        if(curl_easy_perform(curl) == CURLE_OK) {
            std::cout << "Response: \n" << buffer << std::endl;
        }
        curl_easy_cleanup(curl);
    }
    return 0;
}
```

---

### 8. PHP (Guzzle)
```php
<?php
require 'vendor/autoload.php';

$client = new GuzzleHttp\Client(['base_uri' => 'https://mcp.northveil.xyz']);
$res = $client->post('/api/v1/tools/get_portfolio', [
    'headers' => [
        'Content-Type'     => 'application/json',
        'Authorization'    => 'Bearer nv_live_9f82a17b09c82415d8a9',
        'X-API-Key'        => 'nv_live_9f82a17b09c82415d8a9',
        'x-wallet-address' => '0x59148d6a9dff263a772b5a84280bc88530f38636',
    ],
    'json' => [
        'walletAddress' => '0x59148d6a9dff263a772b5a84280bc88530f38636',
    ],
]);

echo $res->getBody();
```

---

### 9. Ruby (Faraday)
```ruby
require 'faraday'

conn = Faraday.new(url: 'https://mcp.northveil.xyz')
res = conn.post('/api/v1/tools/get_portfolio') do |req|
  req.headers['Content-Type'] = 'application/json'
  req.headers['Authorization'] = 'Bearer nv_live_9f82a17b09c82415d8a9'
  req.headers['X-API-Key'] = 'nv_live_9f82a17b09c82415d8a9'
  req.headers['x-wallet-address'] = '0x59148d6a9dff263a772b5a84280bc88530f38636'
  req.body = '{"walletAddress":"0x59148d6a9dff263a772b5a84280bc88530f38636"}'
end

puts res.body
```

---

### 10. Swift (iOS & macOS)
```swift
import Foundation

func fetchPortfolio() async throws {
    var req = URLRequest(url: URL(string: "https://mcp.northveil.xyz/api/v1/tools/get_portfolio")!)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.setValue("Bearer nv_live_9f82a17b09c82415d8a9", forHTTPHeaderField: "Authorization")
    req.setValue("nv_live_9f82a17b09c82415d8a9", forHTTPHeaderField: "X-API-Key")
    req.setValue("0x59148d6a9dff263a772b5a84280bc88530f38636", forHTTPHeaderField: "x-wallet-address")
    req.httpBody = "{\"walletAddress\":\"0x59148d6a9dff263a772b5a84280bc88530f38636\"}".data(using: .utf8)

    let (data, _) = try await URLSession.shared.data(for: req)
    print(String(data: data, encoding: .utf8)!)
}
```

---

## 📜 Core Architecture & Method Catalog

| Namespace | Methods | Key Capabilities |
|---|---|---|
| `client.auth` | `getMe()`, `setApiKey()`, `setWalletAddress()` | Resolve caller tier, scopes, and allowed wallet addresses. |
| `client.wallet` | `getPortfolio()`, `getWalletInfo()`, `getTokenBalance()`, `getNFTs()`, `checkWalletHealth()`, `scanWalletSecurity()` | Multi-chain balance resolution across 37+ blockchains (EVM + Solana), gas sufficiency analysis, security auditing. |
| `client.transactions` | `prepareTransaction()`, `broadcastTransaction()`, `sendTransfer()` | Non-custodial 2-step transaction staging, EIP-1559 gas estimation, and on-chain broadcast. |
| `client.contracts` | `auditSmartContract()`, `deploySmartContract()`, `createSmartContract()`, `mintTokens()`, `reserveTokens()`, `verifySmartContract()` | Solc compilation, ERC-20/ERC-721 deployment, on-chain minting, time-locked vesting escrow, AST vulnerability audit. |
| `client.dex` | `swapTokens()`, `buyTokens()`, `sellTokens()`, `setTradeOrder()`, `cancelTradeOrder()`, `getActiveOrders()` | 1inch / Uniswap V3 DEX swaps, limit orders, automated market execution guardrails. |
| `client.markets` | `getRealtimePrices()`, `getTrendingMemecoins()`, `getGasEstimate()` | Live market price aggregations (DefiLlama, CoinPaprika, DexScreener), trending tokens, real-time gas costs. |

---

## 📄 License
MIT License © 2026 Northveil Protocol.
