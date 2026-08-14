# Northveil Technical Encyclopedia — Volume III: Universal 38-Tool API & MCP Specification

Every tool in the Northveil ecosystem is exposed via JSON-RPC 2.0 (`POST /mcp`) and REST (`POST /api/v1/tools/:name`).

## 1. Autonomous Travel & Airline Tools
### `search_flights`
- **Description**: Search live airline flight schedules, routes, and dynamic cryptocurrency pricing.
- **Input Parameters**:
  - `origin` (string, required): 3-letter IATA airport code (e.g. `LHR`, `JFK`, `LAX`).
  - `destination` (string, required): 3-letter IATA airport code (e.g. `JFK`, `HND`, `DXB`).
  - `departureDate` (string, optional): Departure date `YYYY-MM-DD` (default: 14 days ahead).
  - `cabinClass` (string, optional): `economy`, `premium_economy`, `business`, `first`.
  - `passengers` (integer, optional): Number of passengers (1-9).
  - `currency` (string, optional): `ETH`, `SOL`, `USDC`, `USD`.
- **Response Schema**:
  ```json
  {
    "success": true,
    "route": "LHR ➔ JFK",
    "totalOffers": 5,
    "offers": [
      {
        "offerId": "off_flt_1_xyz",
        "airline": "British Airways",
        "flightNumber": "BA-526",
        "departureTime": "08:30",
        "arrivalTime": "11:45",
        "duration": "7h 15m",
        "priceUsd": 1792,
        "priceCrypto": "0.5194",
        "currency": "ETH",
        "seatsRemaining": 7
      }
    ]
  }
  ```

### `make_reservation`
- **Description**: Mint on-chain ticket reservation and issue verifiable cryptographic airline PNR pass.
- **Input Parameters**:
  - `category` (string, required): `flight`, `hotel`, `movie`, `event`, `dining`.
  - `title` (string, required): Description of the reserved item.
  - `provider` (string, required): Provider/carrier name (e.g. `British Airways`).
  - `priceUsd` (number, required): Price in USD.
  - `currency` (string, optional): Payment currency (default: `ETH`).
  - `passengerName` (string, required): Full legal name of passenger/guest.
  - `contactEmail` (string, required): Email address for pass transmission.

## 2. Multi-Chain Wallet & Custodial Tools
### `get_portfolio`
- **Description**: Retrieve balances across 36+ blockchains with live USD valuations.
- **Input Parameters**:
  - `walletAddress` (string, optional): Target wallet (defaults to authenticated caller).
  - `hideZeroBalances` (boolean, optional): Filter out zero-balance assets.

### `send_transfer`
- **Description**: Execute on-chain transfer via custodial signing service.
- **Input Parameters**:
  - `to` (string, required): Recipient wallet address (`0x...`).
  - `amount` (string, required): Amount to transfer.
  - `token` (string, optional): `ETH`, `USDC`, `POL`, `BNB` (default: `ETH`).
  - `chain` (string, optional): `sepolia`, `ethereum`, `polygon`, `arbitrum`, `base`.

## 3. Smart Contract Studio Tools
### `audit_smart_contract`
- **Description**: Run AST static vulnerability analysis on Solidity source code.
- **Input Parameters**:
  - `code` (string, required): Complete Solidity source code (`pragma solidity ^0.8.0...`).
- **Response Schema**:
  ```json
  {
    "securityScore": 92,
    "riskLevel": "LOW RISK",
    "vulnerabilities": [],
    "compilerVersion": "^0.8.20",
    "formattedMarkdown": "### SMART CONTRACT AUDIT REPORT..."
  }
  ```
