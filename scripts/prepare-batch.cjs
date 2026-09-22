const fs = require('fs');
const path = require('path');

// 1. Charger les posts FB
const fbPosts = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/scraped_fb_posts.json', 'utf-8'));

// 2. Charger les images locales du dossier New-sept-22th
const newImagesDir = '/data/data/com.termux/files/home/storage/shared/Documents/Clients/MG Perfume/Stock-Images/New-sept-22th';
const newImageFiles = fs.readdirSync(newImagesDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

// 3. Préparer le fichier de batching textuel + mapping d'images
const batches = [];
const BATCH_SIZE = 15; // 15 posts par batch = très efficace et peu de requêtes

// Pré-structuration des posts FB
const fbProcessed = fbPosts.map(p => {
  // Détection basique du prix dans le texte
  const priceMatch = (p.text || '').match(/(\d{2,3}[\s.]?\d{3})\s*(FCFA|F|CFA)?/i);
  return {
    postId: p.postId,
    text: p.text || '',
    detectedPrice: priceMatch ? priceMatch[1].replace(/\s|\./g, '') : null,
    likes: p.likes || 0,
    timestamp: p.timestamp,
    images: (p.media || []).filter(m => m.image?.uri).map(m => m.image.uri)
  };
});

console.log(`✅ Fichiers prêts à être traités en batchs :`);
console.log(`- ${fbProcessed.length} posts Facebook`);
console.log(`- ${newImageFiles.length} nouvelles images récentes en priorité`);

// Exporter la liste des batchs
const outputDir = '/data/data/com.termux/files/home/atelier/mgperfume-website/data';
fs.writeFileSync(path.join(outputDir, 'batch_input_fb.json'), JSON.stringify(fbProcessed, null, 2));
fs.writeFileSync(path.join(outputDir, 'batch_input_new_images.json'), JSON.stringify(newImageFiles.map(f => path.join(newImagesDir, f)), null, 2));

console.log(`💾 Fichiers de préparation batch sauvegardés dans ${outputDir}`);
