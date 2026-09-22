#!/usr/bin/env node

/**
 * MG PERFUME — Scraping Facebook via Apify REST API
 * Page cible : https://www.facebook.com/MGPERFUMEE/
 * 
 * Usage:
 *   node scripts/scrape-fb-apify.cjs
 *   RESULTS_LIMIT=100 node scripts/scrape-fb-apify.cjs
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

const APIFY_TOKEN = process.env.APIFY_TOKEN || envVars['APIFY_TOKEN'];
const TARGET_PAGE_URL = 'https://www.facebook.com/MGPERFUMEE/';
const RESULTS_LIMIT = parseInt(process.env.RESULTS_LIMIT || '50', 10);
const OUTPUT_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'scraped_fb_posts.json');

if (!APIFY_TOKEN) {
  console.error('❌ APIFY_TOKEN manquant. Ajoute-le dans .env.local');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 MG PERFUME — SCRAPING FACEBOOK VIA APIFY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🎯 Page Cible  : ${TARGET_PAGE_URL}`);
console.log(`📊 Limite Max  : ${RESULTS_LIMIT} posts`);
console.log(`💾 Output      : ${OUTPUT_FILE}`);

function apiRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: `${parsed.pathname}${parsed.search}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_TOKEN}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // 1. Lancer le run
  console.log('\n📡 Étape 1 — Lancement de l\'Actor apify/facebook-posts-scraper...');
  const runRes = await apiRequest(
    'https://api.apify.com/v2/acts/apify~facebook-posts-scraper/runs',
    'POST',
    {
      startUrls: [{ url: TARGET_PAGE_URL }],
      resultsLimit: RESULTS_LIMIT
    }
  );

  if (!runRes.data?.data?.id) {
    console.error('❌ Erreur au lancement du run:', JSON.stringify(runRes.data || runRes.raw, null, 2));
    process.exit(1);
  }

  const runId = runRes.data.data.id;
  const defaultDatasetId = runRes.data.data.defaultDatasetId;
  let status = runRes.data.data.status;

  console.log(`✅ Run lancé. Run ID: ${runId}`);
  console.log(`   Statut initial: ${status}`);

  // 2. Attendre la fin du run
  console.log('\n⏳ Étape 2 — Surveillance du run Apify...');
  while (status === 'RUNNING' || status === 'READY') {
    await sleep(8000);
    const poll = await apiRequest(`https://api.apify.com/v2/actor-runs/${runId}`);
    status = poll.data?.data?.status || status;
    const stats = poll.data?.data?.stats || {};
    process.stdout.write(`\r   Statut: ${status} | Posts extraits: ${stats.outputItems || 0}   `);
  }
  console.log('');

  if (status !== 'SUCCEEDED') {
    console.error(`\n❌ Run terminé avec statut: ${status}`);
    process.exit(1);
  }
  console.log(`✅ Run terminé avec succès !`);

  // 3. Récupérer les items
  console.log('\n📥 Étape 3 — Téléchargement des données...');
  const dataRes = await apiRequest(
    `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?format=json&limit=1000`
  );

  const items = Array.isArray(dataRes.data) ? dataRes.data : [];
  console.log(`✅ ${items.length} posts récupérés`);

  if (items.length === 0) {
    console.warn('⚠️  Aucun post récupéré. Vérifie la page Facebook et les paramètres.');
    process.exit(0);
  }

  // 4. Sauvegarder
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2), 'utf-8');

  // 5. Stats rapides
  const withImages = items.filter(p => p.photos?.length > 0 || p.media?.length > 0);
  const withText = items.filter(p => p.text && p.text.length > 10);
  const withPrice = items.filter(p => p.text && /\d[\s.]?\d{3}|fcfa|cfa|f\b|prix|price/i.test(p.text));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RÉSUMÉ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Total posts     : ${items.length}`);
  console.log(`   Avec images     : ${withImages.length}`);
  console.log(`   Avec texte      : ${withText.length}`);
  console.log(`   Prix détectés   : ${withPrice.length}`);
  console.log(`\n💾 Fichier sauvegardé : ${OUTPUT_FILE}`);
  console.log('\n🔜 Prochaine étape :');
  console.log('   Dans AGY CLI : "Analyse les posts Facebook de MG Perfume"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('❌ Erreur inattendue:', err.message);
  process.exit(1);
});
