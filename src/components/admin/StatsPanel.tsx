'use client';

/**
 * StatsPanel — Mesure d'audience de la boutique.
 *
 * ── Pourquoi ce panneau vit tout seul ─────────────────────────────────────
 * Il est posé dans l'onglet « Statistiques » du tableau de bord, à côté des
 * commandes. Il ne reçoit aucune donnée en entrée : l'admin doit pouvoir
 * ouvrir la page sans qu'un oubli de prop fasse tomber tout l'écran.
 *
 * ── D'où viennent les chiffres ────────────────────────────────────────────
 * D'Umami, auto-hébergé, lu par la route `GET /api/admin/analytics`. Cette
 * route n'existe PAS encore dans ce dépôt : le branchement Umami est reporté
 * (« on branchera les deux plus tard »). Le panneau la lit donc exactement
 * comme Continental la lira plus tard — mêmes paramètres, même forme de
 * réponse — pour que le jour où la route est déposée ici, rien d'autre ne
 * soit à toucher.
 *
 * ── Ce qui se passe tant que la route n'est pas là ────────────────────────
 * Un 404, une réponse illisible, une session absente ou une coupure réseau
 * mènent tous au même endroit : un état calme qui explique que la mesure
 * n'est pas branchée, et qui affiche à la place ce que le compteur interne
 * sait encore donner (des pages vues). Aucune exception ne remonte, aucun
 * écran blanc : un panneau secondaire n'a pas le droit d'emporter la page.
 *
 * ── Pourquoi aucun appel à Umami ici ──────────────────────────────────────
 * Le mot de passe du compte Umami doit rester sur le serveur. Le navigateur
 * n'envoie que le jeton de session Supabase de l'administrateur ; c'est la
 * route qui parle à Umami pour son compte. Ce fichier ne contient donc
 * aucun identifiant, aucun jeton de site, aucune clé d'analytics.
 *
 * ── Le compteur de repli ─────────────────────────────────────────────────
 * `lib/supabase.ts` du dépôt porte déjà la connexion publique anonyme. On la
 * réutilise telle quelle pour lire `public_traffic` : pas de seconde
 * connexion, pas de clé recopiée ici, et si la table n'existe pas la lecture
 * rend une liste vide au lieu d'une erreur.
 *
 * ── Ce que l'écran sépare, et pourquoi ───────────────────────────────────
 * L'audience n'est pas le commerce. Une visite n'est pas une vente ; les
 * mélanger donnerait un chiffre d'affaires qui n'existe nulle part. Ce
 * panneau ne traite que l'audience — les commandes et le chiffre d'affaires
 * sont déjà à leur place dans l'onglet Commandes, avec la même source.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChartColumn,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Eye,
  Globe,
  Info,
  Monitor,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ─────────────────────────── les fenêtres de temps ─────────────────────── */

/**
 * Les mêmes clés que celles attendues par la route. Elles sont recopiées ici
 * — et non importées — parce que ce dépôt n'a pas encore de `lib/periods.ts` :
 * le jour où la route arrive, elle lira ces valeurs telles quelles.
 */
type PeriodKey = '24h' | '7d' | '30d' | '90d' | '12m' | 'all';
type GranularityKey = 'hour' | 'day' | 'week' | 'month';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

const PERIODS: PeriodKey[] = ['24h', '7d', '30d', '90d', '12m', 'all'];

const PERIOD_LABEL: Record<PeriodKey, string> = {
  '24h': '24 h',
  '7d': '7 jours',
  '30d': '30 jours',
  '90d': '90 jours',
  '12m': '12 mois',
  all: 'Depuis toujours',
};

const PERIOD_MS: Record<Exclude<PeriodKey, 'all'>, number> = {
  '24h': DAY_MS,
  '7d': 7 * DAY_MS,
  '30d': 30 * DAY_MS,
  '90d': 90 * DAY_MS,
  '12m': 365 * DAY_MS,
};

