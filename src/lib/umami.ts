/**
 * umami.ts — Lecture de la mesure d'audience.
 *
 * Ce fichier ne s'exécute QUE sur le serveur. Il détient le mot de passe du
 * compte Umami de lecture, et ce mot de passe ne doit jamais atteindre le
 * navigateur : c'est la raison d'être de la route `api/admin/analytics`, qui
 * vérifie l'identité de l'appelant avant d'appeler ces fonctions.
 *
 * ── Pourquoi un intermédiaire plutôt qu'un appel direct ───────────────────
 * Umami sait émettre des URL de partage public. Les utiliser serait plus
 * court, mais n'importe qui possédant le lien lirait alors le trafic du site,
 * et il n'existe aucun moyen de le révoquer sans changer l'URL. Ici, l'accès
 * passe par l'authentification habituelle de l'administration, et se révoque
 * en retirant la ligne `site_admins`.
 *
 * ── Ce que ce module ne fait pas ──────────────────────────────────────────
 * Il ne calcule aucun chiffre d'affaires, aucune commande, aucun panier :
 * ces mesures vivent dans Supabase et sont lues par l'écran. Une visite n'est
 * pas une vente, et les deux familles ne se mélangent pas ici.
 */

import {
  DAY_MS as DAY,
  HOUR_MS as HOUR,
  PERIOD_MS,
  type GranularityKey,
  type PeriodKey,
} from '@/lib/periods'

/* ────────────────────────────── configuration ───────────────────────────── */

const BASE = (process.env.UMAMI_URL ?? process.env.NEXT_PUBLIC_UMAMI_URL ?? '')
  .trim()
  .replace(/\/+$/, '')

const USERNAME = process.env.UMAMI_USERNAME?.trim()
const PASSWORD = process.env.UMAMI_PASSWORD
// Deux noms possibles : `UMAMI_WEBSITE_ID` est lu à l'exécution, ce qui permet
// de brancher l'onglet sans reconstruire l'image ; `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
// est celui du script de mesure, figé dans le bundle au moment du build. Le
// serveur accepte les deux, dans cet ordre.
const WEBSITE_ID = (
  process.env.UMAMI_WEBSITE_ID ?? process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
)?.trim()

/**
 * Fuseau de découpage des jours. Dakar est à UTC+0 toute l'année, sans heure
 * d'été : un « jour » du graphique correspond exactement à un jour vécu par le
 * visiteur, sans décalage à corriger.
 */
export const UMAMI_TIMEZONE = process.env.UMAMI_TIMEZONE?.trim() || 'Africa/Dakar'

/**
 * `true` seulement si les cinq variables sont là. L'écran s'en sert pour
 * choisir entre le tableau de bord Umami et le repli sur le compteur
 * Supabase ; il n'affiche jamais une erreur pour une variable manquante.
 */
export const isUmamiConfigured = Boolean(BASE && USERNAME && PASSWORD && WEBSITE_ID)

/* ──────────────────────────────── périodes ──────────────────────────────── */

export type { GranularityKey, PeriodKey }

/** Unité réellement demandée à Umami : `week` n'existe pas chez lui. */
type ApiUnit = 'hour' | 'day' | 'month'

/** Au-delà, Umami promeut lui-même l'unité `day` en `month`. */
const DAY_UNIT_MAX = 366 * DAY

/** Bornes d'une période, en millisecondes epoch — le format attendu par l'API. */
function bounds(period: PeriodKey, allTimeStart: number | null): { startAt: number; endAt: number } {
  const endAt = Date.now()
  if (period === 'all') {
    // `allTimeStart` vient de la date de création du site dans Umami. Sans
    // elle, on retombe sur deux ans : assez large pour tout couvrir, assez
    // borné pour ne pas demander une série sans limite.
    return { startAt: allTimeStart ?? endAt - 2 * 365 * DAY, endAt }
  }
  return { startAt: endAt - PERIOD_MS[period], endAt }
}

/**
 * Unité à demander à Umami pour obtenir la granularité voulue.
 *
 * Umami ne connaît pas la semaine : pour un découpage hebdomadaire on demande
 * donc des jours, et on regroupe ensuite. Les autres cas passent directement.
 * La seule subtilité est la promotion automatique de `day` en `month` au-delà
 * d'un an — on l'anticipe pour que l'affichage annonce la bonne unité plutôt
 * que de découvrir des libellés mensuels dans un axe quotidien.
 */
