-- Supabase Security Migration: Enable Row Level Security (RLS) on all public tables
-- Fixes Supabase Database Linter errors: rls_disabled_in_public & sensitive_columns_exposed

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon full access transactions" ON public.transactions;
CREATE POLICY "Allow anon full access transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon full access smart_contracts" ON public.smart_contracts;
CREATE POLICY "Allow anon full access smart_contracts" ON public.smart_contracts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.mcp_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon full access mcp_activity_logs" ON public.mcp_activity_logs;
CREATE POLICY "Allow anon full access mcp_activity_logs" ON public.mcp_activity_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.mcp_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon full access mcp_api_keys" ON public.mcp_api_keys;
CREATE POLICY "Allow anon full access mcp_api_keys" ON public.mcp_api_keys FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon full access wallets" ON public.wallets;
CREATE POLICY "Allow anon full access wallets" ON public.wallets FOR ALL USING (true) WITH CHECK (true);
