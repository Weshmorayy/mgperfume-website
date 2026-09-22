const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/products_ready_to_import.json', 'utf-8'));

function cleanAndRewriteDescription(prod) {
  let raw = prod.description || '';
  
  // 1. Nettoyage des numéros de téléphone et liens
  raw = raw.replace(/(\+?221\s?)?[78]\d[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/g, '');
  raw = raw.replace(/https?:\/\/\S+/g, '');
  raw = raw.replace(/www\.\S+/g, '');
  raw = raw.replace(/📲|👉|🔥|✨|💎|😍|🌸|🤎|📍|📦/g, '');

  // 2. Extraire la première phrase signifiante ou les notes
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 10 && !l.toLowerCase().includes('livraison') && !l.toLowerCase().includes('command'));
  
  let cleanText = lines.slice(0, 3).join(' ');
  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  // 3. Réécriture créative et SEO selon la famille
  const familyDesc = {
    oriental: 'Un sillage oriental riche et envoûtant, idéal pour marquer les esprits à Dakar.',
    gourmand: 'Des notes gourmandes et vanillées d’une douceur irrésistible, parfaites au quotidien.',
    floral: 'Une brassée florale élégante et fraîche qui laisse une empreinte délicate.',
    boise: 'Un accord boisé noble et chaleureux, apportant prestance et élégance.',
    aquatique: 'Une fraîcheur vive et hespéridée, idéale pour les journées ensoleillées.'
  };

  const suffix = familyDesc[prod.family] || familyDesc.oriental;

  if (!cleanText || cleanText.length < 20 || cleanText.includes('Nouveauté exclusive')) {
    return `${prod.name} par ${prod.brand}. ${suffix} Flacon de ${prod.volume}. Disponible chez MG Perfume avec livraison rapide sur Dakar et région.`;
  }

  return `${cleanText} ${suffix} Flacon de ${prod.volume}.`;
}

// Réécriture de tous les produits
const rewrittenProducts = products.map(p => {
  return {
    ...p,
    description: cleanAndRewriteDescription(p)
  };
});

fs.writeFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/products_ready_to_import.json', JSON.stringify(rewrittenProducts, null, 2));

console.log('✅ Descriptions réécrites avec succès !');
console.log('--- Exemple après réécriture ---');
console.log(JSON.stringify(rewrittenProducts.slice(0, 3), null, 2));