function apiUnitFor(target: GranularityKey, spanMs: number): ApiUnit {
  const wanted: ApiUnit = target === 'week' ? 'day' : target
  if (wanted === 'hour' && spanMs > 48 * HOUR) {
    return spanMs > DAY_UNIT_MAX ? 'month' : 'day'
  }
  if (wanted === 'day' && spanMs > DAY_UNIT_MAX) return 'month'
  return wanted
}

/* ──────────────────────────────── transport ─────────────────────────────── */

/**
 * Jeton de session Umami, gardé en mémoire du processus.
 *
 * Se reconnecter à chaque requête ajouterait un aller-retour et, surtout,
 * ferait apparaître une connexion dans le journal d'Umami à chaque
 * rafraîchissement de l'écran. L'expiration réelle est lue dans le jeton
 * lui-même plutôt que devinée : Umami signe ses jetons en JWT, la date de
 * fin y figure.
 *
 * ── La connexion en cours compte autant que le jeton ─────────────────────
 * Un même écran déclenche huit appels simultanés (résumé, série, six
 * métriques). Au premier chargement, aucun jeton n'existe encore : les huit
 * appels partent donc en même temps et se connectent chacun de leur côté.
 * Mesuré : onze connexions là où une seule suffisait.
 *
 * `pending` retient la connexion DÉJÀ EN COURS. Les appels qui arrivent
 * pendant ce temps attendent la même promesse au lieu d'en ouvrir une
 * deuxième. Ce n'est pas une optimisation de confort — sur un hébergement qui
 * recycle ses processus, ce pic se reproduit à chaque démarrage.
 */
let session: { token: string; expiresAt: number } | null = null
let pending: Promise<string> | null = null

/** Date d'expiration lue dans le JWT. `0` si le jeton n'est pas lisible. */
function readExpiry(token: string): number {
  try {
    const part = token.split('.')[1]
    if (!part) return 0
    const payload = JSON.parse(Buffer.from(part, 'base64').toString('utf8'))
    return typeof payload?.exp === 'number' ? payload.exp * 1000 : 0
  } catch {
    return 0
  }
}

class UmamiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function login(): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    cache: 'no-store',
  })

  if (!res.ok) {
    // 401 ici veut dire « identifiants refusés » : le redire est inutile et
    // masquerait la vraie cause derrière une erreur de statistiques.
    throw new UmamiError(
      res.status === 401
        ? 'Umami a refusé les identifiants (UMAMI_USERNAME / UMAMI_PASSWORD).'
        : `Umami a répondu ${res.status} à la connexion.`,
      res.status,
    )
  }

  const data = (await res.json()) as { token?: string }
  if (!data.token) throw new UmamiError('Umami n’a pas renvoyé de jeton de session.', 500)

  const expiry = readExpiry(data.token)
  session = {
    token: data.token,
    // Une minute de marge : un jeton qui expire pendant la requête en cours
    // produirait un échec difficile à relier à sa cause.
    expiresAt: expiry > 0 ? expiry - 60_000 : Date.now() + 30 * 60_000,
  }
  return data.token
}

/**
 * Jeton valide, en réutilisant la connexion en cours si elle existe.
 *
 * `pending` est remis à `null` quoi qu'il arrive : sans cela, une connexion
 * qui échoue laisserait une promesse rejetée en cache, et toutes les tentatives
 * suivantes échoueraient avec la même erreur périmée.
 */
async function token(): Promise<string> {
  if (session && session.expiresAt > Date.now()) return session.token
  if (!pending) {
    pending = login().finally(() => { pending = null })
  }
  return pending
}

/** Un appel GET authentifié, avec une reconnexion si le jeton a expiré. */
async function get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  }

  const send = async (bearer: string) =>
    fetch(url, {
      headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json' },
      cache: 'no-store',
    })

  let res = await send(await token())
  // Un 401 en cours de route ne peut venir que d'un jeton périmé. On l'oublie
  // puis on rejoue, une fois. Les appels simultanés qui reçoivent ce 401 en
  // même temps se partagent la reconnexion au lieu d'en ouvrir une chacun.
  if (res.status === 401) {
    session = null
    res = await send(await token())
  }

  if (!res.ok) {
    throw new UmamiError(`Umami a répondu ${res.status} sur ${path}.`, res.status)
  }
  return res.json() as Promise<T>
}

