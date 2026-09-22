const fs = require('fs');
const path = require('path');

// Chargement des données
const indexPosts = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/image_index.json', 'utf-8'));
const newImagesDir = '/data/data/com.termux/files/home/storage/shared/Documents/Clients/MG Perfume/Stock-Images/New-sept-22th';
const newImageFiles = fs.readdirSync(newImagesDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

// Mappage des familles olfactives par mots-clés
function detectFamily(text) {
  const t = text.toLowerCase();
  if (t.includes('vanille') || t.includes('miel') || t.includes('gourmand') || t.includes('marshmallow') || t.includes('sucre')) return 'gourmand';
  if (t.includes('fleur') || t.includes('rose') || t.includes('jasmine') || t.includes('bouquet')) return 'floral';
  if (t.includes('bois') || t.includes('oud') || t.includes('santal') || t.includes('cedre')) return 'boise';
  if (t.includes('frais') || t.includes('citron') || t.includes('agrumes') || t.includes('brise')) return 'aquatique';
  return 'oriental'; // Défaut pour parfumerie orientale
}

// Mappage des marques
function detectBrand(text, name) {
  const full = (text + ' ' + name).toLowerCase();
  if (full.includes('kayali')) return 'Kayali';
  if (full.includes('lattafa')) return 'Lattafa';
  if (full.includes('afnan')) return 'Afnan';
  if (full.includes('nusuk')) return 'Nusuk';
  if (full.includes('z / aoud') || full.includes('z aoud')) return 'Z / Aoud';
  return 'MG Perfume';
}

// Extraction du volume
function detectVolume(text) {
  const match = text.match(/(\d{2,3}\s*ml)/i);
  return match ? match[1].toLowerCase() : '100 ml';
}

const classifiedProducts = [];
const imageAnalysisLog = [];

// 1. TRAITEMENT PRIORITAIRE DES NOUVELLES IMAGES RÉCENTES (Stock-Images/New-sept-22th)
newImageFiles.forEach((file, idx) => {
  const filePath = path.join(newImagesDir, file);
  const name = `Nouveauté Flacon Exclusif #${idx + 1}`;
  
  imageAnalysisLog.push({
    file,
    source: 'New-sept-22th (Prioritaire Client)',
    classification: 'PRODUCT_PAGE_HERO',
    reason: 'Photo haute qualité récente transmise par le client — produit physique flacon.'
  });

  classifiedProducts.push({
    id: `new-sept-${idx + 1}`,
    name,
    brand: 'MG Perfume',
    tagline: 'Flacon d’exception — Nouveauté sélectionnée',
    price: null, // Pas de prix inventé
    volume: '100 ml',
    image: filePath,
    family: 'oriental',
    category_label: 'Eau de Parfum',
    badge: 'Nouveauté',
    description: 'Nouveauté exclusive disponible en boutique.',
    is_popular: true,
    is_hero: true,
    in_stock: true,
    is_priority: true
  });
});

// 2. TRAITEMENT ET FILTRAGE DES POSTS FB AVEC IMAGES
indexPosts.forEach((post, pIdx) => {
  if (!post.text || post.text.length < 5) return;

  const lines = post.text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;

  let rawTitle = lines[0].replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
  if (rawTitle.length < 3 && lines[1]) rawTitle = lines[1].trim();
  if (!rawTitle) return;

  // Détection des prix (Règle stricte : jamais d'invention)
  const priceMatch = post.text.match(/(\d{2,3}[\s.]?\d{3})\s*(FCFA|F|CFA)?/i);
  const price = priceMatch ? parseInt(priceMatch[1].replace(/\s|\./g, ''), 10) : null;

  // Analyse des visuels du post
  const validProductImages = [];

  (post.localImages || []).forEach(img => {
    const ocr = (img.ocrText || '').toLowerCase();
    
    // Détermination du type d'image
    let classification = 'PRODUCT_PAGE_VALID';
    let reason = 'Photo de flacon / produit nette pour la fiche.';

    if (ocr.includes('followers') || ocr.includes('publications') || ocr.includes('tiktok') || ocr.includes('suivi')) {
      classification = 'UNUSABLE';
      reason = 'Capture d\'écran de profil / réseau social — Exclue de la fiche produit.';
    } else if (ocr.includes('barbe a papa') || ocr.includes('douceur sucree') || ocr.includes('un nuage gourmand') || ocr.includes('offert')) {
      classification = 'PROMOTIONAL_GRAPHIC';
      reason = 'Visuel graphique avec texte promo/notes — conservé comme note/info, exclu du slider principal flacon.';
    }

    imageAnalysisLog.push({
      file: img.filename,
      postId: post.postId,
      classification,
      reason,
      ocrSnippet: img.ocrText ? img.ocrText.slice(0, 100) : 'Pas d\'OCR'
    });

    if (classification === 'PRODUCT_PAGE_VALID' && img.path) {
      validProductImages.push(img.path);
    }
  });

  // Si on a des images valides ou si le post a du texte exploitable
  if (validProductImages.length > 0 || price !== null) {
    const slug = rawTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    classifiedProducts.push({
      id: slug || `product-fb-${pIdx}`,
      name: rawTitle,
      brand: detectBrand(post.text, rawTitle),
      tagline: lines[1] || 'Sillage d’exception MG Perfume',
      price: price,
      volume: detectVolume(post.text),
      image: validProductImages[0] || '/images/products/placeholder.jpg',
      family: detectFamily(post.text),
      category_label: 'Eau de Parfum',
      badge: post.likes > 5 ? 'Coup de Cœur' : null,
      description: post.text,
      is_popular: post.likes > 2,
      is_hero: false,
      in_stock: true,
      is_priority: false
    });
  }
});

// Déduplication du catalogue final par nom
const catalogMap = new Map();
classifiedProducts.forEach(p => {
  const key = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!catalogMap.has(key)) {
    catalogMap.set(key, p);
  } else {
    const existing = catalogMap.get(key);
    if (!existing.price && p.price) existing.price = p.price;
  }
});

const finalProducts = Array.from(catalogMap.values());

// Statistiques
const promoCount = imageAnalysisLog.filter(l => l.classification === 'PROMOTIONAL_GRAPHIC').length;
const unusableCount = imageAnalysisLog.filter(l => l.classification === 'UNUSABLE').length;
const validCount = imageAnalysisLog.filter(l => l.classification === 'PRODUCT_PAGE_VALID' || l.classification === 'PRODUCT_PAGE_HERO').length;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 RÉSULTATS DE L’ANALYSE COMBINÉE (POSTS FB + IMAGES)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📸 Images analysées totales : ${imageAnalysisLog.length}`);
console.log(`  ✅ Photos Fiche Produit Valides : ${validCount}`);
console.log(`  🎨 Graphiques / Promos (infos extraites, exclu slider) : ${promoCount}`);
console.log(`  ❌ Captures / Inutilisables (exclues) : ${unusableCount}`);
console.log(`-----------------------------------------------------`);
console.log(`📦 Produits uniques générés pour la boutique : ${finalProducts.length}`);
console.log(`💰 Produits avec prix réels confirmés : ${finalProducts.filter(p => p.price !== null).length}`);
console.log(`⚠️ Produits sans prix (champ null, pas d'invention) : ${finalProducts.filter(p => p.price === null).length}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Sauvegarde
fs.writeFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/image_classification_log.json', JSON.stringify(imageAnalysisLog, null, 2));
fs.writeFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/products_ready_to_import.json', JSON.stringify(finalProducts, null, 2));
