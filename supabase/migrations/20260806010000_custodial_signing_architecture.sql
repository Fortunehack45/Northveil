-- Supabase Database Migration: Custodial Wallet Architecture, Transaction Requests & Security Audit Logs
-- Schema version: 20260806010000_custodial_signing_architecture.sql

-- 1. Table: public.wallets (Encrypted Wallet Credential Vault)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'default_user',
    address TEXT NOT NULL UNIQUE,
    chain_id TEXT NOT NULL DEFAULT 'ethereum',
    encrypted_credential TEXT NOT NULL,
    credential_type TEXT NOT NULL CHECK (credential_type IN ('private_key', 'seed_phrase')),
    derivation_path TEXT DEFAULT 'm/44''/60''/0''/0/0',
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    name TEXT DEFAULT 'Northveil Vault Wallet',
    wallet_status TEXT NOT NULL DEFAULT 'active' CHECK (wallet_status IN ('active', 'disabled', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by address and user_id
CREATE INDEX IF NOT EXISTS idx_wallets_address ON public.wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

-- Enable RLS on public.wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public insert wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public update wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public delete wallets" ON public.wallets;

CREATE POLICY "Allow public read wallets" ON public.wallets FOR SELECT USING (true);
CREATE POLICY "Allow public insert wallets" ON public.wallets FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow public update wallets" ON public.wallets FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow public delete wallets" ON public.wallets FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- 2. Table: public.transaction_requests (Transaction Preparation, Approval & Single-Use Tokens)
CREATE TABLE IF NOT EXISTS public.transaction_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id TEXT NOT NULL UNIQUE DEFAULT ('req_' || md5(random()::text || clock_timestamp()::text)),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    recipient TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    asset TEXT NOT NULL DEFAULT 'ETH',
    network TEXT NOT NULL DEFAULT 'sepolia',
    chain_id NUMERIC NOT NULL DEFAULT 11155111,
    estimated_fee_usd NUMERIC DEFAULT 0.42,
    contract_summary TEXT DEFAULT 'Direct Native Token Transfer',
    total_amount NUMERIC NOT NULL DEFAULT 0,
    nonce NUMERIC DEFAULT 0,
    unsigned_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'signed', 'broadcasted', 'rejected', 'expired', 'failed')),
    approval_token TEXT NOT NULL UNIQUE DEFAULT ('tok_' || md5(random()::text || clock_timestamp()::text)),
    token_used BOOLEAN NOT NULL DEFAULT FALSE,
    tx_hash TEXT,
    explorer_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by request_id, approval_token, and wallet_address
CREATE INDEX IF NOT EXISTS idx_tx_req_request_id ON public.transaction_requests(request_id);
CREATE INDEX IF NOT EXISTS idx_tx_req_token ON public.transaction_requests(approval_token);
CREATE INDEX IF NOT EXISTS idx_tx_req_address ON public.transaction_requests(wallet_address);

-- Enable RLS on public.transaction_requests
ALTER TABLE public.transaction_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read tx_req" ON public.transaction_requests;
DROP POLICY IF EXISTS "Allow public insert tx_req" ON public.transaction_requests;
DROP POLICY IF EXISTS "Allow public update tx_req" ON public.transaction_requests;
DROP POLICY IF EXISTS "Allow public delete tx_req" ON public.transaction_requests;

CREATE POLICY "Allow public read tx_req" ON public.transaction_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert tx_req" ON public.transaction_requests FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow public update tx_req" ON public.transaction_requests FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow public delete tx_req" ON public.transaction_requests FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

-- 3. Table: public.wallet_audit_logs (Security Audit Trail - No Sensitive Credentials Stored)
CREATE TABLE IF NOT EXISTS public.wallet_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID,
    wallet_address TEXT,
    user_id TEXT DEFAULT 'default_user',
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT DEFAULT '127.0.0.1',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit logs lookup
CREATE INDEX IF NOT EXISTS idx_audit_wallet_address ON public.wallet_audit_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.wallet_audit_logs(action);

-- Enable RLS on public.wallet_audit_logs
ALTER TABLE public.wallet_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read audit" ON public.wallet_audit_logs;
DROP POLICY IF EXISTS "Allow public insert audit" ON public.wallet_audit_logs;
DROP POLICY IF EXISTS "Allow public update audit" ON public.wallet_audit_logs;
DROP POLICY IF EXISTS "Allow public delete audit" ON public.wallet_audit_logs;

CREATE POLICY "Allow public read audit" ON public.wallet_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert audit" ON public.wallet_audit_logs FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow public update audit" ON public.wallet_audit_logs FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));
CREATE POLICY "Allow public delete audit" ON public.wallet_audit_logs FOR DELETE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));