/* ──────────────────────────── formes de l'API ───────────────────────────── */

/** Umami renvoie `{value, prev}` pour chaque compteur résumé. */
interface Counter { value: number; prev: number }
interface Summary {
  pageviews: Counter
  visitors: Counter
  visits: Counter
  bounces: Counter
  totaltime: Counter
}

/**
 * Umami renvoie `{x, y}`. `x` est une chaîne déjà mise en forme selon l'unité
 * et le fuseau demandés — jamais un timestamp : `2026-10-05` en jours,
 * `2026-10-05 18:00:00` en heures, `2026-10` en mois, `2026` en années.
 */
interface Point { x: string; y: number }
interface Series { pageviews: Point[]; sessions: Point[] }

/* ──────────────────────────── mise en forme ─────────────────────────────── */

/** `2026-10-05 18:00:00` → `Date`. Le fuseau étant UTC+0, `Z` est exact. */
function parseX(x: string): Date {
  if (/^\d{4}$/.test(x)) return new Date(`${x}-01-01T00:00:00Z`)
  if (/^\d{4}-\d{2}$/.test(x)) return new Date(`${x}-01T00:00:00Z`)
  if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return new Date(`${x}T00:00:00Z`)
  return new Date(`${x.replace(' ', 'T')}Z`)
}

/** Clé de regroupement d'une date, selon la granularité affichée. */
function bucketKey(date: Date, granularity: GranularityKey): string {
  const day = date.toISOString().slice(0, 10)
  if (granularity === 'hour') return `${day} ${String(date.getUTCHours()).padStart(2, '0')}`
  if (granularity === 'day') return day
  if (granularity === 'month') return day.slice(0, 7)
  // Semaine : lundi, comme le calendrier français. `getUTCDay()` renvoie 0
  // pour dimanche, d'où le décalage.
  const monday = new Date(date)
  const offset = (monday.getUTCDay() + 6) % 7
  monday.setUTCDate(monday.getUTCDate() - offset)
  return monday.toISOString().slice(0, 10)
}

/** Libellé court d'un axe. Le détail complet reste dans l'infobulle. */
function bucketLabel(key: string, granularity: GranularityKey): string {
  const [date, hour] = key.split(' ')
  const [y, m, d] = date.split('-')
  if (granularity === 'hour') return `${d}/${m} ${hour}h`
  if (granularity === 'month') return `${m}/${y}`
  if (granularity === 'week') return `sem. ${d}/${m}`
  return `${d}/${m}`
}

/**
 * Liste continue de cases, du début à la fin de la période.
 *
 * Umami n'émet que les intervalles où il s'est passé quelque chose. Sans ce
 * remplissage, un mois sans visite disparaîtrait de la courbe au lieu d'y
 * apparaître comme un trou — c'est-à-dire exactement l'information qu'on
 * cherche.
 */
