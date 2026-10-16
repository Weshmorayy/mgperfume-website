-- ═══════════════════════════════════════════════════════════════════════════
-- MG Perfume — Durcissement des policies RLS
-- Date : 2026-10-16
--
-- ── POURQUOI CE FICHIER EXISTE ────────────────────────────────────────────
-- Les policies d'origine étaient toutes bâties sur `FOR ALL USING (true)`,
-- sans clause `TO`. En PostgreSQL, une policy sans `TO` s'applique au rôle
-- PUBLIC — donc aussi à `anon`, dont la clé est PUBLIQUE : elle est livrée
-- dans le bundle JavaScript du site statique et lisible par n'importe qui.
--
-- Conséquence mesurée en direct le 2026-10-16 (clé anon seule) :
--   * products / editorial_banners / shipping_zones / faqs / site_backups :
--     INSERT, UPDATE et DELETE acceptés → catalogue et sauvegardes
--     réinscriptibles et effaçables par un visiteur anonyme ;
--   * orders : SELECT renvoyait les noms et téléphones des clients ;
--   * public.exec_sql(query text), SECURITY DEFINER et exécutable par
--     `anon`, permettait d'exécuter du SQL ARBITRAIRE en tant que postgres
--     (constaté : `{"success": true}`) — soit la prise de contrôle totale
--     de la base.
--
-- ── CE QUE CE FICHIER FAIT ────────────────────────────────────────────────
--   1. Liste blanche d'administrateurs (`site_admins`) + helper
--      `is_site_admin()` : seule source de vérité pour « qui a le droit
--      d'écrire ». Indépendant de l'activation des inscriptions Supabase —
--      un compte créé par un tiers n'est PAS administrateur.
--   2. Suppression définitive du runner SQL public `exec_sql`, remplacé par
--      `mg_migrate` strictement réservé à `service_role`.
--   3. Réécriture des policies : lecture publique du contenu vitrine
--      (nécessaire au site statique), écriture réservée à l'administrateur
--      authentifié, `orders` et `site_backups` rendus privés.
--
-- ── APPLICATION ───────────────────────────────────────────────────────────
-- Supabase → SQL Editor → coller ce fichier → Run.
-- Idempotent : rejouable sans erreur.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- 1. Liste blanche des administrateurs
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_admins (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_admins ENABLE ROW LEVEL SECURITY;
-- Aucune policy n'est créée : RLS activée sans policy = accès refusé à tout
-- le monde via PostgREST. Seul `service_role` (qui contourne RLS) et les
-- fonctions SECURITY DEFINER ci-dessous peuvent lire cette table.
REVOKE ALL ON public.site_admins FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.site_admins TO service_role;

-- Vrai si l'appelant est un administrateur du site.
-- SECURITY DEFINER : lit `site_admins` en contournant sa RLS.
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_admins a WHERE a.user_id = auth.uid()
  );
$$;

-- ATTENTION : une fonction est exécutable par PUBLIC par défaut en
-- PostgreSQL. C'est exactement l'oubli qui avait rendu `exec_sql` public.
REVOKE ALL ON FUNCTION public.is_site_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_site_admin() TO authenticated, service_role;

-- Le compte administrateur unique du site (Supabase Auth).
INSERT INTO public.site_admins (user_id, email)
SELECT u.id, u.email FROM auth.users u WHERE u.email = 'admin@mgperfume.store'
ON CONFLICT (user_id) DO NOTHING;


-- ───────────────────────────────────────────────────────────────────────────
-- 2. Suppression du runner SQL exécutable par anon
-- ───────────────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- Runner d'exploitation : DDL impossible via PostgREST, on garde un point
-- d'entrée unique, STRICTEMENT réservé à service_role (jamais anon, jamais
-- authenticated, jamais PUBLIC).
CREATE OR REPLACE FUNCTION public.mg_migrate(q TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  EXECUTE q;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'sqlstate', SQLSTATE);
END;
$$;