/** Le découpage n'est proposé que là où il se lit : une heure sur un an est un trait. */
const GRANULARITIES_FOR: Record<PeriodKey, GranularityKey[]> = {
  '24h': ['hour', 'day'],
  '7d': ['day', 'week'],
  '30d': ['day', 'week'],
  '90d': ['day', 'week', 'month'],
  '12m': ['month', 'week'],
  all: ['month', 'week'],
};

const DEFAULT_GRANULARITY: Record<PeriodKey, GranularityKey> = {
  '24h': 'hour',
  '7d': 'day',
  '30d': 'day',
  '90d': 'day',
  '12m': 'month',
  all: 'month',
};

const GRANULARITY_LABEL: Record<GranularityKey, string> = {
  hour: 'Heure',
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
};

const GRANULARITY_PLURAL: Record<GranularityKey, string> = {
  hour: 'par heure',
  day: 'par jour',
  week: 'par semaine',
  month: 'par mois',
};

/* ─────────────────── formes renvoyées par la route (contrat) ───────────── */

interface AudiencePoint {
  key: string;
  label: string;
  date: string;
  pageviews: number;
  visitors: number;
}

interface AudienceRow {
  value: string;
  count: number;
}

interface Report {
  configured: true;
  period: PeriodKey;
  granularity: GranularityKey;
  effectiveUnit: 'hour' | 'day' | 'month';
  startAt: number;
  endAt: number;
  summary: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
    previous: { pageviews: number; visitors: number; visits: number };
  };
  derived: {
    bounceRate: number | null;
    averageDuration: number;
    pagesPerVisit: number | null;
  };
  series: AudiencePoint[];
  pages: AudienceRow[];
  referrers: AudienceRow[];
  devices: AudienceRow[];
  browsers: AudienceRow[];
  countries: AudienceRow[];
  events: AudienceRow[];
}

/* ─────────────────────── lecture défensive de la réponse ───────────────── */

/**
 * La route peut répondre trois choses : un rapport, « Umami n'est pas
 * configuré », ou une erreur. On ne fait jamais confiance à la forme reçue :
 * une réponse à moitié remplie doit produire un état calme, pas un plantage
 * au milieu du rendu.
 */
function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function optionalNum(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toRows(value: unknown): AudienceRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== 'object') return [];
    const candidate = row as { value?: unknown; count?: unknown };
    if (typeof candidate.value !== 'string') return [];
    return [{ value: candidate.value, count: num(candidate.count) }];
  });
}

function toSeries(value: unknown): AudiencePoint[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((point, index) => {
    if (!point || typeof point !== 'object') return [];
    const candidate = point as Record<string, unknown>;
    return [
      {
        key: typeof candidate.key === 'string' ? candidate.key : String(index),
        label: typeof candidate.label === 'string' ? candidate.label : '',
        date: typeof candidate.date === 'string' ? candidate.date : '',
        pageviews: num(candidate.pageviews),
        visitors: num(candidate.visitors),
      },
    ];
  });
}

/**
 * Rend `null` si la réponse ne décrit pas un vrai rapport — c'est ce `null`
 * qui déclenche l'état calme plutôt qu'un affichage de zéros, qui laisserait
 * croire à une audience nulle.
 */
function toReport(raw: unknown): Report | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const summary = data.summary;
  if (!summary || typeof summary !== 'object') return null;
  const s = summary as Record<string, unknown>;
  const previous = (s.previous && typeof s.previous === 'object' ? s.previous : {}) as Record<
    string,
    unknown
  >;
  const derived = (data.derived && typeof data.derived === 'object' ? data.derived : {}) as Record<
    string,
    unknown
  >;

  const period = PERIODS.includes(data.period as PeriodKey) ? (data.period as PeriodKey) : '30d';
  const granularity = (['hour', 'day', 'week', 'month'] as GranularityKey[]).includes(
    data.granularity as GranularityKey,
  )
    ? (data.granularity as GranularityKey)
    : DEFAULT_GRANULARITY[period];

  return {
    configured: true,
    period,
    granularity,
    effectiveUnit:
      data.effectiveUnit === 'hour' || data.effectiveUnit === 'month' ? data.effectiveUnit : 'day',
    startAt: num(data.startAt),
    endAt: num(data.endAt),
    summary: {
      pageviews: num(s.pageviews),
      visitors: num(s.visitors),
      visits: num(s.visits),
      bounces: num(s.bounces),
      totaltime: num(s.totaltime),
      previous: {
        pageviews: num(previous.pageviews),
        visitors: num(previous.visitors),
        visits: num(previous.visits),
      },
    },
    derived: {
      bounceRate: optionalNum(derived.bounceRate),
      averageDuration: num(derived.averageDuration),
      pagesPerVisit: optionalNum(derived.pagesPerVisit),
    },
    series: toSeries(data.series),
    pages: toRows(data.pages),
    referrers: toRows(data.referrers),
    devices: toRows(data.devices),
    browsers: toRows(data.browsers),
    countries: toRows(data.countries),
    events: toRows(data.events),
  };
}

