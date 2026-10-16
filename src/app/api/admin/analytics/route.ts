/**
 * api/admin/analytics/route.ts — Passerelle vers les statistiques d'audience.
 *
 * ── Pourquoi une passerelle et non un appel direct ────────────────────────
 * Le mot de passe du compte Umami doit rester sur le serveur. Le navigateur
 * n'envoie donc que son jeton de session Supabase ; cette route vérifie qui
 * parle, puis interroge Umami pour son compte.
 *
 * ── Qui a le droit ────────────────────────────────────────────────────────
 * Ici l'administration n'a pas de rôles : `public.site_admins` est une simple
 * liste d'appartenance (user_id, email), et cette table est révoquée pour
 * `anon` comme pour `authenticated`. Elle n'est donc pas interrogeable depuis
 * cette route, et c'est voulu : la seule source de vérité est la fonction
 * `public.is_site_admin()`, SECURITY DEFINER, qui lit la liste en contournant
 * sa RLS et répond sur `auth.uid()`. Un appelant qui n'y figure pas se voit
 * refuser ici, plutôt que de compter sur le fait que l'onglet soit masqué. Un
 * onglet masqué n'est pas une autorisation : l'URL, elle, reste appelable.
 *
 * ── Ce que cette route ne renvoie pas ─────────────────────────────────────
 * Ni commandes, ni chiffre d'affaires. Ces chiffres vivent dans Supabase et
 * l'écran les lit directement avec la session de l'administrateur : RLS fait
 * le tri. Ici on ne sert que l'audience.
 */

import { NextResponse } from 'next/server'
import {
  getAudience,
  isUmamiConfigured,
  umamiConfigurationProblem,
  UMAMI_TIMEZONE,
  UmamiError,
  type GranularityKey,
  type PeriodKey,
} from '@/lib/umami'

// Aucun cache : l'écran demande des chiffres à jour, et la route est de toute
// façon protégée par une session.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PERIODS: PeriodKey[] = ['24h', '7d', '30d', '90d', '12m', 'all']
const GRANULARITIES: GranularityKey[] = ['hour', 'day', 'week', 'month']

/** Valeur par défaut si le paramètre est absent ou inconnu. */
function pick<T extends string>(raw: string | null, allowed: T[], fallback: T): T {
  return allowed.includes(raw as T) ? (raw as T) : fallback
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

  if (!url || !anon) {
    return NextResponse.json(
      { error: 'Supabase n’est pas configuré côté serveur.' },
      { status: 500 },
    )
  }

  /* ── 1. Qui appelle ? ──────────────────────────────────────────────────── */

  const header = request.headers.get('authorization') ?? ''
  const jwt = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!jwt) {
    return NextResponse.json({ error: 'Session requise.' }, { status: 401 })
  }

  // Le jeton est présenté à Supabase, qui seul peut dire s'il est valide et à
  // qui il appartient. Le croire sur parole serait laisser n'importe qui lire
  // le trafic du site en inventant une chaîne. La réponse n'est d'ailleurs lue
  // que pour constater qu'un compte existe : c'est `is_site_admin()` qui
  // tranche l'autorisation, pas un champ de ce corps.
  const identity = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anon, Authorization: `Bearer ${jwt}` },
    cache: 'no-store',
  }).catch(() => null)

  if (!identity?.ok) {
    return NextResponse.json({ error: 'Session expirée ou invalide.' }, { status: 401 })
  }

  const user = (await identity.json()) as { email?: string }
  if (!user.email) {
    return NextResponse.json({ error: 'Compte sans adresse.' }, { status: 401 })
  }

  /* ── 2. Est-il administrateur ? ────────────────────────────────────────── */

  // L'appel porte le jeton de l'utilisateur, pas une clé d'administration :
  // `is_site_admin()` s'exécute donc sous son identité et répond sur lui seul.
  // `{}` est un corps vide explicite — la fonction ne prend aucun argument.
  const check = await fetch(`${url}/rest/v1/rpc/is_site_admin`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: '{}',
    cache: 'no-store',
  }).catch(() => null)

  // Une fonction absente ou refusée n'est pas une autorisation : tout ce qui
  // n'est pas un `true` explicite est traité comme un refus.
  const isAdmin = check?.ok ? ((await check.json().catch(() => false)) as unknown) : false
  if (isAdmin !== true) {
    return NextResponse.json(
      { error: 'Les statistiques sont réservées aux comptes administrateurs.' },
      { status: 403 },
    )
  }

  /* ── 3. Umami est-il branché ? ─────────────────────────────────────────── */

  if (!isUmamiConfigured) {
    // 200 et non 500 : ce n'est pas une panne, c'est une installation qui
    // n'a pas encore été faite. L'écran affiche alors le compteur de repli et
    // la marche à suivre, sans rouge ni message d'erreur.
    return NextResponse.json({
      configured: false,
      problem: umamiConfigurationProblem(),
      timezone: UMAMI_TIMEZONE,
    })
  }

  /* ── 4. Les chiffres ───────────────────────────────────────────────────── */

  const params = new URL(request.url).searchParams
  const period = pick(params.get('period'), PERIODS, '30d')
  const granularity = pick(params.get('granularity'), GRANULARITIES, 'day')

  try {
    const report = await getAudience(period, granularity)
    return NextResponse.json({ ...report, timezone: UMAMI_TIMEZONE })
  } catch (error) {
    const message =
      error instanceof UmamiError
        ? error.message
        : 'Umami est injoignable depuis le serveur.'

    // 502 : c'est Umami qui n'a pas répondu, pas cette application. Le
    // message nomme la cause réelle — identifiants refusés, service éteint,
    // site inconnu — parce qu'un « erreur de chargement » obligerait à
    // ouvrir les journaux pour deviner laquelle.
    return NextResponse.json({ configured: true, error: message }, { status: 502 })
  }
}