function axis(startAt: number, endAt: number, granularity: GranularityKey): string[] {
  const keys: string[] = []
  const seen = new Set<string>()

  if (granularity === 'month') {
    const cursor = new Date(startAt)
    cursor.setUTCDate(1)
    cursor.setUTCHours(0, 0, 0, 0)
    while (cursor.getTime() <= endAt) {
      const key = cursor.toISOString().slice(0, 7)
      if (!seen.has(key)) { seen.add(key); keys.push(key) }
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
    return keys
  }

  const step = granularity === 'hour' ? HOUR : DAY
  const cursor = new Date(startAt)
  // On aligne sur le début d'heure ou de journée, sinon la première case
  // serait partielle et se lirait comme une chute.
  if (granularity === 'hour') cursor.setUTCMinutes(0, 0, 0)
  else cursor.setUTCHours(0, 0, 0, 0)

  while (cursor.getTime() <= endAt) {
    const key = bucketKey(cursor, granularity)
    if (!seen.has(key)) { seen.add(key); keys.push(key) }
    cursor.setTime(cursor.getTime() + step)
  }
  return keys
}

/* ──────────────────────────────── rapport ───────────────────────────────── */

export interface AudiencePoint {
  key: string
  label: string
  date: string
  pageviews: number
  visitors: number
}

export interface AudienceRow { value: string; count: number }

export interface AudienceReport {
  configured: true
  period: PeriodKey
  granularity: GranularityKey
  /** Unité réellement renvoyée, si elle diffère de celle demandée. */
  effectiveUnit: ApiUnit
  startAt: number
  endAt: number
  summary: {
    pageviews: number
    visitors: number
    visits: number
    bounces: number
    totaltime: number
    /** Variations en pourcentage par rapport à la période précédente. */
    previous: { pageviews: number; visitors: number; visits: number }
  }
  /** Ratios calculés ici : l'écran n'a plus qu'à les afficher. */
  derived: { bounceRate: number | null; averageDuration: number; pagesPerVisit: number | null }
  series: AudiencePoint[]
  pages: AudienceRow[]
  referrers: AudienceRow[]
  devices: AudienceRow[]
  browsers: AudienceRow[]
  countries: AudienceRow[]
  events: AudienceRow[]
}

/** Date de création du site dans Umami — sert de borne à « depuis toujours ». */
let createdAtCache: { value: number; at: number } | null = null

async function websiteCreatedAt(): Promise<number | null> {
  if (createdAtCache && Date.now() - createdAtCache.at < 10 * 60_000) return createdAtCache.value
  try {
    const site = await get<{ createdAt?: unknown }>(`/api/websites/${WEBSITE_ID}`)
    // Selon la version, Umami renvoie la date en clair ou enveloppée dans un
    // objet `{value}` — les deux formes ont été vues.
    const raw = typeof site.createdAt === 'string'
      ? site.createdAt
      : (site.createdAt as { value?: string } | undefined)?.value
    const parsed = raw ? Date.parse(raw) : NaN
    if (!Number.isFinite(parsed)) return null
    createdAtCache = { value: parsed, at: Date.now() }
    return parsed
  } catch {
    // Un site introuvable ne doit pas vider l'écran : on retombera sur les
    // deux ans par défaut.
    return null
  }
}

/** Regroupe des points journaliers en semaines, ou les passe tels quels. */
function toSeries(
  raw: Series,
  startAt: number,
  endAt: number,
  granularity: GranularityKey,
): AudiencePoint[] {
  const views = new Map<string, number>()
  const visitors = new Map<string, number>()

  for (const p of raw.pageviews ?? []) {
    const key = bucketKey(parseX(p.x), granularity)
    views.set(key, (views.get(key) ?? 0) + p.y)
  }
  for (const p of raw.sessions ?? []) {
    const key = bucketKey(parseX(p.x), granularity)
    visitors.set(key, (visitors.get(key) ?? 0) + p.y)
  }

  return axis(startAt, endAt, granularity).map((key) => {
    const date = granularity === 'month' ? `${key}-01` : key.split(' ')[0]
    return {
      key,
      label: bucketLabel(key, granularity),
      date,
      pageviews: views.get(key) ?? 0,
      visitors: visitors.get(key) ?? 0,
    }
  })
}

const n = (counter: Counter | undefined) => Math.max(0, counter?.value ?? 0)

/**
 * Tout ce que l'onglet Statistiques affiche côté audience, en une fois.
 *
 * Les appels partent ensemble : six allers-retours séquentiels vers Umami
 * prendraient plusieurs secondes, alors qu'ils sont indépendants.
 */
export async function getAudience(
  period: PeriodKey,
  granularity: GranularityKey,
): Promise<AudienceReport> {
  if (!isUmamiConfigured) throw new UmamiError('Umami n’est pas configuré.', 503)

  const allTimeStart = period === 'all' ? await websiteCreatedAt() : null
  const { startAt, endAt } = bounds(period, allTimeStart)
  const unit = apiUnitFor(granularity, endAt - startAt)

  const range = { startAt, endAt, timezone: UMAMI_TIMEZONE }

  const [summary, series, pages, referrers, devices, browsers, countries, events] = await Promise.all([
    get<Summary>(`/api/websites/${WEBSITE_ID}/stats`, range),
    get<Series>(`/api/websites/${WEBSITE_ID}/pageviews`, { ...range, unit }),
    // 50 et non 12 : cette liste ne sert pas qu'à afficher les pages les plus
    // consultées, elle sert aussi à COMPTER les consultations de fiche produit
    // pour le taux de contact. Une limite trop basse tronquerait le total, et
    // le taux serait faux — pas approximatif, faux.
    // `path` et non `url` : Umami v3 a renommé ce type de métrique. Avec
    // l'ancien nom le serveur répond 400, et comme les appels partent en
    // `Promise.all`, un seul 400 vidait l'onglet Statistiques en entier.
    get<Point[]>(`/api/websites/${WEBSITE_ID}/metrics`, { ...range, type: 'path', limit: 50 }),
    get<Point[]>(`/api/websites/${WEBSITE_ID}/metrics`, { ...range, type: 'referrer', limit: 8 }),
    get<Point[]>(`/api/websites/${WEBSITE_ID}/metrics`, { ...range, type: 'device', limit: 5 }),
    get<Point[]>(`/api/websites/${WEBSITE_ID}/metrics`, { ...range, type: 'browser', limit: 6 }),
    get<Point[]>(`/api/websites/${WEBSITE_ID}/metrics`, { ...range, type: 'country', limit: 8 }),
    get<Point[]>(`/api/websites/${WEBSITE_ID}/metrics`, { ...range, type: 'event', limit: 8 }),
    // `type=os` volontairement absent : « mobile / ordinateur » (device) suffit
    // à décider d'une mise en page, et le système d'exploitation n'ajoute rien
    // à cette décision. Chaque métrique demandée est un aller-retour.
  ])

  const asRows = (points: Point[]): AudienceRow[] =>
    (points ?? []).map((p) => ({ value: p.x, count: p.y }))

  /** Umami rend la période précédente dans `prev`. Absente, elle vaut zéro. */
  const prevOf = (counter: Counter | undefined) => Math.max(0, counter?.prev ?? 0)

  const pageviews = n(summary.pageviews)
  const visits = n(summary.visits)
  const totaltime = n(summary.totaltime)
  const bounces = n(summary.bounces)

  // L'administration n'est pas mesurée (le script ne s'y charge pas, et un
  // filtre annule l'envoi en navigation interne). Ce nettoyage est une seconde
  // barrière : une visite d'administration enregistrée avant la mise en place
  // du filtre ne doit pas figurer dans « pages les plus consultées ».
  const publicPages = asRows(pages).filter((p) => !p.value.startsWith('/admin'))

  return {
    configured: true,
    period,
    granularity,
    effectiveUnit: unit,
    startAt,
    endAt,
    summary: {
      pageviews,
      visitors: n(summary.visitors),
      visits,
      bounces,
      totaltime,
      previous: {
        pageviews: prevOf(summary.pageviews),
        visitors: prevOf(summary.visitors),
        visits: prevOf(summary.visits),
      },
    },
    derived: {
      // Un taux de rebond n'a de sens que s'il y a eu des visites. Sans
      // visite, l'écran affiche « — » plutôt qu'un zéro qui se lirait comme
      // « tous les visiteurs sont repartis ».
      bounceRate: visits > 0 ? Math.round((bounces / visits) * 100) : null,
      averageDuration: visits > 0 ? Math.round(totaltime / visits) : 0,
      pagesPerVisit: visits > 0 ? Math.round((pageviews / visits) * 10) / 10 : null,
    },
    series: toSeries(series, startAt, endAt, granularity),
    pages: publicPages,
    referrers: asRows(referrers),
    devices: asRows(devices),
    browsers: asRows(browsers),
    countries: asRows(countries),
    events: asRows(events),
  }
}

/** Diagnostic lisible, pour l'écran d'administration. */
export function umamiConfigurationProblem(): string | null {
  if (!BASE) return 'UMAMI_URL (ou NEXT_PUBLIC_UMAMI_URL) est absente.'
  if (!WEBSITE_ID) return 'NEXT_PUBLIC_UMAMI_WEBSITE_ID est absente.'
  if (!USERNAME) return 'UMAMI_USERNAME est absente.'
  if (!PASSWORD) return 'UMAMI_PASSWORD est absente.'
  return null
}

export { UmamiError }
