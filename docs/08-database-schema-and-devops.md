# Volume 8: Database Topology & DevOps Schema

## 1. PostgreSQL Database Schema (Supabase)

Northveil utilizes PostgreSQL with Row-Level Security (RLS) policies for persistent state management.

### Entity Relationship Diagram
```
┌──────────────────┐       ┌────────────────────────┐
│     wallets      │◄──────┤  transaction_requests  │
│  - id            │       │  - id                  │
│  - address       │       │  - approval_token      │
│  - encrypted_cred│       │  - status              │
│  - iv, auth_tag  │       └────────────────────────┘
│  - salt          │
└────────┬─────────┘
         │
         │                 ┌────────────────────────┐
         ├────────────────►│       contracts        │
         │                 │  - predicted_address   │
         │                 │  - solidity_code       │
         │                 └────────────────────────┘
         │
         │                 ┌────────────────────────┐
         └────────────────►│   wallet_audit_logs    │
                           │  - action              │
                           │  - timestamp           │
                           └────────────────────────┘
```

## 2. Table DDL Definitions

```sql
-- Wallets Table with AES-256-GCM Cryptographic Columns
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'default_user',
    address TEXT UNIQUE NOT NULL,
    chain_id TEXT NOT NULL DEFAULT 'ethereum',
    name TEXT NOT NULL,
    encrypted_credential TEXT,
    credential_type TEXT DEFAULT 'seed_phrase',
    derivation_path TEXT DEFAULT 'm/44''/60''/0''/0/0',
    iv TEXT,
    auth_tag TEXT,
    salt TEXT,
    wallet_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Requests with Single-Use Approval Tokens
CREATE TABLE IF NOT EXISTS public.transaction_requests (
    id TEXT PRIMARY KEY,
    request_id TEXT UNIQUE NOT NULL,
    wallet_address TEXT NOT NULL,
    recipient TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    asset TEXT NOT NULL DEFAULT 'ETH',
    network TEXT NOT NULL DEFAULT 'sepolia',
    approval_token TEXT UNIQUE NOT NULL,
    token_used BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    explorer_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
