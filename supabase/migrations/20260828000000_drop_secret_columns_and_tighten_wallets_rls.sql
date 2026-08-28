-- Supabase Database Migration: Drop Secret Storage Columns & Enforce Strict User RLS
-- Migration: 20260828000000_drop_secret_columns_and_tighten_wallets_rls.sql
-- Makes Northveil genuinely non-custodial: zero secret material in database, strict RLS isolation.

-- 1. Purge and drop any legacy secret storage columns from the wallets table
ALTER TABLE public.wallets DROP COLUMN IF EXISTS encrypted_credential;
ALTER TABLE public.wallets DROP COLUMN IF EXISTS iv;
ALTER TABLE public.wallets DROP COLUMN IF EXISTS auth_tag;
ALTER TABLE public.wallets DROP COLUMN IF EXISTS salt;
ALTER TABLE public.wallets DROP COLUMN IF EXISTS credential_type;
ALTER TABLE public.wallets DROP COLUMN IF EXISTS private_key;
ALTER TABLE public.wallets DROP COLUMN IF EXISTS seed_phrase;

-- 2. Tighten RLS on wallets table (Eliminate public read USING (true))
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public wallet operations" ON public.wallets;
DROP POLICY IF EXISTS "Users manage their own wallets" ON public.wallets;

CREATE POLICY "Users manage their own wallets" ON public.wallets
    FOR ALL
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 3. Tighten RLS on transaction_requests table
ALTER TABLE public.transaction_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read tx_req" ON public.transaction_requests;
DROP POLICY IF EXISTS "Allow public request operations" ON public.transaction_requests;
DROP POLICY IF EXISTS "Users manage their own transaction requests" ON public.transaction_requests;

CREATE POLICY "Users manage their own transaction requests" ON public.transaction_requests
    FOR ALL
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 4. Tighten RLS on wallet_audit_logs table
ALTER TABLE public.wallet_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read audit" ON public.wallet_audit_logs;
DROP POLICY IF EXISTS "Allow public audit operations" ON public.wallet_audit_logs;
DROP POLICY IF EXISTS "Users read their own audit logs" ON public.wallet_audit_logs;
DROP POLICY IF EXISTS "Service role insert audit logs" ON public.wallet_audit_logs;

CREATE POLICY "Users read their own audit logs" ON public.wallet_audit_logs
    FOR SELECT
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role insert audit logs" ON public.wallet_audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = user_id);
