# Northveil Enterprise Client SDK & Multi-Language Integration Suite

[![npm version](https://img.shields.io/npm/v/northveil-sdk.svg?style=flat-square)](https://www.npmjs.com/package/northveil-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![NPM Downloads](https://img.shields.io/npm/dm/northveil-sdk.svg?style=flat-square)](https://www.npmjs.com/package/northveil-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg?style=flat-square)](https://www.python.org/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg?style=flat-square)](https://www.rust-lang.org/)
[![Go](https://img.shields.io/badge/Go-1.20+-cyan.svg?style=flat-square)](https://go.dev/)

> **The Universal Developer Interface for Autonomous Web3 Transactions, Multi-Chain Custody, Smart Contract AST Audits, Real-Time Market Feeds, and Autonomous Crypto Travel Booking across 36+ Blockchains.**

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Installation & Setup](#-installation--setup)
3. [Universal Multi-Language Integration (Top 10 Languages)](#-universal-multi-language-integration)
   - [1. TypeScript & JavaScript (Node.js & Web)](#1-typescript--javascript-nodejs--browser)
   - [2. Python (3.8+)](#2-python-38)
   - [3. Rust (Async Tokio + Reqwest)](#3-rust-async-tokio--reqwest)
   - [4. Go (Golang 1.20+)](#4-go-golang-120)
   - [5. Java & Kotlin (JDK 17+)](#5-java--kotlin-jdk-17)
   - [6. C# / .NET (Core 8.0+)](#6-c--net-core-80)
   - [7. C++ (C++17 / libcurl / nlohmann-json)](#7-c-c17--libcurl--nlohmann-json)
   - [8. PHP (PHP 8.1+ / Guzzle)](#8-php-php-81--guzzle)
   - [9. Ruby (Ruby 3.0+ / Faraday)](#9-ruby-ruby-30--faraday)
   - [10. Swift (iOS / macOS / Codable)](#10-swift-ios--macos)
4. [Complete 38-Tool API Reference & Schema Catalog](#-complete-38-tool-api-reference)
   - [Autonomous Travel & Flight Engine](#a-autonomous-travel--flight-engine)
   - [Multi-Chain Portfolio & Wallet Suite](#b-multi-chain-portfolio--wallet-suite)
   - [Smart Contracts, Compilers & AST Security Auditor](#c-smart-contracts-compilers--ast-security-auditor)
   - [DEX Aggregation, Cross-Chain Swaps & Custodial Signing](#d-dex-aggregation-cross-chain-swaps--custodial-signing)
   - [Real-Time Market Prices & Webhooks](#e-real-time-market-prices--webhooks)
5. [Authentication, Scopes & Tenant Security Boundary](#-authentication-scopes--tenant-security-boundary)
6. [Error Handling & Standard HTTP / JSON-RPC Codes](#-error-handling--standard-codes)
7. [Webhook Security & HMAC-SHA256 Signature Verification](#-webhook-security--hmac-sha256-verification)
8. [License & Community](#-license--community)

---

## 🏛️ Architectural Overview

Northveil bridges traditional software engineering and autonomous AI agents with multi-chain decentralized infrastructure. Every method in this SDK maps directly to the high-performance Northveil REST Tool Gateway and Model Context Protocol (MCP) Server.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   YOUR APPLICATION / AI AGENT / BACKEND                  │
│   (TypeScript / Python / Rust / Go / Java / C# / C++ / PHP / Ruby / Swift)│
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTPS JSON-RPC / REST Gateway
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    NORTHVEIL PROTOCOL GATEWAY ENGINE                     │
│   • Scoped Multi-Tenant Authentication & AES-256-GCM Key Derivation      │
│   • Strict Wallet Boundary Guard (403 Forbidden on Foreign Access)       │
│   • Dynamic Coinpaprika Real-Time Price Conversion Feed                  │
└──────────┬─────────────────────────┬─────────────────────────┬───────────┘
           │                         │                         │
           ▼                         ▼                         ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ 36+ EVM & SOLANA   │    │  AUTONOMOUS TRAVEL │    │ STATIC AST SMART   │
│ ON-CHAIN RPCS      │    │  & AIRLINE ENGINE  │    │ CONTRACT AUDITOR   │
│ (Sepolia, Mainnet, │    │  (IATA Routing,    │    │ (Slither, AST,     │
│ Polygon, Arbitrum) │    │  Live Crypto PNRs) │    │ Backdoor Guard)    │
└────────────────────┘    └────────────────────┘    └────────────────────┘
```

---

## 📦 Installation & Setup

### Node.js / TypeScript
```bash
npm install northveil-sdk
# or
pnpm add northveil-sdk
# or
yarn add northveil-sdk
```

### Python
```bash
pip install northveil
```

### Official API Gateways
- **Production Edge Gateway**: `https://mcp.northveil.xyz`
- **Serverless Vercel Mirror**: `https://northveil-mcp.vercel.app`
- **Local MCP Dev Instance**: `http://localhost:3001`

---

## 🌍 Universal Multi-Language Integration

### 1. TypeScript & JavaScript (Node.js & Browser)

```typescript
import { NorthveilClient } from 'northveil-sdk';

const client = new NorthveilClient({
  apiKey: 'nv_live_9f82a17b09c82415d8a9',
  walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
  baseUrl: 'https://mcp.northveil.xyz'
});

async function main() {
  // 1. Verify Identity & Permissions
  const me = await client.auth.getMe();
  console.log(`Authenticated as ${me.keyName} (${me.tier})`);

  // 2. Search Live Crypto Flights
  const flights = await client.searchFlights({
    origin: 'LHR',
    destination: 'JFK',
    departureDate: '2026-09-20',
    cabinClass: 'business',
    passengers: 1,
    currency: 'ETH'
  });
  console.log(`Found ${flights.totalOffers} flights. Top fare: ${flights.offers[0].priceCrypto} ETH`);

  // 3. Inspect Multi-Chain Portfolio
  const portfolio = await client.getPortfolio();
  console.log(`Total Balance USD: $${portfolio.summary?.totalValueUsd}`);

  // 4. Audit Solidity Contract for Vulnerabilities
  const audit = await client.auditSmartContract(`
    contract Vault {
      mapping(address => uint) public balances;
      function withdraw() public {
        (bool s,) = msg.sender.call{value: balances[msg.sender]}("");
        require(s);
        balances[msg.sender] = 0;
      }
    }
  `);
  console.log(`Security Score: ${audit.securityScore}/100 (Risk: ${audit.riskLevel})`);
}

main().catch(console.error);
```

---

### 2. Python (3.8+)

```python
import northveil
from northveil import Northveil

client = Northveil(
    api_key="nv_live_9f82a17b09c82415d8a9",
    wallet_address="0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417"
)

# 1. Identity & Scopes
print("Auth:", client.whoami())

# 2. Autonomous Flight Search
flights = client.search_flights(origin="LHR", destination="JFK", cabin_class="business")
for f in flights.get("offers", []):
    print(f"• {f['airline']} ({f['flightNumber']}): {f['priceCrypto']} {f['currency']} (~${f['priceUsd']} USD)")

# 3. Create Web3 Ticket Reservation & Mint Cryptographic PNR Pass
booking = client.make_reservation(
    category="flight",
    title="Flight BA-526 London to New York",
    provider="British Airways",
    price_usd=1792.0,
    passenger_name="Alex Northveil"
)
print(f"Confirmed PNR: {booking.get('pnr')} | Ref: {booking.get('bookingReference')}")

# 4. Multi-Chain Portfolio Valuation
portfolio = client.get_portfolio()
print(f"Total Valuation: ${portfolio.get('summary', {}).get('totalValueUsd'):,.2f} USD")
```

---

### 3. Rust (Async Tokio + Reqwest)

```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Serialize, Deserialize)]
struct FlightOffer {
    airline: String,
    flightNumber: String,
    priceCrypto: String,
    currency: String,
    priceUsd: f64,
}

#[derive(Debug, Serialize, Deserialize)]
struct FlightResponse {
    success: bool,
    totalOffers: Option<usize>,
    offers: Option<Vec<FlightOffer>>,
}

pub struct NorthveilClient {
    base_url: String,
    api_key: String,
    wallet_address: String,
    http: reqwest::Client,
}

impl NorthveilClient {
    pub fn new(api_key: &str, wallet_address: &str) -> Self {
        Self {
            base_url: "https://mcp.northveil.xyz".to_string(),
            api_key: api_key.to_string(),
            wallet_address: wallet_address.to_string(),
            http: reqwest::Client::new(),
        }
    }

    pub async fn search_flights(&self, origin: &str, destination: &str) -> Result<FlightResponse, reqwest::Error> {
        let url = format!("{}/api/v1/tools/search_flights", self.base_url);
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
        headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", self.api_key)).unwrap());
        headers.insert("X-API-Key", HeaderValue::from_str(&self.api_key).unwrap());
        headers.insert("x-wallet-address", HeaderValue::from_str(&self.wallet_address).unwrap());

        let payload = json!({
            "origin": origin,
            "destination": destination,
            "departureDate": "2026-09-20",
            "cabinClass": "business",
            "currency": "ETH"
        });

        let res = self.http.post(&url)
            .headers(headers)
            .json(&payload)
            .send()
            .await?
            .json::<FlightResponse>()
            .await?;

        Ok(res)
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = NorthveilClient::new("nv_live_9f82a17b09c82415d8a9", "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417");
    let flights = client.search_flights("LHR", "JFK").await?;
    println!("Found {:?} flight offers from Northveil Protocol", flights.totalOffers);
    Ok(())
}
```

---

### 4. Go (Golang 1.20+)

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type NorthveilClient struct {
	BaseURL       string
	APIKey        string
	WalletAddress string
	HTTPClient    *http.Client
}

func NewNorthveilClient(apiKey, walletAddress string) *NorthveilClient {
	return &NorthveilClient{
		BaseURL:       "https://mcp.northveil.xyz",
		APIKey:        apiKey,
		WalletAddress: walletAddress,
		HTTPClient:    &http.Client{Timeout: 15 * time.Second},
	}
}

func (c *NorthveilClient) CallTool(toolName string, params map[string]interface{}) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v1/tools/%s", c.BaseURL, toolName)
	jsonBytes, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("X-API-Key", c.APIKey)
	req.Header.Set("x-wallet-address", c.WalletAddress)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	return result, nil
}

func main() {
	client := NewNorthveilClient("nv_live_9f82a17b09c82415d8a9", "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417")

	// Search Flights
	flights, _ := client.CallTool("search_flights", map[string]interface{}{
		"origin":        "LHR",
		"destination":   "JFK",
		"departureDate": "2026-09-20",
		"cabinClass":    "business",
		"currency":      "ETH",
	})
	fmt.Printf("Flight Search Result: %+v
", flights["route"])
}
```

---

### 5. Java & Kotlin (JDK 17+)

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class NorthveilApp {
    private static final String BASE_URL = "https://mcp.northveil.xyz";
    private static final String API_KEY = "nv_live_9f82a17b09c82415d8a9";
    private static final String WALLET = "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417";

    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        String payload = "{\"origin\": \"LHR\", \"destination\": \"JFK\", \"departureDate\": \"2026-09-20\", \"cabinClass\": \"business\", \"currency\": \"ETH\"}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/v1/tools/search_flights"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + API_KEY)
                .header("X-API-Key", API_KEY)
                .header("x-wallet-address", WALLET)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("HTTP Status: " + response.statusCode());
        System.out.println("Response Payload: " + response.body());
    }
}
```

---

### 6. C# / .NET (Core 8.0+)

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class NorthveilClient
{
    private readonly HttpClient _http = new HttpClient();
    private readonly string _baseUrl = "https://mcp.northveil.xyz";
    private readonly string _apiKey;
    private readonly string _walletAddress;

    public NorthveilClient(string apiKey, string walletAddress)
    {
        _apiKey = apiKey;
        _walletAddress = walletAddress;
    }

    public async Task<string> SearchFlightsAsync(string origin, string destination)
    {
        var url = $"{_baseUrl}/api/v1/tools/search_flights";
        var payload = JsonSerializer.Serialize(new
        {
            origin = origin,
            destination = destination,
            departureDate = "2026-09-20",
            cabinClass = "business",
            currency = "ETH"
        });

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Add("Authorization", $"Bearer {_apiKey}");
        request.Headers.Add("X-API-Key", _apiKey);
        request.Headers.Add("x-wallet-address", _walletAddress);
        request.Content = new StringContent(payload, Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        return await response.Content.ReadAsStringAsync();
    }
}

class Program
{
    static async Task Main(string[] args)
    {
        var client = new NorthveilClient("nv_live_9f82a17b09c82415d8a9", "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417");
        var result = await client.SearchFlightsAsync("LHR", "JFK");
        Console.WriteLine("Flight Search:
" + result);
    }
}
```

---

### 7. C++ (C++17 / libcurl / nlohmann-json)

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
        std::string readBuffer;
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, "Authorization: Bearer nv_live_9f82a17b09c82415d8a9");
        headers = curl_slist_append(headers, "X-API-Key: nv_live_9f82a17b09c82415d8a9");
        headers = curl_slist_append(headers, "x-wallet-address: 0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417");

        std::string jsonPayload = "{"origin":"LHR","destination":"JFK","departureDate":"2026-09-20","cabinClass":"business","currency":"ETH"}";

        curl_easy_setopt(curl, CURLOPT_URL, "https://mcp.northveil.xyz/api/v1/tools/search_flights");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonPayload.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);

        CURLcode res = curl_easy_perform(curl);
        if(res == CURLE_OK) {
            std::cout << "Response:
" << readBuffer << std::endl;
        }
        curl_easy_cleanup(curl);
    }
    return 0;
}
```

---

### 8. PHP (PHP 8.1+ / Guzzle)

```php
<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client([
    'base_uri' => 'https://mcp.northveil.xyz',
    'timeout'  => 10.0,
]);

$response = $client->post('/api/v1/tools/search_flights', [
    'headers' => [
        'Content-Type'     => 'application/json',
        'Authorization'    => 'Bearer nv_live_9f82a17b09c82415d8a9',
        'X-API-Key'        => 'nv_live_9f82a17b09c82415d8a9',
        'x-wallet-address' => '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417',
    ],
    'json' => [
        'origin'        => 'LHR',
        'destination'   => 'JFK',
        'departureDate' => '2026-09-20',
        'cabinClass'    => 'business',
        'currency'      => 'ETH',
    ],
]);

echo "Flight Search Response:
" . $response->getBody();
```

---

### 9. Ruby (Ruby 3.0+ / Faraday)

```ruby
require 'faraday'
require 'json'

conn = Faraday.new(url: 'https://mcp.northveil.xyz') do |f|
  f.request :json
  f.response :json
end

response = conn.post('/api/v1/tools/search_flights') do |req|
  req.headers['Authorization'] = 'Bearer nv_live_9f82a17b09c82415d8a9'
  req.headers['X-API-Key'] = 'nv_live_9f82a17b09c82415d8a9'
  req.headers['x-wallet-address'] = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417'
  req.body = {
    origin: 'LHR',
    destination: 'JFK',
    departureDate: '2026-09-20',
    cabinClass: 'business',
    currency: 'ETH'
  }
end

puts "Status: #{response.status}"
puts "Payload: #{response.body}"
```

---

### 10. Swift (iOS / macOS)

```swift
import Foundation

struct FlightRequest: Codable {
    let origin: String
    let destination: String
    let departureDate: String
    let cabinClass: String
    let currency: String
}

func searchFlights() async throws {
    guard let url = URL(string: "https://mcp.northveil.xyz/api/v1/tools/search_flights") else { return }
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer nv_live_9f82a17b09c82415d8a9", forHTTPHeaderField: "Authorization")
    request.setValue("nv_live_9f82a17b09c82415d8a9", forHTTPHeaderField: "X-API-Key")
    request.setValue("0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417", forHTTPHeaderField: "x-wallet-address")

    let payload = FlightRequest(origin: "LHR", destination: "JFK", departureDate: "2026-09-20", cabinClass: "business", currency: "ETH")
    request.httpBody = try JSONEncoder().encode(payload)

    let (data, response) = try await URLSession.shared.data(for: request)
    if let jsonString = String(data: data, encoding: .utf8) {
        print("Northveil Flights:
\(jsonString)")
    }
}
```

---

## 🛠️ Complete 38-Tool API Reference

Every endpoint is accessible via `POST /api/v1/tools/:toolName` or via JSON-RPC `{"method": "tools/call", "params": {"name": ":toolName", "arguments": {}}}` on `/mcp`.

| # | Tool Name | Scope Tier | Category | Description |
|---|---|---|---|---|
| 1 | `search_flights` | Public Discovery | Travel | Search live airline flights, schedules & crypto fares |
| 2 | `search_hotels` | Public Discovery | Travel | Search global hotel accommodations & crypto pricing |
| 3 | `search_events_and_movies` | Public Discovery | Travel | Search concerts, IMAX screenings & VIP entertainment |
| 4 | `make_reservation` | Scoped Auth | Travel | Issue cryptographic airline PNR passes and ticket reservations |
| 5 | `list_reservations` | Scoped Auth | Travel | Query all active flight and hotel bookings |
| 6 | `get_booking_status` | Public Discovery | Travel | Verify real-time confirmation status by 6-char PNR |
| 7 | `verify_ticket_confirmation`| Public Discovery | Travel | Cryptographically verify digital airline pass authenticity |
| 8 | `get_portfolio` | Scoped Auth | Wallet | Retrieve 36+ chain balances with live USD valuations |
| 9 | `get_wallet_info` | Scoped Auth | Wallet | Query multi-chain public address mappings |
| 10 | `get_token_balance` | Scoped Auth | Wallet | Check balance of specific crypto token |
| 11 | `get_transaction_history` | Scoped Auth | Wallet | Query chronological on-chain transaction ledger |
| 12 | `check_wallet_health` | Scoped Auth | Security | Run automated gas sufficiency & diversification scan |
| 13 | `scan_wallet_security` | Scoped Auth | Security | Inspect open ERC-20 allowances & phishing vectors |
| 14 | `create_wallet` | Scoped Auth | Custody | Generate new BIP-39 multi-chain wallet vault |
| 15 | `send_transfer` | Scoped Auth | Transfer | Execute on-chain transfer via custodial signer |
| 16 | `execute_swap` | Scoped Auth | DEX | Swap crypto assets across EVM / Solana DEXs |
| 17 | `execute_dex_swap` | Scoped Auth | DEX | Route multi-hop swaps across Uniswap V3 & 1inch |
| 18 | `buy_tokens` | Scoped Auth | Trade | Place automated market buy order |
| 19 | `sell_tokens` | Scoped Auth | Trade | Place automated market sell order |
| 20 | `trade_tokens` | Scoped Auth | Trade | Execute limit or algorithmic trade order |
| 21 | `set_trade_order` | Scoped Auth | Trade | Submit time-locked limit order |
| 22 | `cancel_trade_order` | Scoped Auth | Trade | Cancel active unfilled trade order |
| 23 | `get_active_orders` | Scoped Auth | Trade | List pending limit and DEX orders |
| 24 | `deploy_smart_contract` | Scoped Auth | Contracts | Deploy ERC-20, ERC-721, Staking contracts |
| 25 | `create_smart_contract` | Scoped Auth | Contracts | Generate Solidity bytecode & ABI from natural language |
| 26 | `audit_smart_contract` | Public Discovery | Security | Deep AST vulnerability, backdoor & reentrancy analysis |
| 27 | `audit_token` | Public Discovery | Security | Analyze ERC-20 honeypot risks & minting privileges |
| 28 | `verify_smart_contract` | Public Discovery | Contracts | Verify and publish source code on block explorer |
| 29 | `mint_tokens` | Scoped Auth | Contracts | Mint new tokens from deployed ERC-20 contract |
| 30 | `reserve_tokens` | Scoped Auth | Contracts | Lock tokens into time-locked vesting escrow |
| 31 | `get_realtime_prices` | Public Discovery | Markets | Fetch live crypto asset rates via Coinpaprika |
| 32 | `get_trending_memecoins` | Public Discovery | Markets | Query trending tokens across Raydium & Uniswap |
| 33 | `get_gas_estimate` | Public Discovery | Network | Real-time gas prices (slow, standard, fast) |
| 34 | `get_nft_gallery` | Scoped Auth | Wallet | Retrieve full multi-chain NFT collection metadata |
| 35 | `create_transaction_request`| Scoped Auth | Custody | Stage transaction for multi-sig approval |
| 36 | `approve_transaction` | Scoped Auth | Custody | Sign and broadcast staged transaction |
| 37 | `reject_transaction` | Scoped Auth | Custody | Reject and revoke staged transaction |
| 38 | `upload_contract_asset` | Scoped Auth | Storage | Upload token logos & NFT metadata to Supabase |

---

## 🔒 Authentication, Scopes & Tenant Security Boundary

1. **Bearer Token & API Key Authentication**:
   Include your Northveil API Key in the `Authorization` or `X-API-Key` HTTP header:
   ```http
   Authorization: Bearer nv_live_9f82a17b09c82415d8a9
   X-API-Key: nv_live_9f82a17b09c82415d8a9
   ```

2. **Strict Multi-Tenant Isolation**:
   When querying sensitive endpoints (`get_portfolio`, `get_wallet_info`, `send_transfer`, `mint_tokens`), the server verifies caller ownership against Supabase DB `mcp_api_keys`. Attempting to access or alter someone else's wallet returns:
   ```json
   {
     "error": "🔒 403 Forbidden: Unauthorized access. Your API Key is scoped to wallet 0x56f0... and cannot access or manipulate private resources for 0x0000..."
   }
   ```

3. **Zero Credential Exposure**:
   Private keys, seed phrases, and AES-256 initialization vectors are never serialized or returned in any response.

---

## 🛡️ Webhook Security & HMAC-SHA256 Verification

Northveil broadcasts signed webhooks on booking confirmations, trade executions, and contract deployments. Verify payloads in Node.js:

```javascript
import crypto from 'crypto';

function verifyNorthveilWebhook(payloadString, signatureHeader, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payloadString).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
}
```

---

## 📄 License

MIT License © 2026 Northveil Protocol. Built for autonomous AI agents, enterprise web3 applications, and global crypto travel.
