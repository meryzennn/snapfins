-- SnapFins: Link Transactions to Cash Assets
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Non-destructive: nullable column, safe for all existing rows.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS linked_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL;

-- Index for efficient reverse-balance lookups
CREATE INDEX IF NOT EXISTS idx_transactions_linked_asset_id
  ON public.transactions(linked_asset_id)
  WHERE linked_asset_id IS NOT NULL;

-- ── Verification ─────────────────────────────────────────────────────────────
-- Run this query after the migration to confirm the column exists:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'transactions'
--   AND column_name = 'linked_asset_id';
--
-- Expected result: one row with column_name = 'linked_asset_id', data_type = 'uuid', is_nullable = 'YES'
