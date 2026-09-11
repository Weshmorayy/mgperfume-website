-- ==============================================================================
-- MG PERFUME DAKAR — SUPABASE MASTER DATABASE SCHEMA
-- Version: 2.0 (E-Commerce, PayTech Orders, Realtime Sync, RLS Security)
-- ==============================================================================

-- 1. TABLE: PRODUCTS (Catalogue des Parfums)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'MG Perfume',
  tagline TEXT DEFAULT '',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  volume TEXT DEFAULT '100 ml',
  image TEXT NOT NULL,
  family TEXT DEFAULT 'oriental',
  category_label TEXT DEFAULT 'Eau de Parfum',
  badge TEXT,
  top_notes TEXT[] DEFAULT '{}',
  heart_notes TEXT[] DEFAULT '{}',
  base_notes TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  is_popular BOOLEAN DEFAULT false,
  is_hero BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist even if table already existed previously
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'MG Perfume';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS volume TEXT DEFAULT '100 ml';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS family TEXT DEFAULT 'oriental';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_label TEXT DEFAULT 'Eau de Parfum';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS top_notes TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS heart_notes TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS base_notes TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_hero BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. TABLE: ORDERS (Commandes PayTech & WhatsApp)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  ref_command TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  shipping_zone_id TEXT,
  shipping_zone_name TEXT,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  payment_method TEXT NOT NULL DEFAULT 'whatsapp', -- 'paytech' | 'whatsapp' | 'cod'
  payment_status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid' | 'failed' | 'refunded'
  order_status TEXT NOT NULL DEFAULT 'new',         -- 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paytech_token TEXT,
  paytech_redirect_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on orders for fast searching in Admin
CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders(ref_command);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 3. TABLE: EDITORIAL BANNERS (Bannières Shooting & Accueil)
CREATE TABLE IF NOT EXISTS public.editorial_banners (
  id TEXT PRIMARY KEY,
  tag TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  alt TEXT DEFAULT 'Bannière MG Perfume',
  link_text TEXT DEFAULT 'Découvrir',
  href TEXT DEFAULT '/boutique',
  bg_color TEXT DEFAULT '#171513',
  object_position TEXT DEFAULT 'center',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: SHIPPING ZONES (Zones et Frais de Livraison Dakar)
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  delay TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: FAQS (Foire Aux Questions)
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  q TEXT NOT NULL,
  a TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE: SITE BACKUPS (Snapshots de Restauration)
CREATE TABLE IF NOT EXISTS public.site_backups (
  id TEXT PRIMARY KEY,
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

-- 7. FUNCTION: exec_sql (Allows Remote CLI DDL/SQL Execution)
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_backups ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public read, full write for admin/store operations
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access products" ON public.products;
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true);

-- Orders Policies: 
-- Public can INSERT orders (checkout from website without requiring customer account)
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
-- Public can SELECT their own order by ref_command
DROP POLICY IF EXISTS "Public select own order" ON public.orders;
CREATE POLICY "Public select own order" ON public.orders FOR SELECT USING (true);
-- Full access for admin updates & management
DROP POLICY IF EXISTS "Full access orders" ON public.orders;
CREATE POLICY "Full access orders" ON public.orders FOR ALL USING (true);

-- Banners Policies
DROP POLICY IF EXISTS "Public read banners" ON public.editorial_banners;
CREATE POLICY "Public read banners" ON public.editorial_banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access banners" ON public.editorial_banners;
CREATE POLICY "Full access banners" ON public.editorial_banners FOR ALL USING (true);

-- Shipping Zones Policies
DROP POLICY IF EXISTS "Public read shipping" ON public.shipping_zones;
CREATE POLICY "Public read shipping" ON public.shipping_zones FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access shipping" ON public.shipping_zones;
CREATE POLICY "Full access shipping" ON public.shipping_zones FOR ALL USING (true);

-- FAQ Policies
DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access faqs" ON public.faqs FOR ALL USING (true);

-- Backups Policies
DROP POLICY IF EXISTS "Public read backups" ON public.site_backups;
CREATE POLICY "Public read backups" ON public.site_backups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access backups" ON public.site_backups;
CREATE POLICY "Full access backups" ON public.site_backups FOR ALL USING (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Shipping Zones (Dakar & Régions)
INSERT INTO public.shipping_zones (id, name, price, delay)
VALUES
  ('dakar-centre', 'Dakar Centre / Plateau / Fann / Mermoz', 2000, 'Sous 2h à 4h'),
  ('dakar-banlieue', 'Banlieue Dakar (Pikine, Guédiawaye, Rufisque)', 3000, 'Sous 4h à 6h'),
  ('interieur-senegal', 'Régions (Thiès, Mbour, Saint-Louis, Touba...)', 4000, 'Sous 24h à 48h')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  delay = EXCLUDED.delay;

-- Seed Editorial Banners
INSERT INTO public.editorial_banners (id, tag, title, image, alt, link_text, href, bg_color, object_position, display_order)
VALUES
  ('naimez-que-moi', 'Senteurs d’Orient', 'ÉLIXIRS & GOUTTES INTIMES', '/images/shooting/naimez-que-moi-model.jpg', 'Mannequin tenant l élixir N Aimez Que Moi MG Perfume', 'Découvrir la Collection Intime', '/boutique?family=oriental', '#171513', 'center top', 1),
  ('khamrah-qahwa', 'Signature Gourmande', 'L’OR DU DÉSERT & NOTES CAFÉ', '/images/shooting/khamrah-qahwa-mood.jpg', 'Flacon d exception Khamrah Qahwa dans un décor oriental luxueux', 'Explorer les Parfums Gourmands', '/boutique?family=gourmand', '#1C1611', 'center center', 2)
ON CONFLICT (id) DO UPDATE SET
  tag = EXCLUDED.tag,
  title = EXCLUDED.title,
  image = EXCLUDED.image,
  alt = EXCLUDED.alt,
  link_text = EXCLUDED.link_text,
  href = EXCLUDED.href,
  bg_color = EXCLUDED.bg_color,
  object_position = EXCLUDED.object_position,
  display_order = EXCLUDED.display_order;

-- Seed Initial Products
INSERT INTO public.products (
  id, name, brand, tagline, price, original_price, volume, image, family,
  category_label, badge, top_notes, heart_notes, base_notes, description,
  is_popular, is_hero, in_stock
)
VALUES
  (
    'khamrah-waha',
    'Khamrah Waha',
    'Lattafa',
    'Élixir épicé rafraîchi de brise marine et fève tonka',
    35000,
    40000,
    '100 ml',
    '/images/products/khamrah-waha.jpg',
    'oriental',
    'Oriental Épicé Frais',
    'Bestseller',
    ARRAY['Concombre', 'Bergamote', 'Yuzu', 'Genévrier'],
    ARRAY['Gingembre', 'Iris', 'Sauge', 'Sel de mer'],
    ARRAY['Akigalawood', 'Fève Tonka', 'Vanille', 'Musc', 'Ambrofix™'],
    'Une réinterprétation lumineuse alliant la fraîcheur du yuzu et du sel marin à la richesse de la fève tonka et du musc.',
    true,
    true,
    true
  ),
  (
    'khamrah-qahwa',
    'Khamrah Qahwa',
    'Lattafa',
    'L’accord ultime de café torréfié, cannelle et praline',
    38000,
    42000,
    '100 ml',
    '/images/products/khamrah-qahwa.jpg',
    'gourmand',
    'Gourmand Café Épicé',
    'Coup de Cœur',
    ARRAY['Gingembre', 'Cannelle', 'Cardamome'],
    ARRAY['Praline', 'Fruits confits', 'Fleurs blanches'],
    ARRAY['Café Arabica', 'Fève Tonka', 'Benjoin', 'Vanille', 'Musc'],
    'Un sillage irrésistible de café torréfié enveloppé de praline gourmande et d’épices orientales chaudes.',
    true,
    false,
    true
  ),
  (
    'supremacy-in-heaven',
    'Supremacy in Heaven',
    'Afnan',
    'Fraîcheur vivifiante hespéridée sur lit de thé vert et bois précieux',
    32000,
    NULL,
    '100 ml',
    '/images/products/supremacy-in-heaven.jpg',
    'aquatique',
    'Boisé Frais Hespéridé',
    'Tendance',
    ARRAY['Bergamote', 'Mandarine'],
    ARRAY['Thé Vert', 'Cassis'],
    ARRAY['Bois de Santal', 'Musc', 'Bois précieux'],
    'Une fraîcheur cristalline inspirée des sommets enneigés, mêlant agrumes étincelants et thé vert apaisant.',
    true,
    false,
    true
  ),
  (
    'asad-bourbon',
    'Asad Bourbon',
    'Lattafa',
    'Puissance virile du tabac ambré relevé d’une vanille bourbon envoûtante',
    30000,
    NULL,
    '100 ml',
    '/images/products/asad-bourbon.jpg',
    'boise',
    'Boisé Ambré Cuiré',
    NULL,
    ARRAY['Poivre noir', 'Ananas', 'Tabac blond'],
    ARRAY['Café', 'Patchouli', 'Iris'],
    ARRAY['Ambre', 'Vanille Bourbon', 'Bois sec', 'Benjoin'],
    'Une présence charismatique et magnétique. Un accord boisé riche sublimé par la noblesse de la vanille Bourbon.',
    true,
    false,
    true
  ),
  (
    'musk-vanille-intense',
    'Musk Vanille Intense',
    'MG Perfume',
    'Voile de musc blanc pur et gousse de vanille de Madagascar',
    25000,
    28000,
    '100 ml',
    '/images/products/khamrah-waha.jpg',
    'oriental',
    'Oriental Doux Poudré',
    NULL,
    ARRAY['Fleur de coton', 'Bergamote'],
    ARRAY['Musc blanc', 'Jasmin doux'],
    ARRAY['Gousse de Vanille', 'Ambre blanc'],
    'Une caresse olfactive pure et addictive. Le mariage sensuel du musc blanc et d’une vanille chaleureuse.',
    false,
    false,
    true
  ),
  (
    'oud-royal-dakar',
    'Oud Royal Dakar',
    'MG Perfume',
    'La noblesse du bois de oud rehaussée de rose de Damas et d’ambre noir',
    45000,
    50000,
    '100 ml',
    '/images/products/khamrah-qahwa.jpg',
    'oriental',
    'Oriental Précieux Intense',
    'Édition Limitée',
    ARRAY['Rose de Damas', 'Safran d’Orient'],
    ARRAY['Bois de Oud', 'Patchouli'],
    ARRAY['Ambre noir', 'Cuir souple', 'Santal'],
    'Une création majestueuse taillée pour les grandes occasions. Le sillage inoubliable des nuits dakarroises.',
    false,
    false,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  tagline = EXCLUDED.tagline,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  volume = EXCLUDED.volume,
  image = EXCLUDED.image,
  family = EXCLUDED.family,
  category_label = EXCLUDED.category_label,
  badge = EXCLUDED.badge,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes,
  description = EXCLUDED.description,
  is_popular = EXCLUDED.is_popular,
  is_hero = EXCLUDED.is_hero,
  in_stock = EXCLUDED.in_stock;

-- Seed Sample Order
INSERT INTO public.orders (
  id, ref_command, customer_name, customer_phone, customer_address,
  shipping_zone_id, shipping_zone_name, shipping_cost, subtotal, total_amount,
  items, payment_method, payment_status, order_status, notes
)
VALUES
  (
    'order-demo-01',
    'MGP-2026-DEMO',
    'Fatou Ndiaye',
    '+221 77 123 45 67',
    'Almadies, en face Pharmacie du Golf, Dakar',
    'dakar-centre',
    'Dakar Centre / Plateau / Fann / Mermoz',
    2000,
    35000,
    37000,
    '[{"productId":"khamrah-waha","name":"Khamrah Waha","brand":"Lattafa","price":35000,"quantity":1,"image":"/images/products/khamrah-waha.jpg"}]'::jsonb,
    'paytech',
    'paid',
    'processing',
    'Client VIP - Emballage cadeau demandé'
  )
ON CONFLICT (id) DO NOTHING;
