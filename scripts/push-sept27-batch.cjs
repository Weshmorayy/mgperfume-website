#!/usr/bin/env node
/**
 * push-sept27-batch.cjs
 * ---------------------------------------------------------------------------
 * Batch « New-sept-27th » — MG Perfume
 *
 * Source de vérité :
 *   - 26 packshots officiels  : Documents/Clients/MG Perfume/Stock-Images/New-sept-27th/Products/
 *   - 9 captures Facebook     : Documents/Clients/MG Perfume/Stock-Images/New-sept-27th/Social-screenshots/
 *     (sources d'INFORMATION uniquement — jamais publiées comme visuels produits)
 *
 * Le script :
 *   1. uploade chaque packshot dans le bucket Storage « products » sous <id>.jpg
 *   2. uploade l'image de remplacement « image-a-venir.jpg » pour les 2 produits
 *      dont le client n'a pas encore fourni de visuel
 *   3. upsert les lignes produits (on_conflict=id, merge-duplicates)
 *
 * Usage :
 *   node scripts/push-sept27-batch.cjs --dry     (simulation, aucune écriture)
 *   node scripts/push-sept27-batch.cjs           (upload + upsert)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DRY = process.argv.includes('--dry');

const PROJECT = '/data/data/com.termux/files/home/atelier/mgperfume-website';
const CLIENT_DIR =
  '/data/data/com.termux/files/home/storage/shared/Documents/Clients/MG Perfume/Stock-Images/New-sept-27th/Products';
const PLACEHOLDER = '/data/data/com.termux/files/home/atelier/.ops/mg-sept27/placeholder-image-a-venir.jpg';
const PLACEHOLDER_REMOTE = 'image-a-venir.jpg';

const SUPABASE_HOST = 'xnmolqmcfnjvcblizahu.supabase.co';
const SUPABASE_URL = `https://${SUPABASE_HOST}`;
const BUCKET = 'products';

// .env.local prioritaire, sinon repli sur la clé anon publique (RLS USING(true))
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

const records = JSON.parse(fs.readFileSync(path.join(PROJECT, 'data/batch-sept27-products.json'), 'utf-8'));

function request(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function uploadImage(localAbsPath, remoteName) {
  if (!fs.existsSync(localAbsPath)) {
    console.log(`   ⚠️  fichier absent : ${localAbsPath}`);
    return null;
  }
  const fileData = fs.readFileSync(localAbsPath);
  if (DRY) {
    console.log(`   [dry] upload ${remoteName} (${(fileData.length / 1024).toFixed(0)} Ko)`);
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remoteName}`;
  }
  const res = await request(
    {
      hostname: SUPABASE_HOST,
      path: `/storage/v1/object/${BUCKET}/${remoteName}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY,
        'Content-Type': 'image/jpeg',
        'Content-Length': fileData.length,
        'x-upsert': 'true',
      },
    },
    fileData
  );
  if (res.status === 200 || res.status === 201) {
    console.log(`   ✓ storage/${remoteName} (${(fileData.length / 1024).toFixed(0)} Ko)`);
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remoteName}`;
  }
  console.log(`   ✗ upload ${remoteName} → HTTP ${res.status} ${res.body.slice(0, 200)}`);
  return null;
}

async function upsertRows(rows) {
  const body = JSON.stringify(rows);
  if (DRY) {
    console.log(`\n[dry] ${rows.length} lignes prêtes pour upsert (aucune écriture).`);
    return true;
  }
  const res = await request(
    {
      hostname: SUPABASE_HOST,
      path: '/rest/v1/products?on_conflict=id',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        apikey: API_KEY,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body
  );
  if (res.status === 200 || res.status === 201 || res.status === 204) {
    console.log(`\n✓ Upsert réussi : ${rows.length} lignes.`);
    return true;
  }
  throw new Error(`DB error (${res.status}) : ${res.body}`);
}

(async () => {
  console.log(`=== Batch New-sept-27th ${DRY ? '(SIMULATION)' : ''} ===\n`);

  // 1. Image de remplacement
  const placeholderUrl = await uploadImage(PLACEHOLDER, PLACEHOLDER_REMOTE);

  const rows = [];
  const missingImageUploads = [];

  for (const r of records) {
    let imageUrl;
    if (r.source_image) {
      const remoteName = `${r.id}.jpg`;
      imageUrl = await uploadImage(path.join(CLIENT_DIR, r.source_image), remoteName);
      if (!imageUrl) missingImageUploads.push(r.id);
    } else {
      imageUrl = placeholderUrl;
    }
    if (!imageUrl) {
      // Ne jamais écrire une ligne sans visuel exploitable.
      console.log(`   ⚠️  ${r.id} ignoré (aucun visuel disponible)`);
      continue;
    }

    rows.push({
      id: r.id,
      name: r.name,
      brand: r.brand,
      tagline: r.tagline || '',
      price: r.price,
      volume: r.volume,
      image: imageUrl,
      family: r.family,
      category_label: r.category_label,
      badge: r.badge || null,
      top_notes: r.top_notes || [],
      heart_notes: r.heart_notes || [],
      base_notes: r.base_notes || [],
      description: r.description || '',
      in_stock: true,
      is_archived: !!r.is_archived,
      free_delivery: !!r.free_delivery,
      is_popular: false,
      is_hero: false,
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`\n--- ${rows.length} lignes construites / ${records.length} en entrée ---`);
  const newOnes = records.filter((r) => !r._update).length;
  console.log(`   nouveaux produits : ${newOnes}`);
  console.log(`   mises à jour      : ${records.length - newOnes}`);
  console.log(`   archivés          : ${rows.filter((r) => r.is_archived).length}`);
  console.log(`   publiés           : ${rows.filter((r) => !r.is_archived).length}`);
  if (missingImageUploads.length) {
    console.log(`   ⚠️  uploads échoués : ${missingImageUploads.join(', ')}`);
  }

  await upsertRows(rows);
})().catch((e) => {
  console.error('\n✗ ÉCHEC :', e.message);
  process.exit(1);
});
