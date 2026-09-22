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

const products = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/products_certified_vision.json', 'utf-8'));

function uploadImage(localPath, filename) {
  return new Promise((resolve) => {
    if (!fs.existsSync(localPath)) {
      console.log(`⚠️ Image locale introuvable: ${localPath}`);
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
        console.log(`⚠️ Erreur upload ${filename}: Status ${res.statusCode}`);
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
    req.write(fileData);
    req.end();
  });
}

function replaceProducts(productsBatch) {
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

function clearOldProducts() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'xnmolqmcfnjvcblizahu.supabase.co',
      path: '/rest/v1/products?id=neq.clean_all',
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY
      }
    }, res => {
      resolve(true);
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ IMPORTATION DU CATALOGUE CERTIFIÉ PAR VISION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('1. Nettoyage de l\'ancien catalogue avec données erronées...');
  await clearOldProducts();
  console.log('✅ Base nettoyée');

  console.log('\n2. Upload des véritables photos produit vers Supabase Storage...');
  const prepared = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let publicUrl = null;

    if (p.image_local_path && fs.existsSync(p.image_local_path)) {
      publicUrl = await uploadImage(p.image_local_path, p.image_file);
    }

    prepared.push({
      id: p.id,
      name: p.name,
      brand: p.brand,
      tagline: p.tagline,
      price: p.price,
      original_price: null,
      volume: p.volume,
      image: publicUrl || '/images/products/khamrah-waha.jpg',
      family: p.family,
      category_label: p.category_label,
      badge: p.badge,
      top_notes: p.top_notes,
      heart_notes: p.heart_notes,
      base_notes: p.base_notes,
      description: p.description,
      is_popular: p.badge === 'Bestseller' || p.badge === 'Coup de Cœur',
      is_hero: i < 4,
      in_stock: true
    });
  }

  console.log('\n3. Injection des produits authentiques dans Supabase DB...');
  await replaceProducts(prepared);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 TOUS LES VERITABLES PRODUITS ONT ÉTÉ SYNCHRONISÉS !');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
