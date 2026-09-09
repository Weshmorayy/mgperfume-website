-- ==============================================================================
-- MG PERFUME - SUPABASE DATABASE SCHEMA & POLICIES
-- Tables & RLS Policies for Products, Banners, Shipping, FAQs, Settings & JSON Backups
-- ==============================================================================

-- 1. Table: Products (Catalogue de Parfums)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'MG Perfume',
  tagline TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  volume TEXT NOT NULL DEFAULT '100 ml',
  image TEXT NOT NULL,
  family TEXT NOT NULL DEFAULT 'oriental',
  category_label TEXT DEFAULT 'Eau de Parfum',
  badge TEXT,
  top_notes TEXT[] DEFAULT '{}',
  heart_notes TEXT[] DEFAULT '{}',
  base_notes TEXT[] DEFAULT '{}',
  description TEXT,
  is_popular BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: Editorial Banners (Bannières Shooting & Accueil - Max 6)
CREATE TABLE IF NOT EXISTS public.editorial_banners (
  id TEXT PRIMARY KEY,
  tag TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT 'Bannière MG Perfume',
  link_text TEXT NOT NULL DEFAULT 'Découvrir',
  href TEXT NOT NULL DEFAULT '/boutique',
  bg_color TEXT NOT NULL DEFAULT '#171513',
  object_position TEXT NOT NULL DEFAULT 'center',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: Shipping Zones (Frais & Délais de Livraison)
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  delay TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: FAQs (Foire Aux Questions)
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  q TEXT NOT NULL,
  a TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: Site Settings & Backups (Export/Import & JSON snapshot)
CREATE TABLE IF NOT EXISTS public.site_backups (
  id TEXT PRIMARY KEY DEFAULT 'latest',
  backup_name TEXT NOT NULL DEFAULT 'Configuration Globale',
  products_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  banners_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  social_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_backups ENABLE ROW LEVEL SECURITY;

-- Allow Public Read & Full Write Access with anon key & service key
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true);

CREATE POLICY "Public read banners" ON public.editorial_banners FOR SELECT USING (true);
CREATE POLICY "Full access banners" ON public.editorial_banners FOR ALL USING (true);

CREATE POLICY "Public read shipping" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Full access shipping" ON public.shipping_zones FOR ALL USING (true);

CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Full access faqs" ON public.faqs FOR ALL USING (true);

CREATE POLICY "Public read backups" ON public.site_backups FOR SELECT USING (true);
CREATE POLICY "Full access backups" ON public.site_backups FOR ALL USING (true);

-- Insert default initial backup row
INSERT INTO public.site_backups (id, backup_name) 
VALUES ('latest', 'Backup Initial') 
ON CONFLICT (id) DO NOTHING;
