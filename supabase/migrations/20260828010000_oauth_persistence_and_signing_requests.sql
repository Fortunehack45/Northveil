-- Supabase Database Migration: OAuth 2.0 Persistence, Tenant Isolation & Non-Custodial Transaction Pipeline
-- Migration: 20260828010000_oauth_persistence_and_signing_requests.sql
-- Schema additions for persistent OAuth state in serverless environments, replay protection, and signed transaction tracking.

-- =============================================================================
-- 1. Table: public.oauth_clients (OAuth 2.0 Registered Clients & Integrations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL UNIQUE,
    client_secret_hash TEXT NOT NULL,
    client_name TEXT NOT NULL,
    redirect_uris JSONB NOT NULL DEFAULT '[]'::jsonb,
    user_id TEXT NOT NULL DEFAULT 'default_user',
    wallet_address TEXT,
    allowed_scopes JSONB NOT NULL DEFAULT '["tools:read", "tools:execute"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_clients_client_id ON public.oauth_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_clients_user_id ON public.oauth_clients(user_id);

ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage their own OAuth clients" ON public.oauth_clients;
CREATE POLICY "Users manage their own OAuth clients" ON public.oauth_clients
    FOR ALL USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- =============================================================================
-- 2. Table: public.oauth_codes (Short-Lived, Single-Use, PKCE-Bound Authorization Codes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.oauth_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_hash TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    code_challenge TEXT,
    code_challenge_method TEXT,
    requested_scope TEXT NOT NULL DEFAULT 'tools:read tools:execute',
    used BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_codes_hash ON public.oauth_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_expires ON public.oauth_codes(expires_at);

ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages oauth codes" ON public.oauth_codes;
CREATE POLICY "Service role manages oauth codes" ON public.oauth_codes
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- 3. Table: public.oauth_tokens (Active OAuth Access & Refresh Tokens)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    refresh_token_hash TEXT UNIQUE,
    client_id TEXT NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '["tools:read", "tools:execute"]'::jsonb,
    scope TEXT NOT NULL DEFAULT 'tools:read tools:execute',
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_hash ON public.oauth_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_refresh ON public.oauth_tokens(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_wallet ON public.oauth_tokens(wallet_address);

ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their own tokens" ON public.oauth_tokens;
CREATE POLICY "Users view their own tokens" ON public.oauth_tokens
    FOR SELECT USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages tokens" ON public.oauth_tokens;
CREATE POLICY "Service role manages tokens" ON public.oauth_tokens
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- 4. Enhance public.transaction_requests: Add signed transaction payload & validation state
-- =============================================================================
ALTER TABLE public.transaction_requests
    ADD COLUMN IF NOT EXISTS raw_signed_tx TEXT,
    ADD COLUMN IF NOT EXISTS recovered_sender TEXT,
    ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'signature_mismatch', 'chain_mismatch', 'invalid_payload', 'expired')),
    ADD COLUMN IF NOT EXISTS target_chain TEXT DEFAULT 'base',
    ADD COLUMN IF NOT EXISTS operation_type TEXT DEFAULT 'TRANSFER';

CREATE INDEX IF NOT EXISTS idx_tx_req_recovered_sender ON public.transaction_requests(recovered_sender);
CREATE INDEX IF NOT EXISTS idx_tx_req_created ON public.transaction_requests(created_at);
