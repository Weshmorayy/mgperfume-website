import type { PerfumeProduct, ScentFamily } from '@/types';

/**
 * Recherche et facettes partagées entre la boutique et l'admin.
 *
 * Règle unique : la recherche ne dépend jamais du tri choisi. Changer l'ordre
 * d'affichage (« Nouveautés », prix croissant…) ne doit ni ajouter ni retirer
 * un seul résultat.
 */

/**
 * Minuscules sans accents, ponctuation réduite à des espaces.
 *
 * « Brûlée » et « brulee » doivent trouver le même parfum : personne ne tape
 * les accents dans la barre de recherche.
 */
export function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Champs réellement interrogeables d'un parfum, côté boutique comme côté admin. */
function searchableParts(product: PerfumeProduct): string[] {
  return [
    product.name,
    product.brand,
    product.tagline,
    product.description,
    product.categoryLabel,
    product.volume,
    product.badge,
    product.family,
    ...(product.topNotes || []),
    ...(product.heartNotes || []),
    ...(product.baseNotes || []),
  ].filter((part): part is string => typeof part === 'string' && part.length > 0);
}

// Un même produit est réinterrogé à chaque frappe : on garde son index en cache.
const indexCache = new WeakMap<PerfumeProduct, string>();

export function productSearchIndex(product: PerfumeProduct): string {
  const cached = indexCache.get(product);
  if (cached !== undefined) return cached;
  const index = normalizeText(searchableParts(product).join(' '));
  indexCache.set(product, index);
  return index;
}

/**
 * Tous les mots saisis doivent être présents (« vanille oud » ne renvoie que
 * les parfums qui portent les deux).
 */
export function matchesSearchQuery(product: PerfumeProduct, query: string): boolean {
  const tokens = normalizeText(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = productSearchIndex(product);
  return tokens.every(token => haystack.includes(token));
}

export function matchesFamily(product: PerfumeProduct, family: ScentFamily | 'all'): boolean {
  if (!family || family === 'all') return true;
  return (product.family || 'oriental') === family;
}

export function matchesBrand(product: PerfumeProduct, brand: string): boolean {
  if (!brand || brand === 'all') return true;
  return normalizeText(product.brand) === normalizeText(brand);
}

export const SCENT_FAMILIES: { id: ScentFamily; label: string }[] = [
  { id: 'all', label: 'Toutes les familles' },
  { id: 'oriental', label: 'Orientaux & Épices' },
  { id: 'gourmand', label: 'Gourmands & Sucrés' },
  { id: 'boise', label: 'Boisés & Cèdre' },
  { id: 'floral', label: 'Floraux & Fruités' },
  { id: 'aquatique', label: 'Frais & Hespéridés' },
];

/**
 * Familles réellement présentes dans le catalogue.
 *
 * Évite les filtres qui ne peuvent rien renvoyer : tant qu'aucun parfum n'est
 * classé « boise », l'onglet Boisés n'est pas proposé. Il réapparaîtra tout seul
 * dès qu'un produit sera classé ainsi.
 */
export function availableFamilies(products: PerfumeProduct[]): { id: ScentFamily; label: string }[] {
  const present = new Set(products.map(p => p.family).filter(Boolean));
  return SCENT_FAMILIES.filter(family => family.id === 'all' || present.has(family.id));
}

export interface BrandFacet {
  brand: string;
  count: number;
}

/**
 * Compteurs « Maison » calculés sur la liste déjà filtrée par la recherche et
 * la famille : les nombres suivent donc la frappe au clavier.
 *
 * Les maisons sans résultat sont masquées, sauf celle actuellement sélectionnée
 * pour que la puce active reste visible.
 */
export function brandFacets(
  products: PerfumeProduct[],
  selectedBrand: string = 'all',
  visibleLimit = 60
): { total: number; facets: BrandFacet[] } {
  // Regroupement sur la marque normalisée : la base contient des libellés qui ne
  // diffèrent que par une espace finale (« Rasasi » et « Rasasi »), ce qui
  // afficherait deux puces pour une seule maison avec des comptes séparés.
  const groups = new Map<string, BrandFacet>();
  for (const product of products) {
    const brand = (product.brand || 'MG Perfume').trim();
    const key = normalizeText(brand);
    if (!key) continue;
    const existing = groups.get(key);
    if (existing) existing.count += 1;
    else groups.set(key, { brand, count: 1 });
  }

  const selected = normalizeText(selectedBrand);
  const facets = Array.from(groups.entries())
    .map(([key, facet]) => ({ ...facet, key }))
    .filter(facet => facet.count > 0 || facet.key === selected)
    .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand, 'fr'))
    .slice(0, visibleLimit)
    .map(({ brand, count }) => ({ brand, count }));

  return { total: products.length, facets };
}
