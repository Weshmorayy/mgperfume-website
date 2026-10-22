-- ============================================================================
--  MG Perfume — garde-fou : interdire la suppression d'une VRAIE commande
--  Base : xnmolqmcfnjvcblizahu (projet MG)
--  Écrit le 2026-10-17. Même règle que côté Continental, mot pour mot.
--
--  PROBLÈME VISÉ
--  Le portail MG permettait de supprimer n'importe quelle commande, et rien en
--  base ne s'y opposait. Une commande client est la preuve de la vente : sa
--  disparition ne doit pas tenir à un clic de trop. Le bouton a été retiré de
--  l'interface, mais masquer un bouton n'est pas une protection — un appel
--  PostgREST bien formé passe encore. C'est donc la BASE qui décide.
--
--  RÈGLE APPLIQUÉE
--  Une ligne de public.orders ne peut être supprimée que si le mot « test »
--  apparaît COMME MOT ENTIER (insensible à la casse et aux accents) dans
--  customer_name, ref_command ou notes. Tout le reste est refusé, quel que soit
--  l'appelant (portail admin, appel direct PostgREST, script).
--  Exception : les rôles de confiance (service_role, postgres, supabase_admin)
--  gardent la main — ce sont ceux des scripts serveur (maintenance, RGPD).
--
--  ── Différences avec la table de Continental, vérifiées ───────────────────
--    • public.orders.id est un TEXT ici, pas un uuid : la fonction caste en
--      text pour le message d'erreur, ce qui fonctionne dans les deux cas.
--    • pas d'énumération : order_status est un TEXT libre, donc aucune
--      migration de type à prévoir côté MG.
--    • les trois colonnes lues (customer_name, ref_command, notes) existent
--      bien, et aucune autre fonction/trigger ne porte ce nom.
--
--  L'IDEMPOTENCE EST ASSURÉE : le script peut être rejoué sans erreur.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1) Fonction de contrôle
-- ---------------------------------------------------------------------------
create or replace function public.orders_delete_guard()
returns trigger
language plpgsql
-- PAS de SECURITY DEFINER : on veut que current_user reflète le rôle réellement
-- actif de l'appel (service_role, authenticated, anon…). Avec SECURITY DEFINER,
-- current_user deviendrait le propriétaire de la fonction et le contournement
-- service_role ne fonctionnerait plus.
security invoker
set search_path = public, pg_temp
as $$
declare
  haystack text;
  is_test  boolean;
begin
  -- Les rôles de confiance gardent la main (scripts serveur, maintenance).
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return old;
  end if;

  -- On rassemble les champs qui peuvent légitimement porter le mot « test »,
  -- on replie les accents, on minuscule, et on encadre le tout d'espaces pour
  -- que « test » soit détecté comme MOT ENTIER (et non à l'intérieur de
  -- « contestation » ou « attestation »).
  haystack := ' ' ||
    translate(
      lower(
        coalesce(old.customer_name, '') || ' ' ||
        coalesce(old.ref_command,   '') || ' ' ||
        coalesce(old.notes,         '')
      ),
      'áàâäãåéèêëíìîïóòôöõúùûüçñ',
      'aaaaaaeeeeiiiiooooouuuucn'
    ) || ' ';

  is_test := haystack like '% test %'
          or haystack like '% test-%'
          or haystack like '%-test %'
          or haystack like '%-test-%'
          or haystack like '%"test"%';

  if is_test then
    return old;
  end if;

  -- Refus explicite : le message est destiné à être lu tel quel dans l'interface.
  raise exception
    'Suppression refusée : la commande % n''est pas marquée « test ». Une commande client réelle ne peut pas être supprimée depuis l''application. Annulez-la (order_status) ou passez par le support pour un effacement RGPD.',
    coalesce(nullif(old.ref_command, ''), old.id::text)
    using errcode = '42501';  -- insufficient_privilege
end;
$$;

comment on function public.orders_delete_guard() is
  'Interdit la suppression d''une commande non marquée « test » (sauf service_role).';


-- ---------------------------------------------------------------------------
-- 2) Déclencheur BEFORE DELETE
-- ---------------------------------------------------------------------------
drop trigger if exists orders_delete_guard on public.orders;

create trigger orders_delete_guard
  before delete on public.orders
  for each row
  execute function public.orders_delete_guard();


-- ---------------------------------------------------------------------------
-- 3) Vérifications à lancer APRÈS exécution (à copier une par une)
-- ---------------------------------------------------------------------------

-- 3a) Le déclencheur est bien là, en BEFORE DELETE, actif :
-- select tgname, tgtype, tgenabled
--   from pg_trigger
--  where tgrelid = 'public.orders'::regclass and not tgisinternal;

-- 3b) Refus attendu (lever l'erreur 42501) — remplacez la référence par une
--     vraie commande NON marquée test :
-- begin;
--   delete from public.orders where ref_command = 'MGP-0000-000000-A000';
-- rollback;

-- 3c) Autorisation attendue — une commande marquée test :
-- begin;
--   delete from public.orders where ref_command = 'TEST-001';
-- rollback;

-- 3d) Contrôle de la logique de détection sans rien supprimer :
-- select
--   x as cas,
--   (' ' || translate(lower(x), 'áàâäãåéèêëíìîïóòôöõúùûüçñ',
--                                'aaaaaaeeeeiiiiooooouuuucn') || ' ') like '% test %'
--   as detecte_comme_test
-- from (values
--   ('Commande test'), ('TEST-001'), ('Attestation de paiement'),
--   ('Contestation client'), ('Aïssatou Test Diallo'), ('Awa Ndiaye')
-- ) as t(x);


-- ---------------------------------------------------------------------------
-- 4) Retour arrière (si la règle doit être retirée un jour)
-- ---------------------------------------------------------------------------
-- drop trigger if exists orders_delete_guard on public.orders;
-- drop function if exists public.orders_delete_guard();