REVOKE ALL ON FUNCTION public.mg_migrate(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mg_migrate(text) TO service_role;


-- ───────────────────────────────────────────────────────────────────────────
-- 3. Policies
--    Règle : lecture publique = contenu vitrine ; écriture = administrateur.
--            orders et site_backups ne sont JAMAIS lisibles publiquement.
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_backups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;

-- ── products ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Full access products" ON public.products;
CREATE POLICY "Public read products" ON public.products
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
CREATE POLICY "Admin insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products" ON public.products
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── editorial_banners ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read banners" ON public.editorial_banners;
DROP POLICY IF EXISTS "Full access banners" ON public.editorial_banners;
CREATE POLICY "Public read banners" ON public.editorial_banners
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert banners" ON public.editorial_banners;
CREATE POLICY "Admin insert banners" ON public.editorial_banners
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin update banners" ON public.editorial_banners;
CREATE POLICY "Admin update banners" ON public.editorial_banners
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin delete banners" ON public.editorial_banners;
CREATE POLICY "Admin delete banners" ON public.editorial_banners
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── shipping_zones ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read shipping" ON public.shipping_zones;
DROP POLICY IF EXISTS "Full access shipping" ON public.shipping_zones;
CREATE POLICY "Public read shipping" ON public.shipping_zones
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert shipping" ON public.shipping_zones;
CREATE POLICY "Admin insert shipping" ON public.shipping_zones
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin update shipping" ON public.shipping_zones;
CREATE POLICY "Admin update shipping" ON public.shipping_zones
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin delete shipping" ON public.shipping_zones;
CREATE POLICY "Admin delete shipping" ON public.shipping_zones
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── faqs ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Full access faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert faqs" ON public.faqs;
CREATE POLICY "Admin insert faqs" ON public.faqs
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin update faqs" ON public.faqs;
CREATE POLICY "Admin update faqs" ON public.faqs
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin delete faqs" ON public.faqs;
CREATE POLICY "Admin delete faqs" ON public.faqs
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── site_backups — PRIVÉ ──────────────────────────────────────────────────
-- Un snapshot contient tout le catalogue : il ne doit jamais être lisible
-- ni forgeable par un visiteur, même en lecture seule.
DROP POLICY IF EXISTS "Public read backups" ON public.site_backups;
DROP POLICY IF EXISTS "Full access backups" ON public.site_backups;
DROP POLICY IF EXISTS "Admin read backups" ON public.site_backups;
CREATE POLICY "Admin read backups" ON public.site_backups
  FOR SELECT TO authenticated USING (public.is_site_admin());
DROP POLICY IF EXISTS "Admin insert backups" ON public.site_backups;
CREATE POLICY "Admin insert backups" ON public.site_backups
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin update backups" ON public.site_backups;
CREATE POLICY "Admin update backups" ON public.site_backups
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin delete backups" ON public.site_backups;
CREATE POLICY "Admin delete backups" ON public.site_backups
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── orders — PRIVÉ (données clients : nom, téléphone, adresse) ────────────
-- Aucune policy INSERT : la seule voie de création est le RPC `create_order`
-- (SECURITY DEFINER), qui recalcule prix et livraison côté serveur, applique
-- le honeypot et la limite de commandes. Un INSERT direct est donc refusé.
DROP POLICY IF EXISTS "Public select own order" ON public.orders;
DROP POLICY IF EXISTS "Full access orders" ON public.orders;
DROP POLICY IF EXISTS "Admin read orders" ON public.orders;
CREATE POLICY "Admin read orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_site_admin());
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;
CREATE POLICY "Admin delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.is_site_admin());

-- ── site_settings ─────────────────────────────────────────────────────────
-- Lecture publique nécessaire : le site vitrine lit contact, réseaux et
-- règles de livraison offerte. Écriture réservée à l'administrateur.
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public update site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert site_settings" ON public.site_settings;
CREATE POLICY "Admin insert site_settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_site_admin());
DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;
CREATE POLICY "Admin update site_settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());


-- ───────────────────────────────────────────────────────────────────────────
-- 4. Vérification rapide (à exécuter séparément si besoin)
-- ───────────────────────────────────────────────────────────────────────────
-- SELECT tablename, policyname, cmd, roles
--   FROM pg_policies WHERE schemaname = 'public'
--  ORDER BY tablename, policyname;
--
-- Attendu : plus aucune policy `FOR ALL` sans `TO`, et `anon` n'apparaît
-- que sur des `SELECT`.
