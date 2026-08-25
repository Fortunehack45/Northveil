-- Supabase Database Migration: Harden RLS Policies & WebAuthn Credentials
-- Schema version: 20260825000001_harden_rls_and_webauthn.sql
-- Eliminates permissive USING (true) policies and enforces strict auth.uid() isolation.

-- 1. Passkey Credentials Table RLS
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public passkey operations" ON public.passkey_credentials;
DROP POLICY IF EXISTS "Users manage their own passkeys" ON public.passkey_credentials;

CREATE POLICY "Users manage their own passkeys" ON public.passkey_credentials
    FOR ALL
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 2. Autonomous Spending Scopes Table RLS
ALTER TABLE public.autonomous_spending_scopes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public scope operations" ON public.autonomous_spending_scopes;
DROP POLICY IF EXISTS "Users manage their own scopes" ON public.autonomous_spending_scopes;

CREATE POLICY "Users manage their own scopes" ON public.autonomous_spending_scopes
    FOR ALL
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 3. Kill Switch Records Table RLS
ALTER TABLE public.kill_switch_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public kill switch operations" ON public.kill_switch_records;
DROP POLICY IF EXISTS "Users manage their own kill switches" ON public.kill_switch_records;

CREATE POLICY "Users manage their own kill switches" ON public.kill_switch_records
    FOR ALL
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- 4. Transaction Requests Table RLS
ALTER TABLE public.transaction_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public request operations" ON public.transaction_requests;
DROP POLICY IF EXISTS "Users manage their own transaction requests" ON public.transaction_requests;

CREATE POLICY "Users manage their own transaction requests" ON public.transaction_requests
    FOR ALL
    USING (auth.uid()::text = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');
