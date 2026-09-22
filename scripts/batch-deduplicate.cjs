const fs = require('fs');
const path = require('path');

const fbPosts = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/batch_input_fb.json', 'utf-8'));
const newImages = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/batch_input_new_images.json', 'utf-8'));

// Dictionnaire de déduplication par nom normalisé
const catalog = new Map();

function normalizeName(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

fbPosts.forEach(post => {
  if (!post.text || post.text.length < 5) return;
  
  // Extraire le titre (première ligne non vide)
  const lines = post.text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;
  
  let rawTitle = lines[0].replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
  if (rawTitle.length < 3) rawTitle = lines[1] || rawTitle;

  const key = normalizeName(rawTitle);
  if (!key) return;

  // Extraire le prix
  const price = post.detectedPrice ? parseInt(post.detectedPrice, 10) : null;

  if (catalog.has(key)) {
    const existing = catalog.get(key);
    // Fusionner les infos sans dupliquer
    if (!existing.price && price) existing.price = price;
    existing.descriptions.push(post.text);
    existing.fbUrls.push(post.postId);
    existing.images.push(...post.images);
  } else {
    catalog.set(key, {
      id: key,
      name: rawTitle,
      price: price,
      volume: '100 ml', // valeur par défaut
      descriptions: [post.text],
      fbUrls: [post.postId],
      images: [...post.images],
      source: 'facebook_posts'
    });
  }
});

const deduplicatedProducts = Array.from(catalog.values()).map(p => ({
  id: p.id,
  name: p.name,
  price: p.price,
  description: p.descriptions[0], // garde la plus pertinente
  imageCount: p.images.length,
  fbPostCount: p.fbUrls.length
}));

console.log(`✅ Déduplication terminée :`);
console.log(`- Total posts analysés : ${fbPosts.length}`);
console.log(`- Produits uniques extraits : ${deduplicatedProducts.length}`);
console.log(`- Produits récents prioritaires (New-sept-22th) : ${newImages.length} images associées.`);

fs.writeFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/deduplicated_catalog.json', JSON.stringify(deduplicatedProducts, null, 2));