/* ──────────────────────── repli : le compteur interne ──────────────────── */

interface TrafficRow {
  day: string;
  path: string;
  source: string;
  views: number;
}

/**
 * Le compteur de repli, gardé tant qu'Umami n'est pas branché.
 *
 * Les vues qu'il contient sont publiques par construction — ni IP, ni
 * identifiant, seulement un nom d'hôte de provenance. Il est lu avec la
 * connexion anonyme que le dépôt porte déjà (`lib/supabase.ts`) ; si la table
 * n'existe pas ou si le réseau tombe, on rend une liste vide et l'écran le
 * dit sans rouge.
 */
async function readTraffic(): Promise<TrafficRow[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('public_traffic')
      .select('*')
      .order('day', { ascending: true })
      .limit(2000);
    if (error || !Array.isArray(data)) return [];
    return data.flatMap((row) => {
      const r = row as Partial<TrafficRow>;
      if (typeof r.day !== 'string' || typeof r.path !== 'string') return [];
      return [
        {
          day: r.day,
          path: r.path,
          source: typeof r.source === 'string' ? r.source : 'direct',
          views: num(r.views),
        },
      ];
    });
  } catch {
    // Hors connexion : ce n'est pas une panne du portail, seulement une
    // mesure absente.
    return [];
  }
}

/* ─────────────────────────────── formats ──────────────────────────────── */

