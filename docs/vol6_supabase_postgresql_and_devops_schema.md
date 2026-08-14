# Northveil Technical Encyclopedia — Volume VI: Supabase Database & DevOps Automation

## 1. PostgreSQL Schema DDL
```sql
-- API Keys and Authorization Scopes
CREATE TABLE public.mcp_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT UNIQUE NOT NULL,
  key_name TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  allowed_wallets TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{"*"}',
  tier TEXT NOT NULL DEFAULT 'developer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Encrypted Key Vaults
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT UNIQUE NOT NULL,
  encrypted_credential TEXT,
  iv TEXT,
  auth_tag TEXT,
  credential_type TEXT DEFAULT 'private_key',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 2. Automated Keep-Alive Scheduled Heartbeat (`pg_cron`)
```sql
SELECT cron.schedule(
  'keep-alive-heartbeat',
  '0 0 */3 * *',
  $$INSERT INTO public._system_heartbeats (last_ping_at, note) VALUES (now(), 'Supabase Scheduled Heartbeat');$$
);
```
