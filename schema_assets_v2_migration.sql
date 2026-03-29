-- Supabase Schema: Assets (Sprint 2 Migration)

-- Adds tracking columns for true market quotes and caching
ALTER TABLE public.assets ADD COLUMN base_symbol TEXT;
ALTER TABLE public.assets ADD COLUMN provider_symbol TEXT;
ALTER TABLE public.assets ADD COLUMN quote_currency TEXT DEFAULT 'USD';
ALTER TABLE public.assets ADD COLUMN last_price NUMERIC;
ALTER TABLE public.assets ADD COLUMN exchange TEXT;