/** Une part, en pourcentage d'un total. Jamais de division par zéro. */
function share(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/** « 1 min 24 » — une durée brute en secondes ne se lit pas. */
function formatDuration(seconds: number): string {
  if (!seconds) return '0 s';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  if (minutes === 0) return `${rest} s`;
  if (minutes < 60) return `${minutes} min ${String(rest).padStart(2, '0')}`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${String(minutes % 60).padStart(2, '0')}`;
}

/**
 * Variation d'une période sur la précédente.
 *
 * `null` quand la période précédente est vide : passer de 0 à 3 n'est pas une
 * progression de 300 %, c'est un début. Afficher un pourcentage inventerait
 * une tendance.
 */
function delta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** « direct » : un nom d'hôte brut ne se lit pas. */
function sourceLabel(source: string): string {
  if (!source || source === 'direct') return 'Accès direct';
  return source;
}

/** Les URL d'Umami sont des chemins : on les laisse tels quels, mais lisibles. */
function pathLabel(path: string): string {
  return path === '/' ? 'Accueil' : path;
}

/* ──────────────────────────── briques d'écran ─────────────────────────── */

/** Surface de carte du portail : ivoire, filet doré, coins très arrondis. */
const CARD = 'rounded-3xl border border-[#E8DCC2] bg-white shadow-sm';
const LABEL = 'text-[10px] font-bold uppercase tracking-wider text-[#967120]';

function PanelCard({
  title,
  action,
  children,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DCC2] px-4 py-3.5 sm:px-5">
          <h3 className="font-luxury text-sm font-bold text-[#171513] sm:text-base">{title}</h3>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

function EmptyBlock({
  icon,
  title,
  hint,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E8DCC2] bg-[#FAF8F5] px-5 py-8 text-center">
      {icon && <div className="mx-auto mb-3 flex justify-center text-[#C59B3F]">{icon}</div>}
      <p className="text-sm font-semibold text-[#171513]">{title}</p>
      {hint && <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[#6B655E]">{hint}</p>}
    </div>
  );
}

/* ─────────────────────────────── graphique ────────────────────────────── */

interface Bucket {
  key: string;
  label: string;
  pageviews: number;
  visitors: number;
}

/**
 * Deux barres par case : pages vues (or) et visiteurs uniques (ivoire).
 *
 * Les deux mesures n'ont pas le même ordre de grandeur — une visite voit
 * souvent deux ou trois pages — mais elles se lisent l'une contre l'autre :
 * c'est l'écart entre les deux hauteurs qui dit si les visiteurs explorent la
 * boutique ou repartent après une fiche. Les deux barres sont donc
 * normalisées sur le MÊME maximum, jamais sur le leur : deux échelles
 * séparées donneraient deux séries de même hauteur et l'écart disparaîtrait.
 */
function TrafficChart({ data, label }: { data: Bucket[]; label: string }) {
  const max = Math.max(...data.map((d) => Math.max(d.pageviews, d.visitors)), 1);
  const hasAny = data.some((d) => d.pageviews > 0 || d.visitors > 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className={LABEL}>{label}</p>
        <div className="flex items-center gap-4 text-[11px] text-[#6B655E]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#C59B3F]" aria-hidden="true" />
            Pages vues
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm border border-[#E8DCC2] bg-[#F3ECE2]"
              aria-hidden="true"
            />
            Visiteurs
          </span>
        </div>
      </div>

      {!hasAny ? (
        <p className="py-10 text-center text-sm text-[#6B655E]">Aucune visite sur cette période.</p>
      ) : (
        <>
          <div className="flex h-44 items-end gap-[3px]" role="img" aria-label={label}>
            {data.map((d) => (
              <div
                key={d.key}
                className="group flex flex-1 flex-col items-center justify-end gap-[1px]"
                title={`${d.label} — ${d.pageviews} page(s) vue(s), ${d.visitors} visiteur(s)`}
              >
                <div className="flex h-full w-full items-end justify-center gap-[1px]">
                  <div
                    className="w-1/2 rounded-t bg-[#C59B3F] transition-opacity group-hover:opacity-70"
                    style={{
                      height: `${Math.max((d.pageviews / max) * 100, d.pageviews > 0 ? 3 : 0)}%`,
                    }}
                  />
                  <div
                    className="w-1/2 rounded-t border border-[#E8DCC2] bg-[#F3ECE2] transition-opacity group-hover:opacity-70"
                    style={{
                      height: `${Math.max((d.visitors / max) * 100, d.visitors > 0 ? 3 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Trois repères seulement : au-delà, l'axe devient un rideau de
              chiffres sur un téléphone. */}
          <div className="mt-2.5 flex justify-between text-[10px] text-[#9E968D]">
            <span>{data[0]?.label}</span>
            {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
            <span>{data[data.length - 1]?.label}</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────── tuiles ──────────────────────────────── */

interface Tile {
  label: string;
  value: string;
  icon: React.ElementType;
  change?: number | null;
  hint?: string;
}

/** Une variation positive ne se dit pas en vert — la palette n'en a pas. */
function ChangePill({ change }: { change: number | null }) {
  if (change === null) {
    return <span className="text-[10px] text-[#9E968D]">pas de période précédente</span>;
  }
  const positive = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
        positive
          ? 'border-[#E8DCC2] bg-[#FBF4E2] text-[#967120]'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <TrendingUp size={11} aria-hidden="true" className={positive ? '' : 'rotate-180'} />
      {positive ? '+' : ''}
      {change} %
    </span>
  );
}

function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map(({ label, value, icon: Icon, change, hint }) => (
        <div key={label} className={`${CARD} p-4`}>
          <div className="flex items-start justify-between gap-2">
            <p className={`${LABEL} leading-snug`}>{label}</p>
            <Icon size={17} strokeWidth={1.6} className="flex-shrink-0 text-[#C59B3F]" aria-hidden="true" />
          </div>
          <p
            className="font-luxury mt-2 truncate text-xl font-bold text-[#171513]"
            title={hint ?? value}
          >
            {value}
          </p>
          {change !== undefined && (
            <p className="mt-1.5">
              <ChangePill change={change} />
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Une liste classée avec sa barre de proportion. */
function RankedList({
  rows,
  total,
  empty,
  labelOf = (v: string) => v,
  limit = 8,
}: {
  rows: AudienceRow[];
  total: number;
  empty: string;
  labelOf?: (value: string) => string;
  limit?: number;
}) {
  if (rows.length === 0) return <EmptyBlock title={empty} />;
  const shown = rows.slice(0, limit);
  const max = shown[0]?.count ?? 1;

  return (
    <ul className="space-y-3">
      {shown.map((row) => (
        <li key={row.value}>
          <div className="mb-1.5 flex justify-between gap-3 text-sm">
            <span className="truncate text-[#171513]" title={row.value}>
              {labelOf(row.value)}
            </span>
            <span className="shrink-0 text-[#6B655E]">
              {row.count.toLocaleString('fr-FR')} · {share(row.count, total)} %
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#F3ECE2]">
            <div
              className="h-full rounded-full bg-[#C59B3F]"
              style={{ width: `${share(row.count, max)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ──────────────────────────────── panneau ─────────────────────────────── */

export default function StatsPanel() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [granularity, setGranularity] = useState<GranularityKey>(DEFAULT_GRANULARITY['30d']);
  const [report, setReport] = useState<Report | null>(null);
  /** Message calme expliquant pourquoi les chiffres d'audience manquent. */
  const [notice, setNotice] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [traffic, setTraffic] = useState<TrafficRow[]>([]);

  /**
   * Le jeton de session de l'administrateur.
   *
   * C'est la seule chose que le navigateur envoie : la route vérifie ensuite
   * elle-même qui parle, puis interroge Umami avec son propre compte. Aucun
   * identifiant d'analytics ne transite donc par ce fichier.
   */
  const readToken = useCallback(async (): Promise<string | null> => {
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Interroge la route et range le résultat.
   *
   * Rend `true` seulement quand un rapport exploitable est arrivé : c'est cet
   * indicateur — et non l'état React relu juste après un `setState`, qui ne
   * serait pas encore à jour — qui décide s'il faut aller chercher le
   * compteur de repli.
   */
  const loadAnalytics = useCallback(async (): Promise<boolean> => {
    const token = await readToken();
    if (!token) {
      setReport(null);
      setNotice(
        'Aucune session administrateur active : la mesure ne peut pas être lue. Reconnectez-vous puis actualisez.',
      );
      return false;
    }

    try {
      const res = await fetch(
        `/api/admin/analytics?period=${period}&granularity=${granularity}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
      );

      if (res.status === 404) {
        setReport(null);
        setNotice(
          'La route de statistiques n’est pas encore déposée sur ce site. Le branchement Umami est prévu, mais il n’a pas été fait : rien à réparer de votre côté.',
        );
        return false;
      }

      if (!res.ok) {
        // 401 / 403 / 500 / 502 : la route existe mais refuse ou n'a pas pu
        // répondre. On nomme le code plutôt qu'un « erreur de chargement » qui
        // obligerait à ouvrir les journaux pour deviner.
        let message = `La mesure a répondu ${res.status}.`;
        try {
          const body = (await res.json()) as { error?: unknown; problem?: unknown };
          if (typeof body?.error === 'string' && body.error) message = body.error;
          else if (typeof body?.problem === 'string' && body.problem) message = body.problem;
        } catch {
          // Corps illisible : le code suffit.
        }
        setReport(null);
        setNotice(message);
        return false;
      }

      let payload: unknown;
      try {
        payload = await res.json();
      } catch {
        setReport(null);
        setNotice('La mesure a répondu dans un format illisible. Les chiffres d’audience sont indisponibles.');
        return false;
      }

      if (payload && typeof payload === 'object') {
        const body = payload as Record<string, unknown>;
        if (typeof body.error === 'string' && body.error) {
          setReport(null);
          setNotice(body.error);
          return false;
        }
        if (body.configured === false) {
          setReport(null);
          setNotice(
            typeof body.problem === 'string' && body.problem
              ? body.problem
              : 'La mesure d’audience n’est pas configurée sur ce site.',
          );
          return false;
        }
      }

      const parsed = toReport(payload);
      if (!parsed) {
        setReport(null);
        setNotice(
          'La mesure a répondu sans les chiffres attendus. Les totaux de la période n’ont pas pu être reconstitués, et on préfère ne rien afficher plutôt qu’un zéro trompeur.',
        );
        return false;
      }

      setReport(parsed);
      setNotice('');
      return true;
    } catch {
      // Réseau coupé, serveur éteint, requête refusée : jamais d'exception
      // laissée remonter jusqu'à la page.
      setReport(null);
      setNotice(
        'La mesure d’audience est injoignable. Vérifiez la connexion ; les commandes de l’onglet voisin restent intactes.',
      );
      return false;
    }
  }, [period, granularity, readToken]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const ok = await loadAnalytics();
      // Le compteur interne ne sert que s'il sert : quand la mesure répond,
      // il n'apporte rien et coûte une requête de plus.
      if (!ok) setTraffic(await readTraffic());
    } catch {
      setTraffic([]);
    } finally {
      setBusy(false);
    }
  }, [loadAnalytics]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Changer de période peut rendre le découpage courant impossible : l'heure
   * n'a pas de sens sur douze mois. On retombe alors sur le découpage par
   * défaut de la période choisie.
   */
  useEffect(() => {
    if (!GRANULARITIES_FOR[period].includes(granularity)) {
      setGranularity(DEFAULT_GRANULARITY[period]);
    }
  }, [period, granularity]);

  /* ── audience ──────────────────────────────────────────────────────────── */

  const summary = report?.summary;
  const derived = report?.derived;
  const series: Bucket[] = report?.series ?? [];

  const visitors = summary?.visitors ?? 0;
  const pageviews = summary?.pageviews ?? 0;
  const visits = summary?.visits ?? 0;

  const tiles: Tile[] = [
    {
      label: 'Visiteurs uniques',
      value: visitors.toLocaleString('fr-FR'),
      icon: Users,
      change: delta(visitors, summary?.previous.visitors ?? 0),
    },
    {
      label: 'Visites',
      value: visits.toLocaleString('fr-FR'),
      icon: MousePointerClick,
      change: delta(visits, summary?.previous.visits ?? 0),
    },
    {
      label: 'Pages vues',
      value: pageviews.toLocaleString('fr-FR'),
      icon: Eye,
      change: delta(pageviews, summary?.previous.pageviews ?? 0),
    },
    {
      label: 'Pages par visite',
      value: derived?.pagesPerVisit == null ? '—' : String(derived.pagesPerVisit),
      icon: ChartColumn,
    },
    {
      label: 'Durée moyenne',
      value: formatDuration(derived?.averageDuration ?? 0),
      icon: Clock,
    },
    {
      label: 'Taux de rebond',
      value: derived?.bounceRate == null ? '—' : `${derived.bounceRate} %`,
      icon: Compass,
      hint: 'Part des visiteurs repartis après une seule page.',
    },
  ];

  /* ── repli sans Umami : les chiffres du compteur interne ──────────────── */

  /** Début de la période, en millisecondes. `null` = « depuis toujours ». */
  const periodStart = useMemo(() => {
    if (period === 'all') return null;
    return Date.now() - PERIOD_MS[period];
  }, [period]);

  const fallbackDaily = useMemo(() => {
    const sum = new Map<string, number>();
    for (const t of traffic) sum.set(t.day, (sum.get(t.day) ?? 0) + t.views);
    const days: Bucket[] = [];
    const cursor = new Date();
    cursor.setUTCDate(cursor.getUTCDate() - 29);
    for (let i = 0; i < 30; i++) {
      const key = cursor.toISOString().slice(0, 10);
      const [, m, d] = key.split('-');
      days.push({ key, label: `${d}/${m}`, pageviews: sum.get(key) ?? 0, visitors: 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }, [traffic]);

  const fallbackTotal = fallbackDaily.reduce((s, d) => s + d.pageviews, 0);

  /** Les lignes du compteur, ramenées à la fenêtre choisie. */
  const trafficInPeriod = useMemo(() => {
    if (periodStart === null) return traffic;
    const floor = new Date(periodStart).toISOString().slice(0, 10);
    return traffic.filter((t) => t.day >= floor);
  }, [traffic, periodStart]);

  const fallbackPages = useMemo(() => {
    const sum = new Map<string, number>();
    for (const t of trafficInPeriod) sum.set(t.path, (sum.get(t.path) ?? 0) + t.views);
    return Array.from(sum.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [trafficInPeriod]);

  const fallbackSources = useMemo(() => {
    const sum = new Map<string, number>();
    for (const t of trafficInPeriod) sum.set(t.source, (sum.get(t.source) ?? 0) + t.views);
    return Array.from(sum.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [trafficInPeriod]);

  const fallbackTotalInPeriod = fallbackPages.reduce((s, r) => s + r.count, 0);

  const eventsTotal = report?.events.reduce((s, e) => s + e.count, 0) ?? 0;

  /* ── rendu ────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-4">
      {/* ── barre d'outils : période, découpage, actualisation ── */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                period === p
                  ? 'border-[#C59B3F] bg-[#171513] text-[#F3E5AB]'
                  : 'border-[#E8DCC2] bg-white text-[#6B655E] hover:border-[#C59B3F] hover:text-[#967120]'
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Le découpage ne s'affiche que s'il y a un choix réel : un seul
              bouton n'est pas un choix. */}
          {GRANULARITIES_FOR[period].length > 1 && (
            <div className="flex items-center gap-2">
              <span className={LABEL}>Découpage</span>
              <div className="flex overflow-hidden rounded-full border border-[#E8DCC2] bg-white">
                {GRANULARITIES_FOR[period].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGranularity(g)}
                    aria-pressed={granularity === g}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      granularity === g
                        ? 'bg-[#171513] text-[#F3E5AB]'
                        : 'bg-white text-[#6B655E] hover:text-[#967120]'
                    }`}
                  >
                    {GRANULARITY_LABEL[g]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => void load()}
            aria-label="Actualiser"
            className="inline-flex items-center gap-2 rounded-full bg-[#171513] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#C59B3F]"
          >
            <RefreshCw size={13} className={busy ? 'animate-spin' : ''} aria-hidden="true" />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── mesure indisponible : on dit pourquoi, calmement ── */}
      {notice && (
        <PanelCard>
          <div className="flex items-start gap-3 p-5">
            <Info size={18} className="mt-0.5 flex-shrink-0 text-[#C59B3F]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-luxury text-sm font-bold text-[#171513]">
                Statistiques pas encore branchées
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B655E]">{notice}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#6B655E]">
                En attendant, le compteur interne dit seulement des pages vues : ni visiteurs
                uniques, ni durée, ni appareil, ni pays. Les commandes et le chiffre d’affaires,
                eux, se lisent dans l’onglet Commandes et ne dépendent pas de cette mesure.
              </p>
            </div>
          </div>
        </PanelCard>
      )}

      {/* ══════════════════════════ AUDIENCE ══════════════════════════ */}

      <div className="flex flex-wrap items-baseline justify-between gap-3 pt-1">
        <h2 className="font-luxury text-sm font-bold uppercase tracking-wider text-[#171513]">
          Audience
        </h2>
        <span className="text-[11px] text-[#6B655E]">
          {report
            ? `Découpage ${GRANULARITY_PLURAL[granularity].replace('par ', '')} · ${PERIOD_LABEL[period]}`
            : `Compteur interne · ${PERIOD_LABEL[period]}`}
        </span>
      </div>

      {report && <TileGrid tiles={tiles} />}

      <PanelCard>
        <div className="p-5">
          {report ? (
            <>
              <TrafficChart data={series} label={`Trafic ${GRANULARITY_PLURAL[granularity]}`} />
              <button
                type="button"
                onClick={() => setShowTable((v) => !v)}
                aria-expanded={showTable}
                className="mt-5 flex w-full items-center justify-center gap-1.5 border-t border-[#E8DCC2] pt-4 text-xs font-bold text-[#967120] transition-colors hover:text-[#171513]"
              >
                {showTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showTable ? 'Masquer le détail' : `Afficher le détail (${series.length} lignes)`}
              </button>
              {showTable && (
                <div className="mt-4 max-h-80 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-[#E8DCC2] text-left">
                        <th className="py-2 pr-3">
                          <span className={LABEL}>{GRANULARITY_LABEL[granularity]}</span>
                        </th>
                        <th className="py-2 pr-3 text-right">
                          <span className={LABEL}>Pages vues</span>
                        </th>
                        <th className="py-2 text-right">
                          <span className={LABEL}>Visiteurs</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {series.map((point) => (
                        <tr key={point.key} className="border-b border-[#E8DCC2]/60 last:border-0">
                          <td className="py-1.5 pr-3 text-[#171513]">{point.label}</td>
                          <td className="py-1.5 pr-3 text-right tabular-nums text-[#171513]">
                            {point.pageviews.toLocaleString('fr-FR')}
                          </td>
                          <td className="py-1.5 text-right tabular-nums text-[#6B655E]">
                            {point.visitors.toLocaleString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : fallbackTotal > 0 ? (
            <TrafficChart data={fallbackDaily} label="Pages vues par jour — 30 derniers jours" />
          ) : (
            <EmptyBlock
              icon={<Users size={30} strokeWidth={1.4} />}
              title="Aucune visite enregistrée"
              hint="La mesure se remplira dès qu’Umami sera branché. Le compteur interne, lui, ne compte que des visites publiques : l’administration est exclue."
            />
          )}
        </div>
      </PanelCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Pages les plus consultées">
          <div className="p-5">
            <RankedList
              rows={report ? report.pages : fallbackPages}
              total={report ? pageviews : fallbackTotalInPeriod}
              empty="Aucune page consultée"
              labelOf={pathLabel}
            />
          </div>
        </PanelCard>

        <PanelCard title="Sources de trafic">
          <div className="p-5">
            <RankedList
              rows={report ? report.referrers : fallbackSources}
              total={report ? visitors : fallbackTotalInPeriod}
              empty="Aucune source identifiée"
              labelOf={sourceLabel}
            />
          </div>
        </PanelCard>
      </div>

      {report && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <PanelCard
              title="Appareils"
              action={<Monitor size={15} className="text-[#C59B3F]" aria-hidden="true" />}
            >
              <div className="p-5">
                <RankedList rows={report.devices} total={visitors} empty="Aucun appareil identifié" />
              </div>
            </PanelCard>
            <PanelCard
              title="Navigateurs"
              action={<Compass size={15} className="text-[#C59B3F]" aria-hidden="true" />}
            >
              <div className="p-5">
                <RankedList
                  rows={report.browsers}
                  total={visitors}
                  empty="Aucun navigateur identifié"
                />
              </div>
            </PanelCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PanelCard
              title="Pays"
              action={<Globe size={15} className="text-[#C59B3F]" aria-hidden="true" />}
            >
              <div className="p-5">
                <RankedList rows={report.countries} total={visitors} empty="Aucun pays identifié" />
              </div>
            </PanelCard>

            {/* Les actions suivies n'apparaissent que s'il y en a : une carte
                vide en permanence apprendrait à ignorer la section. */}
            {report.events.length > 0 && (
              <PanelCard title="Actions suivies">
                <div className="p-5">
                  <RankedList
                    rows={report.events}
                    total={eventsTotal}
                    empty="Aucune action enregistrée"
                    limit={6}
                  />
                </div>
              </PanelCard>
            )}

            {/* Sans Umami, la colonne reste tenue par un rappel plutôt que par
                un vide : un écran à demi rempli fait douter du reste. */}
            {report.events.length === 0 && (
              <PanelCard title="Actions suivies">
                <div className="p-5">
                  <EmptyBlock
                    icon={<TriangleAlert size={26} strokeWidth={1.4} />}
                    title="Aucune action enregistrée"
                    hint="Les clics suivis — ajout au panier, ouverture d’une fiche — apparaîtront ici dès que la mesure sera branchée."
                  />
                </div>
              </PanelCard>
            )}
          </div>
        </>
      )}
    </div>
  );
}
