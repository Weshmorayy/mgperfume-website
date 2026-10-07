#!/usr/bin/env node
/**
 * sync-tracker-from-db.cjs
 * ---------------------------------------------------------------------------
 * La BASE est la source de vérité. Le tracker local n'est qu'un miroir.
 *
 * Des modifications sont faites régulièrement depuis le portail d'administration
 * (prix, archivage, suppression, visuels). Le tracker en fichier peut donc être
 * en retard ou contenir des produits qui n'existent plus. Ce script réécrit
 * `data/DATABASE_TRACKER.json` à partir de la base, sans jamais écrire en base.
 *
 * Usage :
 *   node scripts/sync-tracker-from-db.cjs --check   (compare seulement)
 *   node scripts/sync-tracker-from-db.cjs           (réécrit le tracker)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CHECK_ONLY = process.argv.includes('--check');

const PROJECT = '/data/data/com.termux/files/home/atelier/mgperfume-website';
const TRACKER = path.join(PROJECT, 'data/DATABASE_TRACKER.json');
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

// Ordre des clés identique à celui du tracker existant.
const KEYS = [
  'id', 'name', 'brand', 'price', 'image', 'volume', 'is_archived',
  'free_delivery', 'in_stock', 'created_at', 'tagline', 'description',
  'top_notes', 'heart_notes', 'base_notes',
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

function toTrackerRow(row) {
  const out = {};
  for (const k of KEYS) {
    if (k === 'tagline' || k === 'description') out[k] = row[k] || '';
    else if (k.endsWith('_notes')) out[k] = row[k] || [];
    else out[k] = row[k];
  }
  return out;
}

(async () => {
  const db = await fetchAll();
  const mirror = db.map(toTrackerRow);
  const prev = fs.existsSync(TRACKER) ? JSON.parse(fs.readFileSync(TRACKER, 'utf-8')) : [];

  const dbIds = new Set(mirror.map((r) => r.id));
  const prevIds = new Set(prev.map((r) => r.id));
  const orphans = prev.filter((r) => !dbIds.has(r.id));
  const missing = mirror.filter((r) => !prevIds.has(r.id));

  console.log(`base : ${mirror.length} lignes | tracker : ${prev.length} lignes`);
  console.log(`  + dans la base seulement : ${missing.length}`);
  console.log(`  - dans le tracker seulement (supprimés via l'admin) : ${orphans.length}`);
  orphans.slice(0, 15).forEach((r) => console.log(`      - ${r.id} | ${r.name}`));

  if (CHECK_ONLY) {
    console.log('\n--check : aucune écriture.');
    return;
  }
  fs.writeFileSync(TRACKER, JSON.stringify(mirror, null, 2) + '\n');
  console.log(`\n✓ tracker réécrit depuis la base : ${mirror.length} lignes.`);
})().catch((e) => {
  console.error('✗ ÉCHEC :', e.message);
  process.exit(1);
});