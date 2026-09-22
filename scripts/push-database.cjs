const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local
const envVars = {};
const envPath = '/data/data/com.termux/files/home/atelier/mgperfume-website/.env.local';
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim();
  });
}

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const API_KEY = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const BUCKET = 'products';

const products = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/products_ready_to_import.json', 'utf-8'));
const imagesDir = '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 MG PERFUME — IMPORTATION DES PRODUITS & IMAGES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📦 Nombre de produits à importer : ${products.length}`);
console.log(`📡 Base de données Supabase : ${SUPABASE_URL}`);

function uploadImage(localPath, filename) {
  return new Promise((resolve) => {
    if (!fs.existsSync(localPath)) {
      resolve(null);
      return;
    }
    const fileData = fs.readFileSync(localPath);
    const req = https.request({
      hostname: 'xnmolqmcfnjvcblizahu.supabase.co',
      path: `/storage/v1/object/${BUCKET}/${filename}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
        'Content-Type': 'image/jpeg',
        'Content-Length': fileData.length,
        'x-upsert': 'true'
      }
    }, res => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        resolve(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`);
      } else {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
    req.write(fileData);
    req.end();
  });
}

function upsertProducts(productsBatch) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(productsBatch);
    const req = https.request({
      hostname: 'xnmolqmcfnjvcblizahu.supabase.co',
      path: '/rest/v1/products',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          resolve(true);
        } else {
          reject(new Error(`DB error (${res.statusCode}): ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('\n1. Upload des images vers Supabase Storage...');
  const preparedProducts = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let finalImageUrl = '/images/products/khamrah-waha.jpg'; // fallback par défaut
    
    if (p.image && fs.existsSync(p.image)) {
      const filename = path.basename(p.image);
      const publicUrl = await uploadImage(p.image, filename);
      if (publicUrl) finalImageUrl = publicUrl;
    }

    preparedProducts.push({
      id: p.id,
      name: p.name,
      brand: p.brand || 'MG Perfume',
      tagline: p.tagline || '',
      price: p.price || 25000, // prix par défaut si null pour respecter les contraintes schema DB NOT NULL
      original_price: p.original_price || null,
      volume: p.volume || '100 ml',
      image: finalImageUrl,
      family: p.family || 'oriental',
      category_label: p.category_label || 'Eau de Parfum',
      badge: p.badge || null,
      top_notes: p.top_notes || [],
      heart_notes: p.heart_notes || [],
      base_notes: p.base_notes || [],
      description: p.description || '',
      is_popular: p.is_popular || false,
      is_hero: p.is_hero || false,
      in_stock: p.in_stock !== false
    });

    if ((i + 1) % 10 === 0 || i === products.length - 1) {
      process.stdout.write(`   [${i + 1}/${products.length}] images traitées\n`);
    }
  }

  console.log('\n2. Insertion / Mise à jour dans la base de données Supabase...');
  
  // Exécuter par lots de 20 produits
  const batchSize = 20;
  for (let i = 0; i < preparedProducts.length; i += batchSize) {
    const batch = preparedProducts.slice(i, i + batchSize);
    await upsertProducts(batch);
    console.log(`   ✅ Lot ${Math.floor(i / batchSize) + 1} (${batch.length} produits) synchronisé`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 TOUS LES PRODUITS ONT ÉTÉ IMPORTÉS DANS SUPABASE !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('❌ Erreur lors de l’importation :', err.message);
  process.exit(1);
});
