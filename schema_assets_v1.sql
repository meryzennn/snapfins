-- Supabase Schema: Assets (Sprint 1)

-- 1. Create `assets` table
CREATE TABLE public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Cash', 'Bank', 'E-wallet', 'Crypto', 'Stock / ETF', 'Gold', 'Property', 'Vehicle', 'Other'
    subtype TEXT,           
    valuation_mode TEXT NOT NULL, -- 'derived', 'market', 'manual'
    symbol TEXT,            -- For market assets like 'BTC', 'AAPL'
    quantity NUMERIC,       -- Number of shares/coins
    manual_value NUMERIC,   -- Fallback or explicit value
    current_value NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    liquidity_level TEXT,   -- 'Liquid', 'Illiquid'
    risk_level TEXT,        -- 'Low', 'Medium', 'High'
    source_account TEXT,    -- E.g., 'Binance', 'BCA'
    notes TEXT,
    last_valued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create `asset_snapshots` table for historical tracking
CREATE TABLE public.asset_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
    snapshot_date DATE NOT NULL,
    quantity NUMERIC,
    value NUMERIC NOT NULL,
    price NUMERIC,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security Policies (RLS)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_snapshots ENABLE ROW LEVEL SECURITY;

-- Assets Policies
CREATE POLICY "Users can view their own assets" 
    ON public.assets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets" 
    ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" 
    ON public.assets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" 
    ON public.assets FOR DELETE USING (auth.uid() = user_id);

-- Asset Snapshots Policies (Based on asset ownership)
CREATE POLICY "Users can view their own asset snapshots" 
    ON public.asset_snapshots FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.assets a WHERE a.id = asset_snapshots.asset_id AND a.user_id = auth.uid()));

CREATE POLICY "Users can insert their own asset snapshots" 
    ON public.asset_snapshots FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.assets a WHERE a.id = asset_snapshots.asset_id AND a.user_id = auth.uid()));

CREATE POLICY "Users can update their own asset snapshots" 
    ON public.asset_snapshots FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.assets a WHERE a.id = asset_snapshots.asset_id AND a.user_id = auth.uid()));

CREATE POLICY "Users can delete their own asset snapshots" 
    ON public.asset_snapshots FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.assets a WHERE a.id = asset_snapshots.asset_id AND a.user_id = auth.uid()));

-- 4. Automatic updated_at Trigger for Assets
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assets_timestamp
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
