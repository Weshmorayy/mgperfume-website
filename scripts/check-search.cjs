#!/usr/bin/env node
/**
 * check-search.cjs
 * ---------------------------------------------------------------------------
 * Vérifie le moteur de recherche partagé (src/lib/productSearch.ts) sur
 * l'instantané réel de la base (`data/DATABASE_SYNCED.json`). Aucune écriture,
 * aucun accès réseau.
 *
 * Contrôles :
 *   1. changer de tri ne change JAMAIS l'ensemble des résultats ;
 *   2. aucun filtre proposé ne peut renvoyer zéro résultat ;
 *   3. les compteurs « Maison » correspondent aux résultats et suivent la recherche ;
 *   4. la recherche couvre bien les notes, pas seulement le nom.
 *
 * Usage : node scripts/check-search.cjs
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const PROJECT = '/data/data/com.termux/files/home/atelier/mgperfume-website';
const SNAPSHOT = path.join(PROJECT, 'data/DATABASE_SYNCED.json');

/** Charge un module TypeScript de src/lib sans étape de build. */
function loadTsModule(relativePath) {
  const source = fs.readFileSync(path.join(PROJECT, relativePath), 'utf-8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const m = new Module(relativePath, null);
  m.filename = path.join(PROJECT, relativePath.replace(/\.ts$/, '.js'));
  m.paths = Module._nodeModulePaths(PROJECT);
  m._compile(js, m.filename);
  return m.exports;
}

// Même transposition que mapDbProduct() dans StoreContext.
function mapDbProduct(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || 'MG Perfume',
    tagline: row.tagline || '',
    price: Number(row.price),
    volume: row.volume || '100 ml',
    image: row.image,
    family: row.family || 'oriental',
    categoryLabel: row.category_label || 'Eau de Parfum',
    badge: row.badge || undefined,
    topNotes: Array.isArray(row.top_notes) ? row.top_notes : [],
    heartNotes: Array.isArray(row.heart_notes) ? row.heart_notes : [],
    baseNotes: Array.isArray(row.base_notes) ? row.base_notes : [],
    description: row.description || '',
    isArchived: Boolean(row.is_archived),
    createdAt: row.created_at || undefined,
  };
}

const { availableFamilies, brandFacets, matchesBrand, matchesFamily, matchesSearchQuery } =
  loadTsModule('src/lib/productSearch.ts');
const { sortNewestFirst, compareNewestFirst } = loadTsModule('src/lib/productSort.ts');

const products = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf-8'))
  .map(mapDbProduct)
  .filter(p => !p.isArchived); // la boutique ne montre que les produits actifs

const SORTS = {
  Nouveautés: list => sortNewestFirst(list),
  'Prix croissant': list => [...list].sort((a, b) => a.price - b.price),
  'Prix décroissant': list => [...list].sort((a, b) => b.price - a.price),
};

const QUERIES = [
  '', 'vanille', 'vanilla', 'oud', 'musc', 'ambre', '9pm', 'lattafa',
  'brûlée', 'brulee', 'fleur d\'oranger', 'khair', 'eau de parfum', '30 ml',
  'zzz-introuvable',
];

let failures = 0;
const fail = msg => { failures++; console.log(`  ✗ ${msg}`); };
const pass = msg => console.log(`  ✓ ${msg}`);

console.log(`Recherche — ${products.length} produits actifs dans l'instantané\n`);

// 1. Parité des tris + 2. les notes sont bien fouillées
console.log('1. L\'ensemble des résultats ne dépend pas du tri');
for (const query of QUERIES) {
  const matched = products.filter(p => matchesSearchQuery(p, query));
  const sets = Object.entries(SORTS).map(([label, sort]) => ({
    label,
    ids: sort(matched).map(p => p.id).sort().join('|'),
  }));
  const reference = sets[0];
  const divergent = sets.filter(s => s.ids !== reference.ids);
  const label = query === '' ? '(aucune recherche)' : `« ${query} »`;
  if (divergent.length) {
    fail(`${label} : ${divergent.map(d => d.label).join(', ')} ne renvoie pas le même ensemble`);
  } else {
    pass(`${label} : ${matched.length} résultat(s), identiques dans les ${sets.length} tris`);
  }
}

// 3. Aucun filtre offert ne peut être vide
console.log('\n2. Chaque filtre proposé renvoie au moins un produit');
const families = availableFamilies(products);
for (const family of families) {
  if (family.id === 'all') continue;
  const count = products.filter(p => matchesFamily(p, family.id)).length;
  if (count === 0) fail(`famille « ${family.label} » (${family.id}) proposée mais vide`);
  else pass(`famille « ${family.label} » : ${count} produit(s)`);
}
const offeredFamilies = families.map(f => f.id);
const deadFamilies = ['oriental', 'gourmand', 'boise', 'floral', 'aquatique']
  .filter(f => !offeredFamilies.includes(f) && products.some(p => p.family === f));
if (deadFamilies.length) fail(`famille(s) présente(s) en base mais absente(s) du filtre : ${deadFamilies.join(', ')}`);
else pass('aucune famille présente en base n\'est oubliée');

// 4. Compteurs Maison : exacts, et sensibles à la recherche
console.log('\n3. Compteurs « Maison »');
const { total: totalAll, facets: facetsAll } = brandFacets(products, 'all');
if (totalAll !== products.length) fail(`total global ${totalAll} ≠ ${products.length}`);
else pass(`total global : ${totalAll}`);
const badFacet = facetsAll.find(({ brand, count }) =>
  products.filter(p => matchesBrand(p, brand)).length !== count
);
if (badFacet) fail(`compteur faux pour ${badFacet.brand} : ${badFacet.count}`);
else pass(`${facetsAll.length} maisons, chaque compteur vérifié`);

const searchTerm = 'vanille';
const searched = products.filter(p => matchesSearchQuery(p, searchTerm));
const { total: totalSearched, facets: facetsSearched } = brandFacets(searched, 'all');
if (totalSearched >= totalAll) fail(`« ${searchTerm} » ne réduit pas le total (${totalSearched})`);
else pass(`« ${searchTerm} » : total ${totalAll} → ${totalSearched}, ${facetsAll.length} → ${facetsSearched.length} maisons`);
if (facetsSearched.some(f => f.count === 0)) fail('un compteur à zéro est encore affiché');
else pass('aucune maison affichée avec un compteur à zéro');

// 5. La recherche couvre les notes, pas seulement le nom
console.log('\n4. La recherche fouille les notes');
const noteOnly = products.filter(p => {
  const inName = String(p.name).toLowerCase().includes('fleur d\'oranger');
  const inNotes = [...p.topNotes, ...p.heartNotes, ...p.baseNotes]
    .some(n => String(n).toLowerCase().includes('fleur d\'oranger'));
  return !inName && inNotes;
});
if (noteOnly.length === 0) fail('aucun produit trouvé uniquement par ses notes');
else {
  const found = noteOnly.filter(p => matchesSearchQuery(p, 'fleur d\'oranger')).length;
  if (found !== noteOnly.length) fail(`${found}/${noteOnly.length} produits trouvés par leurs notes`);
  else pass(`${found} produit(s) trouvés uniquement via leurs notes`);
}

console.log(failures === 0 ? '\n✓ Tous les contrôles passent.' : `\n✗ ${failures} contrôle(s) en échec.`);
process.exit(failures === 0 ? 0 : 1);
