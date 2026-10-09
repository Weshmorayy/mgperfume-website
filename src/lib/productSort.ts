import type { PerfumeProduct } from '@/types';

/**
 * Tri « nouveautés d'abord » : le produit le plus récent en tête.
 *
 * Utilisé à la fois par la boutique et par l'admin pour que les deux listes
 * présentent les produits dans le même ordre.
 *
 * `Array.prototype.sort` est stable : un produit sans date connue renvoie 0 et
 * garde donc sa position d'origine, à la suite des produits datés.
 */
export function compareNewestFirst(a: PerfumeProduct, b: PerfumeProduct): number {
  const aTime = a.createdAt ? Date.parse(a.createdAt) : NaN;
  const bTime = b.createdAt ? Date.parse(b.createdAt) : NaN;
  const aUndated = Number.isNaN(aTime);
  const bUndated = Number.isNaN(bTime);

  if (aUndated && bUndated) return 0;
  if (aUndated) return 1;
  if (bUndated) return -1;
  return bTime - aTime;
}

/** Copie triée du tableau, du plus récent au plus ancien. */
export function sortNewestFirst(products: PerfumeProduct[]): PerfumeProduct[] {
  return [...products].sort(compareNewestFirst);
}