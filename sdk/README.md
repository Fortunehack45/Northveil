# Northveil Client SDK — Universal Multi-Language Web3 & Travel Suite

[![npm version](https://img.shields.io/npm/v/northveil-sdk.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/northveil-sdk)
[![Python Version](https://img.shields.io/badge/Python-3.8%2B-yellow.svg?style=flat-square)](https://pypi.org/project/northveil/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![NPM Downloads](https://img.shields.io/npm/dm/northveil-sdk.svg?style=flat-square)](https://www.npmjs.com/package/northveil-sdk)

The official software development kit for connecting applications to the **Northveil Protocol**. Enables developers across all major programming ecosystems to execute multi-chain crypto transfers, query live token valuations across 36+ blockchains, search global flights and hotels with real-time crypto pricing, mint digital airline boarding passes, and perform automated smart contract security audits.

---

## 📦 Package Installation by Language

| Language | Package Name / Command | Registry |
|---|---|---|
| **TypeScript / JavaScript** | `npm install northveil-sdk` | [npm](https://www.npmjs.com/package/northveil-sdk) |
| **Python** | `pip install northveil` | [PyPI](https://pypi.org/project/northveil/) |
| **Rust** | `cargo add reqwest serde serde_json tokio` | [crates.io](https://crates.io) |
| **Go (Golang)** | `go get github.com/Fortunehack45/Northveil-SDK` | [Go Modules](https://pkg.go.dev/) |
| **Java / Kotlin** | `implementation("xyz.northveil:northveil-sdk:1.0.1")` | Maven Central |
| **C# / .NET** | `dotnet add package Northveil.SDK` | NuGet |
| **PHP** | `composer require northveil/northveil-sdk` | Packagist |
| **Ruby** | `gem install northveil` | RubyGems |
| **Swift (iOS/macOS)** | `.package(url: "https://github.com/Fortunehack45/Northveil-SDK", from: "1.0.1")` | Swift Package Manager |
| **C++** | `vcpkg install cpr nlohmann-json` | vcpkg / CMake |

---

## 🚀 Quickstarts in 10 Programming Languages

### 1. TypeScript & JavaScript (Node.js & Modern Web)
```typescript
import { NorthveilClient } from 'northveil-sdk';

const client = new NorthveilClient({
  apiKey: process.env.NORTHVEIL_API_KEY || 'nv_live_9f82a17b09c82415d8a9',
  walletAddress: '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417'
});

async function run() {
  // Check Identity & Permissions
  const me = await client.auth.getMe();
  console.log(`Authenticated as: ${me.keyName} [Tier: ${me.tier}]`);

  // Search Live Flights in ETH/USD
  const flights = await client.searchFlights({
    origin: 'LHR',
    destination: 'JFK',
    departureDate: '2026-09-20',
    cabinClass: 'business',
    currency: 'ETH'
  });
  console.log(`Found ${flights.totalOffers} flights. Top fare: ${flights.offers[0].priceCrypto} ETH`);

  // Inspect Multi-Chain Portfolio
  const portfolio = await client.getPortfolio();
  console.log(`Total Portfolio USD: $${portfolio.summary?.totalValueUsd}`);
}

run();
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

# Search Flights
flights = client.search_flights(origin="LHR", destination="JFK", cabin_class="business")
for f in flights.get("offers", []):
    print(f"• {f['airline']} ({f['flightNumber']}): {f['priceCrypto']} {f['currency']} (~${f['priceUsd']} USD)")

# On-Chain Ticket Reservation
booking = client.make_reservation(
    category="flight",
    title="Flight BA-526 London to New York",
    provider="British Airways",
    price_usd=1792.0,
    passenger_name="Alex Northveil"
)
print(f"PNR Issued: {booking.get('pnr')} | Ref: {booking.get('bookingReference')}")
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
    headers.insert("x-wallet-address", HeaderValue::from_static("0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417"));

    let res = client.post("https://mcp.northveil.xyz/api/v1/tools/search_flights")
        .headers(headers)
        .json(&json!({
            "origin": "LHR",
            "destination": "JFK",
            "departureDate": "2026-09-20",
            "cabinClass": "business",
            "currency": "ETH"
        }))
        .send().await?.text().await?;

    println!("Northveil Flights:
{}", res);
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
	payload, _ := json.Marshal(map[string]string{
		"origin":        "LHR",
		"destination":   "JFK",
		"departureDate": "2026-09-20",
		"cabinClass":    "business",
		"currency":      "ETH",
	})

	req, _ := http.NewRequest("POST", "https://mcp.northveil.xyz/api/v1/tools/search_flights", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer nv_live_9f82a17b09c82415d8a9")
	req.Header.Set("X-API-Key", "nv_live_9f82a17b09c82415d8a9")
	req.Header.Set("x-wallet-address", "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println("Response:", string(body))
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
        String json = "{\"origin\":\"LHR\",\"destination\":\"JFK\",\"departureDate\":\"2026-09-20\",\"cabinClass\":\"business\",\"currency\":\"ETH\"}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://mcp.northveil.xyz/api/v1/tools/search_flights"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer nv_live_9f82a17b09c82415d8a9")
            .header("X-API-Key", "nv_live_9f82a17b09c82415d8a9")
            .header("x-wallet-address", "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
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
            "{\"origin\":\"LHR\",\"destination\":\"JFK\",\"departureDate\":\"2026-09-20\",\"cabinClass\":\"business\",\"currency\":\"ETH\"}",
            Encoding.UTF8, "application/json"
        );
        client.DefaultRequestHeaders.Add("Authorization", "Bearer nv_live_9f82a17b09c82415d8a9");
        client.DefaultRequestHeaders.Add("X-API-Key", "nv_live_9f82a17b09c82415d8a9");
        client.DefaultRequestHeaders.Add("x-wallet-address", "0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417");

        var response = await client.PostAsync("https://mcp.northveil.xyz/api/v1/tools/search_flights", content);
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
        headers = curl_slist_append(headers, "x-wallet-address: 0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417");

        std::string payload = "{\"origin\":\"LHR\",\"destination\":\"JFK\",\"departureDate\":\"2026-09-20\",\"cabinClass\":\"business\",\"currency\":\"ETH\"}";

        curl_easy_setopt(curl, CURLOPT_URL, "https://mcp.northveil.xyz/api/v1/tools/search_flights");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &buffer);

        if(curl_easy_perform(curl) == CURLE_OK) {
            std::cout << "Response:
" << buffer << std::endl;
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
$res = $client->post('/api/v1/tools/search_flights', [
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

echo $res->getBody();
```

---

### 9. Ruby (Faraday)
```ruby
require 'faraday'

conn = Faraday.new(url: 'https://mcp.northveil.xyz')
res = conn.post('/api/v1/tools/search_flights') do |req|
  req.headers['Content-Type'] = 'application/json'
  req.headers['Authorization'] = 'Bearer nv_live_9f82a17b09c82415d8a9'
  req.headers['X-API-Key'] = 'nv_live_9f82a17b09c82415d8a9'
  req.headers['x-wallet-address'] = '0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417'
  req.body = '{"origin":"LHR","destination":"JFK","departureDate":"2026-09-20","cabinClass":"business","currency":"ETH"}'
end

puts res.body
```

---

### 10. Swift (iOS & macOS)
```swift
import Foundation

func searchFlights() async throws {
    var req = URLRequest(url: URL(string: "https://mcp.northveil.xyz/api/v1/tools/search_flights")!)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    req.setValue("Bearer nv_live_9f82a17b09c82415d8a9", forHTTPHeaderField: "Authorization")
    req.setValue("nv_live_9f82a17b09c82415d8a9", forHTTPHeaderField: "X-API-Key")
    req.setValue("0x56f0fdbe1b09c0f65da1cb73ef878c07ec645417", forHTTPHeaderField: "x-wallet-address")
    req.httpBody = "{\"origin\":\"LHR\",\"destination\":\"JFK\",\"departureDate\":\"2026-09-20\",\"cabinClass\":\"business\",\"currency\":\"ETH\"}".data(using: .utf8)

    let (data, _) = try await URLSession.shared.data(for: req)
    print(String(data: data, encoding: .utf8)!)
}
```

---

## 📜 Complete Methods & Tool Catalog (38 Tools)

| Namespace | Methods | Key Capabilities |
|---|---|---|
| `client.auth` | `getMe()`, `setApiKey()`, `setWalletAddress()` | Resolve caller tier, scopes, and allowed wallet addresses. |
| `client.travel` | `searchFlights()`, `searchHotels()`, `searchEvents()`, `makeReservation()`, `getBookingStatus()`, `verifyTicket()` | Query IATA flights & hotels, calculate live crypto fares, mint cryptographic PNR digital boarding passes. |
| `client.wallet` | `getPortfolio()`, `getWalletInfo()`, `getTokenBalance()`, `checkHealth()`, `scanSecurity()`, `getNFTs()`, `sendTransfer()` | Multi-chain balance resolution across 36+ blockchains, gas sufficiency analysis, custodial token transfers. |
| `client.contracts` | `auditSmartContract()`, `deploySmartContract()`, `createSmartContract()`, `mintTokens()`, `reserveTokens()`, `verifySmartContract()` | Static AST vulnerability scoring, ERC-20/721 deployment, on-chain minting, and time-locked vesting escrow. |
| `client.dex` | `executeSwap()`, `executeDexSwap()`, `buyTokens()`, `sellTokens()`, `tradeTokens()`, `setTradeOrder()`, `cancelTradeOrder()` | Uniswap V3 and Raydium routing, limit orders, automated market execution. |
| `client.markets` | `getRealtimePrices()`, `getTrendingMemecoins()`, `getGasEstimate()` | Live market price feeds via Coinpaprika, trending memecoins, real-time gas estimates. |

---

## 📄 License
MIT License © 2026 Northveil Protocol.
