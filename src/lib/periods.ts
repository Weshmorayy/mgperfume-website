/**
 * periods.ts — Les fenêtres de temps du tableau de bord.
 *
 * Partagé par le serveur (`lib/umami.ts`) et par l'écran
 * (`components/admin/StatsTab.tsx`).
 *
 * Ce partage n'est pas un détail de rangement : les deux familles de chiffres
 * — l'audience lue chez Umami, le commerce lu dans Supabase — doivent porter
 * sur EXACTEMENT la même fenêtre. Deux tables de durées séparées finiraient
 * par diverger d'un jour, et l'écran afficherait alors un chiffre d'affaires
 * sur 31 jours à côté de visites sur 30, sans que rien ne le signale.
 */

export type PeriodKey = '24h' | '7d' | '30d' | '90d' | '12m' | 'all'
export type GranularityKey = 'hour' | 'day' | 'week' | 'month'

export const HOUR_MS = 3_600_000
export const DAY_MS = 24 * HOUR_MS

/** Ordre d'affichage des boutons de période, du plus court au plus long. */
export const PERIODS: PeriodKey[] = ['24h', '7d', '30d', '90d', '12m', 'all']

export const PERIOD_LABEL: Record<PeriodKey, string> = {
  '24h': '24 h',
  '7d': '7 jours',
  '30d': '30 jours',
  '90d': '90 jours',
  '12m': '12 mois',
  all: 'Depuis toujours',
}

/** Durée de chaque période, sauf « depuis toujours » qui dépend du site. */
export const PERIOD_MS: Record<Exclude<PeriodKey, 'all'>, number> = {
  '24h': DAY_MS,
  '7d': 7 * DAY_MS,
  '30d': 30 * DAY_MS,
  '90d': 90 * DAY_MS,
  '12m': 365 * DAY_MS,
}

/**
 * Début de la période, en millisecondes epoch.
 * `null` pour « depuis toujours » : la borne est alors la date de création du
 * site, que seul Umami connaît.
 */
export function periodStart(period: PeriodKey, now = Date.now()): number | null {
  if (period === 'all') return null
  return now - PERIOD_MS[period]
}

/**
 * Découpage proposé pour chaque période.
 *
 * Le découpage horaire n'apparaît que sur 24 h : sur un mois, une heure est
 * une barre trop fine pour se lire, et Umami refuserait de toute façon de
 * rendre 720 points horaires — il bascule lui-même en jours au-delà de 48 h.
 */
export const GRANULARITIES_FOR: Record<PeriodKey, GranularityKey[]> = {
  '24h': ['hour', 'day'],
  '7d': ['day', 'week'],
  '30d': ['day', 'week'],
  '90d': ['day', 'week', 'month'],
  '12m': ['month', 'week'],
  all: ['month', 'week'],
}

export const DEFAULT_GRANULARITY: Record<PeriodKey, GranularityKey> = {
  '24h': 'hour',
  '7d': 'day',
  '30d': 'day',
  '90d': 'day',
  '12m': 'month',
  all: 'month',
}

export const GRANULARITY_LABEL: Record<GranularityKey, string> = {
  hour: 'Heure',
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
}

/** Durées des blocs d'axe, pour le calcul du remplissage. */
export const GRANULARITY_PLURAL: Record<GranularityKey, string> = {
  hour: 'par heure',
  day: 'par jour',
  week: 'par semaine',
  month: 'par mois',
}
