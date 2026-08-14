# Northveil Supabase Database Schema & DevOps Manual

## 1. Relational Tables

### `mcp_api_keys`
Stores developer API keys, permission scopes, and wallet bindings.
```sql
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
```

### `wallets`
Stores encrypted key vaults with AES-256-GCM ciphertext, IV, and auth tag.
```sql
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

### `travel_reservations`
Stores verifiable travel bookings and PNR passes.
```sql
CREATE TABLE public.travel_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT UNIQUE NOT NULL,
  pnr TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL,
  price_crypto TEXT NOT NULL,
  currency TEXT NOT NULL,
  status TEXT DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 2. Automated Keep-Alive Heartbeat (`pg_cron`)
To prevent inactivity pausing on Supabase free databases, `pg_cron` runs an automated heartbeat job every 3 days:
```sql
SELECT cron.schedule('keep-alive-heartbeat', '0 0 */3 * *', $$INSERT INTO public._system_heartbeats (last_ping_at, note) VALUES (now(), 'Scheduled Heartbeat');$$);
```
