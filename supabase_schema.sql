-- ==============================================================================
-- MG PERFUME - SUPABASE DATABASE SCHEMA & POLICIES
-- Cloud Persistence for Products, Banners, FAQs, Shipping & Settings
-- ==============================================================================

-- 1. Table: Products (Catalogue de Parfums)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'oriental',
  gender TEXT NOT NULL DEFAULT 'unisex',
  volume TEXT NOT NULL DEFAULT '100ml',
  concentration TEXT NOT NULL DEFAULT 'Eau de Parfum',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  stock INTEGER NOT NULL DEFAULT 10,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_on_sale BOOLEAN NOT NULL DEFAULT false,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  olfactory_pyramid JSONB NOT NULL DEFAULT '{"top": [], "heart": [], "base": []}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: Editorial Banners (Bannières Shooting & Accueil - Max 6)
CREATE TABLE IF NOT EXISTS public.editorial_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  tag TEXT NOT NULL,
  image TEXT NOT NULL,
  object_position TEXT NOT NULL DEFAULT 'center',
  accent_text TEXT NOT NULL,
  button_text TEXT NOT NULL DEFAULT 'Commander sur WhatsApp',
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: Shipping Zones (Frais & Délais de Livraison)
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  delay TEXT NOT NULL,
  price NUMERIC NOT NULL,
  free_above NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: FAQs (Foire Aux Questions)
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: Site Settings (Coordonnées, Horaires, Réseaux)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  hours TEXT NOT NULL,
  instagram TEXT,
  tiktok TEXT,
  free_shipping_threshold NUMERIC DEFAULT 60000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public READ (for the static Next.js website & client browsing)
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read on banners" ON public.editorial_banners FOR SELECT USING (true);
CREATE POLICY "Allow public read on shipping" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Allow public read on faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Allow public read on settings" ON public.site_settings FOR SELECT USING (true);

-- Authenticated / Admin WRITE (Insert, Update, Delete)
CREATE POLICY "Allow full access to anon/service" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow full access to anon/service banners" ON public.editorial_banners FOR ALL USING (true);
CREATE POLICY "Allow full access to anon/service shipping" ON public.shipping_zones FOR ALL USING (true);
CREATE POLICY "Allow full access to anon/service faqs" ON public.faqs FOR ALL USING (true);
CREATE POLICY "Allow full access to anon/service settings" ON public.site_settings FOR ALL USING (true);
