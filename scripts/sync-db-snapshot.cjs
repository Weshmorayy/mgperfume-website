#!/usr/bin/env node
/**
 * sync-db-snapshot.cjs
 * ---------------------------------------------------------------------------
 * Écrit un INSTANTANÉ complet de la base dans `data/DATABASE_SYNCED.json`.
 *
 * À ne pas confondre avec `data/DATABASE_TRACKER.json` :
 *
 *   DATABASE_TRACKER.json — journal local des modifications. C'est lui qui porte
 *     l'historique du travail (produits intégrés, corrections, lots successifs).
 *     Il peut légitimement contenir des produits absents de la base, parce qu'ils
 *     ont été retirés depuis l'admin. NE JAMAIS le réécrire depuis la base :
 *     c'est exactement ce qui a effacé 19 lignes de suivi par le passé.
 *
 *   DATABASE_SYNCED.json — copie fidèle de la base à un instant donné, toutes
 *     colonnes. Fichier généré : ne pas éditer à la main.
 *
 * Ce script ne fait que LIRE la base. Il n'écrit jamais dedans.
 *
 * Usage :
 *   node scripts/sync-db-snapshot.cjs --check   (compare seulement)
 *   node scripts/sync-db-snapshot.cjs           (réécrit l'instantané)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CHECK_ONLY = process.argv.includes('--check');

const PROJECT = '/data/data/com.termux/files/home/atelier/mgperfume-website';
const SNAPSHOT = path.join(PROJECT, 'data/DATABASE_SYNCED.json');
const SUPABASE_HOST = 'xnmolqmcfnjvcblizahu.supabase.co';
const TABLE = 'products';

const envPath = path.join(PROJECT, '.env.local');
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) envVars[m[1].trim()] = m[2].trim();
  });
}
const API_KEY =
  envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW9scW1jZm5qdmNibGl6YWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MzU4NjQsImV4cCI6MjEwNDUxMTg2NH0._KRQCSn_gAopANWDE-SdMCGmXBYLvD8pNyCTSqy8bRE';

// Toutes les colonnes de la table, dans un ordre stable pour que le diff Git
// reste lisible. À garder aligné avec le schéma.
const KEYS = [
  'id', 'name', 'brand', 'tagline', 'price', 'original_price', 'volume', 'image',
  'family', 'category_label', 'badge', 'top_notes', 'heart_notes', 'base_notes',
  'description', 'is_popular', 'in_stock', 'created_at', 'updated_at', 'is_hero',
  'is_archived', 'free_delivery',
];

function fetchAll() {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: SUPABASE_HOST,
        path: `/rest/v1/${TABLE}?select=*&order=created_at.asc`,
        method: 'GET',
        headers: { Authorization: `Bearer ${API_KEY}`, apikey: API_KEY },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          resolve(JSON.parse(data));
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function toSnapshotRow(row) {
  const out = {};
  for (const k of KEYS) {
    if (k === 'tagline' || k === 'description') out[k] = row[k] || '';
    else if (k.endsWith('_notes')) out[k] = row[k] || [];
    else out[k] = row[k] === undefined ? null : row[k];
  }
  return out;
}

(async () => {
  const db = await fetchAll();
  const snapshot = db.map(toSnapshotRow);
  const prev = fs.existsSync(SNAPSHOT) ? JSON.parse(fs.readFileSync(SNAPSHOT, 'utf-8')) : [];

  const dbIds = new Set(snapshot.map((r) => r.id));
  const prevIds = new Set(prev.map((r) => r.id));
  const added = snapshot.filter((r) => !prevIds.has(r.id));
  const removed = prev.filter((r) => !dbIds.has(r.id));
  const active = snapshot.filter((r) => !r.is_archived).length;

  console.log(`base : ${snapshot.length} lignes (${active} actives / ${snapshot.length - active} archivées)`);
  if (prev.length) console.log(`instantané précédent : ${prev.length} lignes`);
  console.log(`  + nouvelles en base : ${added.length}`);
  console.log(`  - disparues de la base : ${removed.length}`);
  removed.slice(0, 15).forEach((r) => console.log(`      - ${r.id} | ${r.name}`));

  if (CHECK_ONLY) {
    console.log('\n--check : aucune écriture.');
    return;
  }
  fs.writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`\n✓ instantané écrit : ${snapshot.length} lignes -> data/DATABASE_SYNCED.json`);
})().catch((e) => {
  console.error('✗ ÉCHEC :', e.message);
  process.exit(1);
});
