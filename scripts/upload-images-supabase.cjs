#!/usr/bin/env node

/**
 * MG PERFUME — Upload des images produit vers Supabase Storage
 * 
 * Usage:
 *   node scripts/upload-images-supabase.cjs
 * 
 * Pré-requis:
 *   - data/images/ doit contenir les images téléchargées
 *   - .env.local avec SUPABASE_SERVICE_ROLE_KEY
 * 
 * Output:
 *   data/image_upload_map.json  → { filename → supabase_public_url }
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
  });
}

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL'];
// Storage API requires JWT format — use anon key (policies allow full access)
const SERVICE_KEY = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const BUCKET = 'products';  // Nom du bucket Supabase Storage
const IMAGES_DIR = path.join(__dirname, '../data/images');
const OUTPUT_MAP = path.join(__dirname, '../data/image_upload_map.json');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('☁️  MG PERFUME — UPLOAD IMAGES → SUPABASE STORAGE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📁 Source  : ${IMAGES_DIR}`);
console.log(`🪣  Bucket  : ${BUCKET}`);
console.log(`🌐 Supabase: ${SUPABASE_URL}`);

function uploadToStorage(filePath, storagePath) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const parsed = new URL(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`);

    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'image/jpeg',
        'Content-Length': fileData.length,
        'x-upsert': 'true'   // remplace si existe déjà
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
          resolve(publicUrl);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(fileData);
    req.end();
  });
}

async function checkBucketExists() {
  return new Promise((resolve) => {
    const parsed = new URL(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${SERVICE_KEY}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(res.statusCode === 200));
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function main() {
  // Charger le map existant si présent (pour reprendre en cas d'interruption)
  let uploadMap = {};
  if (fs.existsSync(OUTPUT_MAP)) {
    uploadMap = JSON.parse(fs.readFileSync(OUTPUT_MAP, 'utf-8'));
    console.log(`\n♻️  Reprise — ${Object.keys(uploadMap).length} images déjà uploadées\n`);
  }

  // Vérifier que le bucket existe
  console.log('\n🪣  Vérification du bucket Supabase Storage...');
  const bucketExists = await checkBucketExists();
  if (!bucketExists) {
    console.error(`\n❌ Bucket "${BUCKET}" introuvable.`);
    console.error('   → Crée-le manuellement sur Supabase :');
    console.error('   1. supabase.com → ton projet → Storage');
    console.error('   2. "New bucket" → nom : "products" → cocher "Public bucket"');
    console.error('   3. Relance ce script\n');
    process.exit(1);
  }
  console.log(`✅ Bucket "${BUCKET}" trouvé`);

  // Lister les images locales
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  const toUpload = files.filter(f => !uploadMap[f]);

  console.log(`\n📊 Images totales    : ${files.length}`);
  console.log(`   Déjà uploadées    : ${files.length - toUpload.length}`);
  console.log(`   À uploader        : ${toUpload.length}\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toUpload.length; i++) {
    const filename = toUpload[i];
    const filePath = path.join(IMAGES_DIR, filename);
    const storagePath = `facebook/${filename}`;

    try {
      const publicUrl = await uploadToStorage(filePath, storagePath);
      uploadMap[filename] = publicUrl;
      success++;
      process.stdout.write(`✓  `);
    } catch (err) {
      failed++;
      uploadMap[filename] = null;
      process.stdout.write(`✗  `);
    }

    // Sauvegarder toutes les 20 images (pour reprendre en cas d'interruption)
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(OUTPUT_MAP, JSON.stringify(uploadMap, null, 2));
      process.stdout.write(`\n   [${i + 1}/${toUpload.length}] sauvegardé\n`);
    }

    await new Promise(r => setTimeout(r, 100));
  }

  // Sauvegarde finale
  fs.writeFileSync(OUTPUT_MAP, JSON.stringify(uploadMap, null, 2));

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ UPLOAD TERMINÉ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Uploadées avec succès : ${success}`);
  console.log(`   Échouées              : ${failed}`);
  console.log(`\n💾 Map sauvegardé : ${OUTPUT_MAP}`);
  console.log('\n🔜 Prochaine étape :');
  console.log('   Après analyse des images → node scripts/import-products.cjs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('❌ Erreur inattendue:', err.message);
  process.exit(1);
});
