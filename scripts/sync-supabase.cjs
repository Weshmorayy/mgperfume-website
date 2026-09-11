#!/usr/bin/env node

/**
 * MG PERFUME — Supabase CLI Synchronization & Health Check Script
 * Usage: node scripts/sync-supabase.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xnmolqmcfnjvcblizahu.supabase.co';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhubW9scW1jZm5qdmNibGl6YWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MzU4NjQsImV4cCI6MjEwNDUxMTg2NH0._KRQCSn_gAopANWDE-SdMCGmXBYLvD8pNyCTSqy8bRE';
let SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
  const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
  if (match) SERVICE_KEY = match[1].trim();
} catch (_) {}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚡ MG PERFUME — SUPABASE CLI DATABASE SYNC & HEALTH CHECK');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 URL: ${SUPABASE_URL}`);

function request(endpoint, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(`${SUPABASE_URL}/rest/v1${endpoint}`);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: options.method || 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (_) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const tables = ['products', 'orders', 'editorial_banners', 'shipping_zones', 'faqs', 'site_backups'];

  console.log('\n🔍 1. VÉRIFICATION DE L’ÉTAT DES TABLES SUPABASE :');
  console.log('─────────────────────────────────────────────────');

  const missingTables = [];

  for (const table of tables) {
    try {
      const res = await request(`/${table}?limit=1`);
      if (res.status === 200) {
        const count = Array.isArray(res.data) ? res.data.length : 0;
        console.log(`  ✅ Table '${table}' : Opérationnelle (Code 200)`);
      } else if (res.status === 404) {
        console.log(`  ❌ Table '${table}' : Introuvable (Nécessite exécution du schéma SQL)`);
        missingTables.push(table);
      } else {
        console.log(`  ⚠️ Table '${table}' : Statut ${res.status} (${JSON.stringify(res.data || res.raw)})`);
      }
    } catch (err) {
      console.log(`  ❌ Erreur de connexion pour '${table}':`, err.message);
    }
  }

  // Check if exec_sql RPC function is available
  console.log('\n🔍 2. VÉRIFICATION DU HELPER RPC EXEC_SQL :');
  console.log('──────────────────────────────────────────');
  try {
    const rpcRes = await request('/rpc/exec_sql', { method: 'POST' }, { query: 'SELECT 1 as test;' });
    if (rpcRes.status === 200) {
      console.log('  ✅ Fonction exec_sql disponible : Exécution DDL à distance ACTIVE !');
      
      // Attempt remote schema migration if any tables are missing
      if (missingTables.length > 0) {
        console.log('\n🚀 3. EXÉCUTION AUTOMATIQUE DU SCHÉMA SQL À DISTANCE...');
        const sqlContent = fs.readFileSync(path.join(__dirname, '../supabase_master_schema.sql'), 'utf-8');
        const migRes = await request('/rpc/exec_sql', { method: 'POST' }, { query: sqlContent });
        console.log('  Résultat migration :', migRes.data);
      }
    } else {
      console.log('  ℹ️ Fonction exec_sql non encore installée (Code ' + rpcRes.status + ')');
      console.log('     Pour l’activer, exécutez supabase_master_schema.sql dans le SQL Editor.');
    }
  } catch (err) {
    console.log('  ℹ️ RPC non disponible:', err.message);
  }

  // Seed / Sync Products
  console.log('\n📦 3. SYNCHRONISATION DU CATALOGUE PARFUMS :');
  console.log('───────────────────────────────────────────');
  const initialProducts = [
    {
      id: 'khamrah-waha',
      name: 'Khamrah Waha',
      brand: 'Lattafa',
      tagline: 'Élixir épicé rafraîchi de brise marine et fève tonka',
      price: 35000,
      original_price: 40000,
      volume: '100 ml',
      image: '/images/products/khamrah-waha.jpg',
      family: 'oriental',
      category_label: 'Oriental Épicé Frais',
      badge: 'Bestseller',
      top_notes: ['Concombre', 'Bergamote', 'Yuzu', 'Genévrier'],
      heart_notes: ['Gingembre', 'Iris', 'Sauge', 'Sel de mer'],
      base_notes: ['Akigalawood', 'Fève Tonka', 'Vanille', 'Musc', 'Ambrofix™'],
      description: 'Une réinterprétation lumineuse alliant la fraîcheur du yuzu et du sel marin à la richesse de la fève tonka et du musc.',
      is_popular: true,
      is_hero: true,
      in_stock: true
    },
    {
      id: 'seasons-drift',
      name: 'Seasons Drift',
      brand: 'Z / Aoud',
      tagline: 'Sillage boisé noble aux accents de poivre rose et résine d’ambre',
      price: 25000,
      original_price: null,
      volume: '100 ml',
      image: '/images/products/seasons-drift.jpg',
      family: 'boise',
      category_label: 'Boisé Aromatique',
      badge: null,
      top_notes: ['Zeste de citron', 'Poivre rose', 'Pamplemousse'],
      heart_notes: ['Sauge clarée', 'Gingembre', 'Cèdre'],
      base_notes: ['Labdanum', 'Bois de santal', 'Ambre précieux', 'Résine'],
      description: 'Un parfum d’une tenue remarquable avec une fraîcheur d’agrumes poivrée qui s’ancre dans un lit de santal et d’ambre profond.',
      is_popular: false,
      is_hero: false,
      in_stock: true
    },
    {
      id: 'mazaaj-infused',
      name: 'Mazaaj Infused',
      brand: 'Z / Aoud',
      tagline: 'Fraîcheur vive d’agrumes infusée d’oliban et d’ambroxan',
      price: 25000,
      original_price: null,
      volume: '100 ml',
      image: '/images/products/mazaaj-infused.jpg',
      family: 'aquatique',
      category_label: 'Hespéridé & Boisé',
      badge: null,
      top_notes: ['Citron', 'Orange', 'Bergamote'],
      heart_notes: ['Néroli', 'Gingembre frais'],
      base_notes: ['Oliban', 'Ambroxan', 'Notes boisées nobles'],
      description: 'L’accord idéal entre dynamisme solaire et profondeur mystique. Une explosion hespéridée équilibrée par l’encens oliban.',
      is_popular: false,
      is_hero: false,
      in_stock: true
    },
    {
      id: 'raheeq',
      name: 'Raheeq',
      brand: 'Nusuk',
      tagline: 'Gourmandise miellée, abricot velouté et magnolia précieux',
      price: 25000,
      original_price: 30000,
      volume: '100 ml',
      image: '/images/products/raheeq.jpg',
      family: 'gourmand',
      category_label: 'Gourmand Solaire',
      badge: 'Coup de Cœur',
      top_notes: ['Citron', 'Miel doré', 'Orange sanguine', 'Abricot'],
      heart_notes: ['Caramel fondant', 'Noix de coco', 'Magnolia'],
      base_notes: ['Vanille absolue', 'Bois de santal', 'Musc blanc'],
      description: 'Un hymne à la douceur et à l’opulence. Des effluves de miel et d’abricot fondant sur un cœur de caramel vanillé et de magnolia.',
      is_popular: true,
      is_hero: false,
      in_stock: true
    },
    {
      id: 'souvenir-blooming-bliss',
      name: 'Souvenir Blooming Bliss',
      brand: 'Afnan',
      tagline: 'Dôme d’élégance, noix de coco crémeuse et bois de Palo Santo',
      price: 30000,
      original_price: null,
      volume: '100 ml',
      image: '/images/products/souvenir-blooming-bliss.jpg',
      family: 'gourmand',
      category_label: 'Boisé Gourmand',
      badge: null,
      top_notes: ['Vanille bourbon'],
      heart_notes: ['Noix de coco lactée', 'Caramel', 'Palo Santo'],
      base_notes: ['Bois de santal', 'Musc blanc pur'],
      description: 'Présenté dans son flacon sphérique d’exception, Blooming Bliss libère une aura crémeuse et mystique avec les nuances du Palo Santo.',
      is_popular: false,
      is_hero: false,
      in_stock: true
    },
    {
      id: 'mystique-bouquet',
      name: 'Mystique Bouquet',
      brand: 'Afnan',
      tagline: 'Brassée somptueuse de fleurs d’oranger, pêche blanche et litchi',
      price: 30000,
      original_price: null,
      volume: '100 ml',
      image: '/images/products/mystique-bouquet.jpg',
      family: 'floral',
      category_label: 'Floral Fruitier Boisé',
      badge: 'Tendance',
      top_notes: ['Bergamote', 'Pêche blanche', 'Mandarine'],
      heart_notes: ['Fleur d’oranger', 'Vétiver', 'Mahonia'],
      base_notes: ['Ambroxan', 'Vanille', 'Musc doux'],
      description: 'Un bouquet floral envoûtant et moderne où la pêche blanche et la fleur d’oranger s’épanouissent sur un lit de vanille et d’ambroxan.',
      is_popular: true,
      is_hero: false,
      in_stock: true
    }
  ];

  try {
    const upsertRes = await request('/products', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' }
    }, initialProducts);

    if (upsertRes.status === 201 || upsertRes.status === 200 || upsertRes.status === 204) {
      console.log('  ✅ Produits phares synchronisés avec succès dans Supabase !');
    } else {
      console.log(`  ⚠️ Synchronisation produits statut: ${upsertRes.status}`, upsertRes.data || upsertRes.raw);
    }
  } catch (err) {
    console.log('  ❌ Erreur sync produits:', err.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (missingTables.includes('orders')) {
    console.log('⚠️ ACTION REQUISE POUR LES COMMANDES PAYTECH :');
    console.log('La table "orders" n’existe pas encore dans Supabase.');
    console.log('Veuillez copier le contenu de "supabase_master_schema.sql"');
    console.log('(disponible dans /sdcard/Download/ ou dans l’admin)');
    console.log('et le coller dans Supabase SQL Editor pour créer la table.');
  } else {
    console.log('🎉 TOUTES LES TABLES SONT PRÊTES ET OPÉRATIONNELLES !');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
