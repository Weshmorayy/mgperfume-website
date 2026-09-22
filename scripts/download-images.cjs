#!/usr/bin/env node

/**
 * MG PERFUME — Téléchargement des images Facebook scrapées
 * 
 * Usage:
 *   node scripts/download-images.cjs
 * 
 * Output:
 *   data/images/<postId>_<index>.jpg
 *   data/image_index.json  (mapping postId → fichiers locaux + texte du post)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const url = require('url');

const POSTS_FILE = path.join(__dirname, '../data/scraped_fb_posts.json');
const IMAGES_DIR = path.join(__dirname, '../data/images');
const INDEX_FILE = path.join(__dirname, '../data/image_index.json');

if (!fs.existsSync(POSTS_FILE)) {
  console.error('❌ scraped_fb_posts.json introuvable. Lance scrape-fb-apify.cjs d\'abord.');
  process.exit(1);
}

const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📥 MG PERFUME — TÉLÉCHARGEMENT DES IMAGES FACEBOOK');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📂 Source : ${POSTS_FILE}`);
console.log(`📁 Dest   : ${IMAGES_DIR}`);

function downloadFile(imageUrl, destPath) {
  return new Promise((resolve, reject) => {
    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
      resolve({ skipped: true });
      return;
    }

    const parsedUrl = url.parse(imageUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(imageUrl, { timeout: 15000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve({ skipped: false })));
      file.on('error', (err) => { fs.unlink(destPath, () => {}); reject(err); });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function slugify(text) {
  return text.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
}

async function main() {
  const imageIndex = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let total = 0;

  // Count total images first
  for (const post of posts) {
    const photos = (post.media || []).filter(m => m.__typename === 'Photo' && m.image?.uri);
    total += photos.length;
  }
  console.log(`\n📊 Total images à télécharger : ${total}\n`);

  for (let pi = 0; pi < posts.length; pi++) {
    const post = posts[pi];
    const photos = (post.media || []).filter(m => m.__typename === 'Photo' && m.image?.uri);
    if (photos.length === 0) continue;

    const postSlug = slugify(post.postId || `post_${pi}`);
    const postEntry = {
      postId: post.postId,
      facebookUrl: post.facebookUrl,
      timestamp: post.timestamp,
      text: post.text || '',
      likes: post.likes || 0,
      localImages: []
    };

    for (let ii = 0; ii < photos.length; ii++) {
      const photo = photos[ii];
      const imageUri = photo.image.uri;
      const filename = `${postSlug}_${ii + 1}.jpg`;
      const destPath = path.join(IMAGES_DIR, filename);

      try {
        const result = await downloadFile(imageUri, destPath);
        if (result.skipped) {
          skipped++;
          process.stdout.write(`⏭  `);
        } else {
          downloaded++;
          process.stdout.write(`✓  `);
        }
        postEntry.localImages.push({
          filename,
          path: destPath,
          ocrText: photo.ocrText || null  // Apify OCR inclus (référence seulement)
        });
      } catch (err) {
        failed++;
        process.stdout.write(`✗  `);
        postEntry.localImages.push({
          filename,
          path: null,
          error: err.message
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }

    imageIndex.push(postEntry);

    if ((pi + 1) % 20 === 0) {
      process.stdout.write(`\n   [${pi + 1}/${posts.length} posts traités]\n`);
    }
  }

  // Save index
  fs.writeFileSync(INDEX_FILE, JSON.stringify(imageIndex, null, 2), 'utf-8');

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TÉLÉCHARGEMENT TERMINÉ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Téléchargées   : ${downloaded}`);
  console.log(`   Déjà présentes : ${skipped}`);
  console.log(`   Échouées       : ${failed}`);
  console.log(`\n💾 Index sauvegardé : ${INDEX_FILE}`);
  console.log(`📁 Images dans      : ${IMAGES_DIR}`);
  console.log('\n🔜 Prochaine étape :');
  console.log('   Dis "Analyse les posts Facebook de MG Perfume" dans AGY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
