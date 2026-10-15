-- ============================================================================
-- 20261015 — Livraison offerte + commandes protégées — MG Perfume (Dakar)
-- ============================================================================
-- Le navigateur ne décide plus du prix. create_order() relit le produit, la zone
-- de livraison et les réglages côté serveur, puis écrit la commande. L'insertion
-- anonyme directe dans `orders` est fermée.
--
-- Adapté au schéma RÉEL de MG Perfume (vérifié en production) :
--   * products.id       → identifiant produit (pas de slug, pas de variantes)
--   * products.price    → prix de référence
--   * shipping_zones.id → zone (pas de colonne is_active)
--   * orders.id         → texte, sans défaut en base (généré ici)
--   * site_settings     → table ABSENTE avant cette migration, alors que le
--                         client l'utilisait déjà (contact / réseaux sociaux)
--
-- NOTE D'APPLICATION : le helper `exec_sql(query text)` de la base exécute UNE
-- seule instruction par appel et ne renvoie aucune ligne. Ce fichier est la
-- référence documentaire ; l'application réelle se fait instruction par
-- instruction (voir ~/scratch/mgperfume-safeguards/mig/).
-- ============================================================================


-- ─── 1. Réglages du site (table manquante) ───────────────────────────────────

create table if not exists public.site_settings (
  id         text primary key,
  contact    jsonb not null default '{}'::jsonb,
  social     jsonb not null default '{}'::jsonb,
  delivery   jsonb not null default '{"freeForAll": false}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings"
  on public.site_settings for select using (true);

drop policy if exists "Public insert site_settings" on public.site_settings;
create policy "Public insert site_settings"
  on public.site_settings for insert with check (true);

drop policy if exists "Public update site_settings" on public.site_settings;
create policy "Public update site_settings"
  on public.site_settings for update using (true) with check (true);

grant select, insert, update on public.site_settings to anon, authenticated;

insert into public.site_settings (id) values ('main') on conflict (id) do nothing;

update public.site_settings
   set delivery = delivery || jsonb_build_object(
         'freeForAll', coalesce(delivery -> 'freeForAll', 'false'::jsonb)
       ),
       updated_at = now()
 where id = 'main';


-- ─── 2. Livraison offerte par produit : colonne resserrée ────────────────────

update public.products set free_delivery = false where free_delivery is null;
alter table public.products alter column free_delivery set default false;
alter table public.products alter column free_delivery set not null;


-- ─── 3. create_order() : le serveur recalcule tout ───────────────────────────

create or replace function public.create_order(
  p_items             jsonb,
  p_customer_name     text,
  p_customer_phone    text,
  p_customer_address  text default null,
  p_shipping_zone_id  text default null,
  p_payment_method    text default 'whatsapp',
  p_notes             text default null,
  p_honeypot          text default null
)
returns table (
  ref_command   text,
  order_id      text,
  subtotal      numeric,
  shipping_cost numeric,
  total_amount  numeric,
  free_delivery boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name        text := btrim(coalesce(p_customer_name, ''));
  v_phone       text := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g');
  v_address     text := btrim(coalesce(p_customer_address, ''));
  v_method      text := lower(btrim(coalesce(p_payment_method, 'whatsapp')));
  v_zone_id     text;
  v_zone_price  numeric := 0;
  v_zone_name   text := null;
  v_free_all    boolean := false;
  v_free_line   boolean := false;
  v_subtotal    numeric := 0;
  v_shipping    numeric := 0;
  v_total       numeric := 0;
  v_items       jsonb := '[]'::jsonb;
  v_line        jsonb;
  v_pid         text;
  v_qty         int;
  v_price       numeric;
  v_free        boolean;
  v_count       int := 0;
  v_units       int := 0;
  v_new_id      text;
  v_ref         text;
  v_existing    public.orders%rowtype;
  v_fingerprint text;
  v_recent      timestamptz;
  v_recent_orders int;
  v_norm        text;
  v_norm_existing text;
begin
  -- Piège à robot : si le champ caché est rempli, on refuse sans rien écrire.
  if p_honeypot is not null and btrim(p_honeypot) <> '' then
    raise exception 'COMMANDE_REFUSEE';
  end if;

  if v_name = '' or length(v_name) < 2 then
    raise exception 'NOM_REQUIS';
  end if;

  if length(v_phone) < 8 or length(v_phone) > 15 then
    raise exception 'TELEPHONE_INVALIDE';
  end if;

  if v_method not in ('whatsapp', 'paytech', 'wave', 'orange_money', 'cash', 'livraison') then
    v_method := 'whatsapp';
  end if;

  -- Panier : structure, taille, quantités.
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'PANIER_VIDE';
  end if;

  if jsonb_array_length(p_items) > 20 then
    raise exception 'PANIER_TROP_GRAND';
  end if;

  -- Livraison offerte pour tout le catalogue ?
  select coalesce((delivery ->> 'freeForAll')::boolean, false)
    into v_free_all
    from public.site_settings
   where id = 'main';
  v_free_all := coalesce(v_free_all, false);

  -- Zone de livraison : le prix vient de la base, jamais du navigateur.
  if p_shipping_zone_id is not null and btrim(p_shipping_zone_id) <> '' then
    select z.id, z.name, coalesce(z.price, 0)
      into v_zone_id, v_zone_name, v_zone_price
      from public.shipping_zones z
     where z.id = btrim(p_shipping_zone_id);
    if v_zone_id is null then
      raise exception 'ZONE_INTROUVABLE';
    end if;
  else
    select z.id, z.name, coalesce(z.price, 0)
      into v_zone_id, v_zone_name, v_zone_price
      from public.shipping_zones z
     order by z.price asc, z.id asc
     limit 1;
    if v_zone_id is null then
      raise exception 'ZONE_INTROUVABLE';
    end if;
  end if;

  -- Relecture de chaque ligne : prix, existence, disponibilité, livraison offerte.
  for v_line in select * from jsonb_array_elements(p_items) loop
    v_pid := nullif(btrim(coalesce(v_line ->> 'productId', v_line ->> 'product_id', '')), '');
    if v_pid is null then
      raise exception 'LIGNE_SANS_PRODUIT';
    end if;

    v_qty := coalesce((v_line ->> 'quantity')::int, 0);
    if v_qty is null or v_qty < 1 then
      raise exception 'QUANTITE_INVALIDE';
    end if;
    if v_qty > 20 then
      v_qty := 20;
    end if;

    select p.price, coalesce(p.free_delivery, false)
      into v_price, v_free
      from public.products p
     where p.id = v_pid;

    if v_price is null then
      raise exception 'PRODUIT_INTROUVABLE';
    end if;

    -- Un produit archivé ou en rupture ne peut plus être commandé en ligne.
    if exists (
      select 1 from public.products p
       where p.id = v_pid
         and (coalesce(p.is_archived, false) or p.in_stock = false)
    ) then
      raise exception 'PRODUIT_INDISPONIBLE';
    end if;

    if v_free then
      v_free_line := true;
    end if;

    v_subtotal := v_subtotal + (v_price * v_qty);
    v_units    := v_units + v_qty;
    v_count    := v_count + 1;

    v_items := v_items || jsonb_build_object(
      'productId', v_pid,
      'name',      coalesce((select p.name from public.products p where p.id = v_pid), v_pid),
      'brand',     coalesce((select p.brand from public.products p where p.id = v_pid), 'MG Perfume'),
      'image',     (select p.image from public.products p where p.id = v_pid),
      'price',     v_price,
      'quantity',  v_qty
    );
  end loop;

  if v_count = 0 then
    raise exception 'PANIER_VIDE';
  end if;

  if v_units > 60 then
    raise exception 'PANIER_TROP_GRAND';
  end if;

  -- Anti-spam : 5 commandes maximum par numéro sur 30 minutes.
  select count(*), max(o.created_at)
    into v_recent_orders, v_recent
    from public.orders o
   where regexp_replace(coalesce(o.customer_phone, ''), '[^0-9]', '', 'g') = v_phone
     and o.created_at > now() - interval '30 minutes';

  if v_recent_orders >= 5 then
    raise exception 'TROP_DE_COMMANDES';
  end if;

  -- Doublon : même panier, même numéro, moins de 3 minutes → on renvoie la
  -- commande déjà enregistrée au lieu d'en créer une seconde.
  v_fingerprint := md5(v_items::text || '|' || v_phone);

  select * into v_existing
    from public.orders o
   where regexp_replace(coalesce(o.customer_phone, ''), '[^0-9]', '', 'g') = v_phone
     and o.created_at > now() - interval '3 minutes'
     and md5(coalesce(o.items, '[]'::jsonb)::text || '|' || v_phone) = v_fingerprint
   order by o.created_at desc
   limit 1;

  if v_existing.id is not null then
    return query select
      v_existing.ref_command,
      v_existing.id,
      coalesce(v_existing.subtotal, 0),
      coalesce(v_existing.shipping_cost, 0),
      coalesce(v_existing.total_amount, 0),
      coalesce(v_existing.shipping_cost, 0) = 0;
    return;
  end if;

  -- Total : livraison offerte si le réglage global est actif ou si une seule
  -- ligne est en livraison offerte (même règle que le panier).
  v_shipping := case when (v_free_all or v_free_line) then 0 else coalesce(v_zone_price, 0) end;
  v_total    := v_subtotal + v_shipping;

  v_new_id := 'mgp-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-'
              || substr(md5(random()::text || clock_timestamp()::text), 1, 6);
  v_ref    := 'MGP-' || to_char(now(), 'YYYYMMDD') || '-'
              || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));

  insert into public.orders (
    id, ref_command, customer_name, customer_phone, customer_address,
    shipping_zone_id, shipping_zone_name, shipping_cost, subtotal, total_amount,
    items, payment_method, payment_status, order_status, notes,
    created_at, updated_at
  ) values (
    v_new_id, v_ref, v_name, v_phone, v_address,
    v_zone_id, v_zone_name, v_shipping, v_subtotal, v_total,
    v_items, v_method, 'pending', 'new', coalesce(p_notes, ''),
    now(), now()
  );

  return query select v_ref, v_new_id, v_subtotal, v_shipping, v_total,
                      (v_free_all or v_free_line);
end;
$$;

revoke all on function public.create_order(
  jsonb, text, text, text, text, text, text, text
) from public;

grant execute on function public.create_order(
  jsonb, text, text, text, text, text, text, text
) to anon, authenticated;


-- ─── 4. Fermeture de l'écriture anonyme sur orders ───────────────────────────
-- (appliquée en DERNIER, après le déploiement du client qui appelle create_order)

drop policy if exists "Public insert orders" on public.orders;
drop policy if exists "Full access orders" on public.orders;

revoke insert, update, delete, truncate on public.orders from anon;
grant select on public.orders to anon, authenticated;
grant update on public.orders to authenticated;
