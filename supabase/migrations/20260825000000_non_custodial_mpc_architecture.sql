-- Supabase Database Migration: Non-Custodial MPC/TEE Control-Plane Architecture
-- Schema version: 20260825000000_non_custodial_mpc_architecture.sql
-- Replaces legacy server-side custodial encryption with hardware TEE MPC enclave references,
-- passkey authentication credentials, autonomous spending limit scopes, and emergency kill switches.

-- =============================================================================
-- 1. Modify public.wallets: Drop all raw and encrypted private key columns
-- =============================================================================
ALTER TABLE public.wallets 
    DROP COLUMN IF EXISTS encrypted_credential,
    DROP COLUMN IF EXISTS credential_type,
    DROP COLUMN IF EXISTS derivation_path,
    DROP COLUMN IF EXISTS iv,
    DROP COLUMN IF EXISTS auth_tag,
    DROP COLUMN IF EXISTS salt,
    DROP COLUMN IF EXISTS private_key,
    DROP COLUMN IF EXISTS seed_phrase;

-- Add MPC provider and enclave references
ALTER TABLE public.wallets
    ADD COLUMN IF NOT EXISTS mpc_provider TEXT NOT NULL DEFAULT 'turnkey',
    ADD COLUMN IF NOT EXISTS mpc_wallet_id TEXT,
    ADD COLUMN IF NOT EXISTS mpc_sub_org_id TEXT,
    ADD COLUMN IF NOT EXISTS key_type TEXT NOT NULL DEFAULT 'ecdsa_secp256k1';

CREATE INDEX IF NOT EXISTS idx_wallets_mpc_wallet_id ON public.wallets(mpc_wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallets_mpc_sub_org_id ON public.wallets(mpc_sub_org_id);

-- =============================================================================
-- 2. Table: public.passkey_credentials (WebAuthn / FIDO2 Client Credentials)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.passkey_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    device_name TEXT DEFAULT 'Northveil Passkey Device',
    transports JSONB DEFAULT '["internal", "hybrid"]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_passkey_user_id ON public.passkey_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_passkey_credential_id ON public.passkey_credentials(credential_id);

ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public passkey operations" ON public.passkey_credentials;
DROP POLICY IF EXISTS "Users manage their own passkeys" ON public.passkey_credentials;
CREATE POLICY "Users manage their own passkeys" ON public.passkey_credentials
    FOR ALL USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- =============================================================================
-- 3. Table: public.autonomous_spending_scopes (Declarative Agent Policy Limits)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.autonomous_spending_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_id TEXT NOT NULL UNIQUE DEFAULT ('scp_' || md5(random()::text || clock_timestamp()::text)),
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    asset TEXT NOT NULL DEFAULT 'ETH',
    allowed_chains JSONB NOT NULL DEFAULT '[11155111, 8453, 42161, 1]'::jsonb,
    max_amount_per_tx_usd NUMERIC NOT NULL DEFAULT 25.0,
    max_daily_budget_usd NUMERIC NOT NULL DEFAULT 100.0,
    spent_last_24h_usd NUMERIC NOT NULL DEFAULT 0.0,
    allowed_contracts JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scopes_wallet ON public.autonomous_spending_scopes(wallet_address);
CREATE INDEX IF NOT EXISTS idx_scopes_user ON public.autonomous_spending_scopes(user_id);

ALTER TABLE public.autonomous_spending_scopes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public scope operations" ON public.autonomous_spending_scopes;
DROP POLICY IF EXISTS "Users manage their own scopes" ON public.autonomous_spending_scopes;
CREATE POLICY "Users manage their own scopes" ON public.autonomous_spending_scopes
    FOR ALL USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- =============================================================================
-- 4. Table: public.kill_switch_records (Emergency Vault Lockouts & Revocations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.kill_switch_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    user_id TEXT NOT NULL,
    is_killed BOOLEAN NOT NULL DEFAULT TRUE,
    reason TEXT,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kill_switch_address ON public.kill_switch_records(wallet_address);
CREATE INDEX IF NOT EXISTS idx_kill_switch_user ON public.kill_switch_records(user_id);

ALTER TABLE public.kill_switch_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public kill switch operations" ON public.kill_switch_records;
DROP POLICY IF EXISTS "Users manage their own kill switches" ON public.kill_switch_records;
CREATE POLICY "Users manage their own kill switches" ON public.kill_switch_records
    FOR ALL USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- =============================================================================
-- 5. Update public.transaction_requests: Add receipt confirmations & passkey challenge
-- =============================================================================
ALTER TABLE public.transaction_requests
    ADD COLUMN IF NOT EXISTS passkey_challenge TEXT,
    ADD COLUMN IF NOT EXISTS block_number BIGINT,
    ADD COLUMN IF NOT EXISTS gas_used TEXT,
    ADD COLUMN IF NOT EXISTS execution_mode TEXT DEFAULT 'passkey_prompt' CHECK (execution_mode IN ('passkey_prompt', 'autonomous_scope')),
    ADD COLUMN IF NOT EXISTS mpc_signature TEXT;

CREATE INDEX IF NOT EXISTS idx_tx_req_status ON public.transaction_requests(status);
