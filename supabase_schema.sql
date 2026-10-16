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
-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
--
-- ⚠ Chaque policy porte une clause `TO`, volontairement. Une policy sans `TO`
--   s'applique à PUBLIC, donc à `anon` — et la clé `anon` est PUBLIQUE : elle
--   est livrée dans le bundle JavaScript du site statique. Les anciennes
--   policies "Full access ... FOR ALL USING (true)" donnaient donc à n'importe
--   quel visiteur le droit d'écrire et de supprimer tout le catalogue.
--
--   Lecture publique = contenu vitrine (produits, bannières, livraison, FAQ,
--   réglages). Écriture = administrateur authentifié (liste `site_admins`).
--   `orders` (nom, téléphone, adresse) et `site_backups` ne sont JAMAIS
--   lisibles publiquement.
-- ==============================================================================

-- Liste blanche des administrateurs.
CREATE TABLE IF NOT EXISTS public.site_admins (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_admins ENABLE ROW LEVEL SECURITY;
-- RLS activée sans aucune policy = accès refusé à anon et authenticated via
-- PostgREST. Seul service_role (qui contourne RLS) et les fonctions SECURITY
-- DEFINER ci-dessous peuvent lire cette table.
REVOKE ALL ON public.site_admins FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.site_admins TO service_role;

-- Vrai si l'appelant est un administrateur du site.
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.site_admins a WHERE a.user_id = auth.uid()
  );
$fn$;

-- Une fonction est exécutable par PUBLIC par défaut : c'est précisément l'oubli
-- qui rendait l'ancien `exec_sql` exploitable par n'importe qui.
REVOKE ALL ON FUNCTION public.is_site_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_site_admin() TO authenticated, service_role;

-- Rattache le compte administrateur par son e-mail (ne fait rien si absent).
INSERT INTO public.site_admins (user_id, email)
SELECT u.id, u.email FROM auth.users u WHERE u.email = 'admin@mgperfume.store'
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_backups      ENABLE ROW LEVEL SECURITY;

-- ── products ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Full access products" ON public.products;
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
DROP POLICY IF EXISTS "Admin update products" ON public.products;
DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Public read products" ON public.products
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin delete products" ON public.products
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── editorial_banners ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read banners" ON public.editorial_banners;
DROP POLICY IF EXISTS "Full access banners" ON public.editorial_banners;
DROP POLICY IF EXISTS "Admin insert banners" ON public.editorial_banners;
DROP POLICY IF EXISTS "Admin update banners" ON public.editorial_banners;
DROP POLICY IF EXISTS "Admin delete banners" ON public.editorial_banners;
CREATE POLICY "Public read banners" ON public.editorial_banners
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin insert banners" ON public.editorial_banners
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin update banners" ON public.editorial_banners
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin delete banners" ON public.editorial_banners
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── shipping_zones ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read shipping" ON public.shipping_zones;
DROP POLICY IF EXISTS "Full access shipping" ON public.shipping_zones;
DROP POLICY IF EXISTS "Admin insert shipping" ON public.shipping_zones;
DROP POLICY IF EXISTS "Admin update shipping" ON public.shipping_zones;
DROP POLICY IF EXISTS "Admin delete shipping" ON public.shipping_zones;
CREATE POLICY "Public read shipping" ON public.shipping_zones
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin insert shipping" ON public.shipping_zones
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin update shipping" ON public.shipping_zones
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin delete shipping" ON public.shipping_zones
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── faqs ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Full access faqs" ON public.faqs;
DROP POLICY IF EXISTS "Admin insert faqs" ON public.faqs;
DROP POLICY IF EXISTS "Admin update faqs" ON public.faqs;
DROP POLICY IF EXISTS "Admin delete faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin insert faqs" ON public.faqs
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin update faqs" ON public.faqs
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin delete faqs" ON public.faqs
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── site_backups — PRIVÉ (un snapshot contient tout le catalogue) ─────────
DROP POLICY IF EXISTS "Public read backups" ON public.site_backups;
DROP POLICY IF EXISTS "Full access backups" ON public.site_backups;
DROP POLICY IF EXISTS "Admin read backups" ON public.site_backups;
DROP POLICY IF EXISTS "Admin insert backups" ON public.site_backups;
DROP POLICY IF EXISTS "Admin update backups" ON public.site_backups;
DROP POLICY IF EXISTS "Admin delete backups" ON public.site_backups;
CREATE POLICY "Admin read backups" ON public.site_backups
  FOR SELECT TO authenticated USING (public.is_site_admin());
CREATE POLICY "Admin insert backups" ON public.site_backups
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin update backups" ON public.site_backups
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
CREATE POLICY "Admin delete backups" ON public.site_backups
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── orders et site_settings ───────────────────────────────────────────────
-- Durcies seulement si les tables existent : ce fichier reste ainsi rejouable
-- sur une base neuve comme sur la base de production.
DO $guard$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public insert orders" ON public.orders';
    EXECUTE 'DROP POLICY IF EXISTS "Public select own order" ON public.orders';
    EXECUTE 'DROP POLICY IF EXISTS "Full access orders" ON public.orders';
    EXECUTE 'DROP POLICY IF EXISTS "Admin read orders" ON public.orders';
    EXECUTE 'DROP POLICY IF EXISTS "Admin update orders" ON public.orders';
    EXECUTE 'DROP POLICY IF EXISTS "Admin delete orders" ON public.orders';
    EXECUTE 'CREATE POLICY "Admin read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_site_admin())';
    EXECUTE 'CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_site_admin()) WITH CHECK (public.is_site_admin())';
    EXECUTE 'CREATE POLICY "Admin delete orders" ON public.orders FOR DELETE TO authenticated USING (public.is_site_admin())';
    -- Aucune policy INSERT : la commande passe par le RPC create_order
    -- (SECURITY DEFINER), qui recalcule prix et livraison côté serveur.
  END IF;

  IF to_regclass('public.site_settings') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings';
    EXECUTE 'DROP POLICY IF EXISTS "Public insert site_settings" ON public.site_settings';
    EXECUTE 'DROP POLICY IF EXISTS "Public update site_settings" ON public.site_settings';
    EXECUTE 'DROP POLICY IF EXISTS "Admin insert site_settings" ON public.site_settings';
    EXECUTE 'DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings';
    EXECUTE 'CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Admin insert site_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_site_admin())';
    EXECUTE 'CREATE POLICY "Admin update site_settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_site_admin()) WITH CHECK (public.is_site_admin())';
  END IF;
END $guard$;

-- Insert default initial backup row
INSERT INTO public.site_backups (id, backup_name) 
VALUES ('latest', 'Backup Initial') 
ON CONFLICT (id) DO NOTHING;
