const fs = require('fs');
const path = require('path');

// 1. Charger les 19 produits actuels
const certifiedCatalog = JSON.parse(fs.readFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/products_certified_vision.json', 'utf-8'));

// 2. Nouveaux produits qualifiés à partir de IMAGE_ANALYSIS.md et des posts Facebook correspondants
const newQualifiedProducts = [
  // --- MAISON ASRAR (Coffrets Cadeaux & Parfums) ---
  {
    id: 'maison-asrar-bloom-bloom-gift-set',
    name: 'BLOOM BLOOM (Coffret Cadeau)',
    brand: 'Maison Asrar',
    tagline: 'Coffret d’exception floral fruité poire, pêche, rose & santal',
    price: 35000,
    volume: '100 ml',
    family: 'floral',
    category_label: 'Coffret Eau de Parfum',
    badge: 'Coup de Cœur',
    top_notes: ['Poire', 'Pêche', 'Freesia'],
    heart_notes: ['Rose', 'Magnolia', 'Muguet'],
    base_notes: ['Bois de santal', 'Bois de cèdre', 'Muscs'],
    description: 'Coffret de luxe comprenant le flacon Bloom Bloom 100ml et son bouquet rose éternelle. Une harmonie florale et fruitée d’une élégance infinie.',
    image_file: '122183050352207032_1.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122183050352207032_1.jpg'
  },
  {
    id: 'maison-asrar-leila-gift-set',
    name: 'LEILA (Coffret Cadeau)',
    brand: 'Maison Asrar',
    tagline: 'Coffret floral ambré fruits rouges, tubéreuse & vanille',
    price: 35000,
    volume: '100 ml',
    family: 'oriental',
    category_label: 'Coffret Eau de Parfum',
    badge: 'Nouveauté',
    top_notes: ['Fruits rouges', 'Agrumes', 'Ylang-ylang', 'Cassis'],
    heart_notes: ['Jasmin', 'Pêche', 'Tubéreuse', 'Fleur d’oranger'],
    base_notes: ['Ambre', 'Vanille', 'Muscs', 'Patchouli', 'Boisé'],
    description: 'Coffret de prestige Leila avec son flacon ombré et son bouquet blanc. Un sillage ambré et envoûtant.',
    image_file: '122183050352207032_2.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122183050352207032_2.jpg'
  },

  // --- PARIS CORNER - TASKEEN PEACH ---
  {
    id: 'paris-corner-taskeen-peach',
    name: 'TASKEEN PEACH',
    brand: 'Paris Corner',
    tagline: 'Nectar solaire pêche juteuse, orange sanguine & cognac',
    price: 25000,
    volume: '100 ml',
    family: 'gourmand',
    category_label: 'Eau de Parfum',
    badge: 'Tendance',
    top_notes: ['Pêche', 'Orange Sanguine', 'Cardamome'],
    heart_notes: ['Héliotrope', 'Davana', 'Cognac', 'Jasmin'],
    base_notes: ['Bois de Santal', 'Benjoin', 'Cashmeran', 'Vanille', 'Fève Tonka', 'Patchouli'],
    description: 'Une explosion gourmande et liquoreuse de pêche mûre et d’orange sanguine adoucie par la vanille et le benjoin.',
    image_file: '122186651156207032_5.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122186651156207032_5.jpg'
  },

  // --- AL HARAMAIN (Amber Oud Collection) ---
  {
    id: 'al-haramain-amber-oud-gold',
    name: 'AMBER OUD GOLD EDITION',
    brand: 'Al Haramain',
    tagline: 'Luxe ambré fruité ananas, melon, bergamote & vanille',
    price: 45000,
    volume: '120 ml',
    family: 'gourmand',
    category_label: 'Eau de Parfum',
    badge: 'Bestseller',
    top_notes: ['Bergamote', 'Notes vertes'],
    heart_notes: ['Melon', 'Ananas', 'Notes gourmandes'],
    base_notes: ['Notes boisées', 'Vanille', 'Musc'],
    description: 'L’un des parfums les plus prisés au monde. Une tenue exceptionnelle et une projection fruitée ambrée incomparable.',
    image_file: '122186729948207032_1.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122186729948207032_1.jpg'
  },
  {
    id: 'al-haramain-amber-oud-bleu',
    name: 'AMBER OUD BLEU EDITION',
    brand: 'Al Haramain',
    tagline: 'Élégance masculine fraîche, épicée & boisée noble',
    price: 45000,
    volume: '120 ml',
    family: 'aquatique',
    category_label: 'Eau de Parfum',
    badge: null,
    top_notes: ['Citron', 'Pamplemousse', 'Poivre rose', 'Menthe'],
    heart_notes: ['Gingembre', 'Jasmin', 'Vétiver'],
    base_notes: ['Patchouli', 'Bois de santal', 'Cèdre', 'Oliban'],
    description: 'Un parfum de classe mondiale associant fraîcheur aromatique et puissance boisée pour un charisme immédiat.',
    image_file: '122186729948207032_2.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122186729948207032_2.jpg'
  },
  {
    id: 'al-haramain-amber-oud-ruby',
    name: 'AMBER OUD RUBY EDITION',
    brand: 'Al Haramain',
    tagline: 'Prestige floral boisé safran, ambre gris & résine de sapin',
    price: 48000,
    volume: '120 ml',
    family: 'oriental',
    category_label: 'Eau de Parfum',
    badge: 'Coup de Cœur',
    top_notes: ['Safran précieux', 'Amande amère'],
    heart_notes: ['Jasmin grandiflorum', 'Cèdre'],
    base_notes: ['Ambre gris', 'Résine de sapin', 'Notes boisées'],
    description: 'Une interprétation magistrale et opulente aux accords ambrés et safranés d’une tenue vertigineuse.',
    image_file: '122186729948207032_3.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122186729948207032_3.jpg'
  },

  // --- MAISON MASSIMO PARIS ---
  {
    id: 'maison-massimo-la-rose-bleu',
    name: 'LA ROSE BLEU (Niche Edition)',
    brand: 'Maison Massimo',
    tagline: 'Haute parfumerie agrumes siciliens, musc & vanille',
    price: 35000,
    volume: '100 ml',
    family: 'floral',
    category_label: 'Eau de Parfum Niche',
    badge: 'Niche',
    top_notes: ['Orange', 'Bergamote de Calabre', 'Citron de Sicile'],
    heart_notes: ['Fruits secs', 'Guimauve', 'Notes solaires'],
    base_notes: ['Musc duveteux', 'Ambre brut', 'Vanille sensuelle'],
    description: 'Présenté dans son coffret royal bleu et or. Un panier d’agrumes siciliens radieux s’épanouissant sur un lit de vanille onctueuse.',
    image_file: '122187855650207032_2.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122187855650207032_2.jpg'
  },

  // --- LATTAFA ---
  {
    id: 'lattafa-teriaq',
    name: 'TERIAQ',
    brand: 'Lattafa',
    tagline: 'Signature Quentin Bisch caramel, cuir, amande & abricot',
    price: 30000,
    volume: '100 ml',
    family: 'oriental',
    category_label: 'Eau de Parfum',
    badge: 'Bestseller',
    top_notes: ['Caramel', 'Poivre rose', 'Amande amère', 'Abricot'],
    heart_notes: ['Miel doré', 'Rhubarbe', 'Fleurs blanches', 'Rose'],
    base_notes: ['Vanille', 'Cuir souple', 'Vétiver', 'Labdanum', 'Musc'],
    description: 'Chef-d’œuvre olfactif conçu par le nez Quentin Bisch. Une richesse sensuelle mêlant caramel fondant et cuir délicat.',
    image_file: '122192273462207032_1.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122192273462207032_1.jpg'
  },
  {
    id: 'lattafa-eclaire',
    name: 'ECLAIRE',
    brand: 'Lattafa',
    tagline: 'Gourmandise ultime lait chaud, praliné & caramel doré',
    price: 35000,
    volume: '100 ml',
    family: 'gourmand',
    category_label: 'Eau de Parfum',
    badge: 'Tendance',
    top_notes: ['Caramel', 'Lait', 'Sucre'],
    heart_notes: ['Fleurs Blanches', 'Miel'],
    base_notes: ['Vanille', 'Praliné fondant', 'Musc'],
    description: 'Le parfum gourmand viral par excellence. Une odeur réconfortante et addictive de praliné et caramel au lait.',
    image_file: '122192273462207032_2.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122192273462207032_2.jpg'
  },

  // --- RAVE (BY LATTAFA) ---
  {
    id: 'rave-now-black',
    name: 'NOW (Black Edition)',
    brand: 'Rave',
    tagline: 'Énergie fruitée ananas fumé, cassis, bouleau & vanille',
    price: 20000,
    volume: '100 ml',
    family: 'boise',
    category_label: 'Eau de Parfum',
    badge: 'Bestseller',
    top_notes: ['Ananas juteux', 'Cassis', 'Bergamote', 'Pomme'],
    heart_notes: ['Bouleau sec', 'Patchouli', 'Jasmin', 'Rose'],
    base_notes: ['Mousse de chêne', 'Musc', 'Ambre gris', 'Vanille'],
    description: 'Un parfum dynamique et masculin ultra populaire avec son ouverture explosive d’ananas et son fond boisé ambré.',
    image_file: '122200624040207032_1.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122200624040207032_1.jpg'
  },
  {
    id: 'rave-now-white',
    name: 'NOW WHITE',
    brand: 'Rave',
    tagline: 'Douceur florale lumineuse mandarine, pêche & tubéreuse',
    price: 20000,
    volume: '100 ml',
    family: 'floral',
    category_label: 'Eau de Parfum',
    badge: null,
    top_notes: ['Pêche', 'Mandarine', 'Tubéreuse'],
    heart_notes: ['Gardénia', 'Muguet', 'Jasmin'],
    base_notes: ['Bois de Santal', 'Vanille', 'Vétiver'],
    description: 'Une fragrance d’une pureté éclatante alliant des notes florales blanches crémeuses à la douceur du santal.',
    image_file: '122200624040207032_2.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122200624040207032_2.jpg'
  },
  {
    id: 'rave-now-women',
    name: 'NOW WOMEN (Pink)',
    brand: 'Rave',
    tagline: 'Bonbon gourmand fruits rouges, guimauve & vanille',
    price: 20000,
    volume: '100 ml',
    family: 'gourmand',
    category_label: 'Eau de Parfum',
    badge: 'Coup de Cœur',
    top_notes: ['Fruits rouges', 'Orange pétillante'],
    heart_notes: ['Guimauve', 'Muguet', 'Jasmin'],
    base_notes: ['Vanille', 'Musc doux', 'Mousse'],
    description: 'Un délice sucré et féminin irrésistible de guimauve moelleuse et de baies rouges.',
    image_file: '122200624040207032_3.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122200624040207032_3.jpg'
  },

  // --- PRADA ---
  {
    id: 'prada-la-femme-intense',
    name: 'LA FEMME PRADA INTENSE',
    brand: 'Prada',
    tagline: 'Opulence florale tubéreuse sensuelle, ylang-ylang & patchouli',
    price: 80000,
    volume: '100 ml',
    family: 'floral',
    category_label: 'Eau de Parfum Intense',
    badge: 'Luxe',
    top_notes: ['Frangipanier', 'Ylang-ylang'],
    heart_notes: ['Absolu de tubéreuse', 'Fleur d’oranger', 'Jasmin Sambac'],
    base_notes: ['Patchouli', 'Vétiver', 'Vanille', 'Iris'],
    description: 'La quintessence du luxe milanais. Une tubéreuse enivrante rehaussée de fleurs solaires et d’une vanille précieuse.',
    image_file: '122200626116207032_1.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122200626116207032_1.jpg'
  },
  {
    id: 'prada-la-femme',
    name: 'LA FEMME PRADA',
    brand: 'Prada',
    tagline: 'Élégance intemporelle frangipanier, miel doré & iris',
    price: 95000,
    volume: '100 ml',
    family: 'floral',
    category_label: 'Eau de Parfum',
    badge: 'Luxe',
    top_notes: ['Frangipanier', 'Miel'],
    heart_notes: ['Tubéreuse', 'Ylang-ylang'],
    base_notes: ['Vétiver', 'Vanille'],
    description: 'Un parfum solaire et soyeux dans son flacon doré habillé de cuir saffiano blanc.',
    image_file: '122200626116207032_2.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122200626116207032_2.jpg'
  },
  {
    id: 'prada-l-homme',
    name: 'L’HOMME PRADA',
    brand: 'Prada',
    tagline: 'Raffinement absolu iris poudré, néroli, ambre & cèdre',
    price: 75000,
    volume: '100 ml',
    family: 'boise',
    category_label: 'Eau de Toilette',
    badge: 'Luxe',
    top_notes: ['Néroli', 'Poivre noir', 'Cardamome'],
    heart_notes: ['Iris précieux', 'Violette', 'Géranium'],
    base_notes: ['Ambre', 'Bois de cèdre', 'Patchouli'],
    description: 'L’incarnation de l’homme moderne élégant. Une signature propre, poudrée et noble inégalée.',
    image_file: '122200626116207032_3.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122200626116207032_3.jpg'
  },

  // --- ARMAF ---
  {
    id: 'armaf-club-de-nuit-intense-man',
    name: 'CLUB DE NUIT INTENSE MAN',
    brand: 'Armaf',
    tagline: 'Légende masculine citron vif, ananas fumé & bouleau',
    price: 25000,
    volume: '105 ml',
    family: 'boise',
    category_label: 'Eau de Toilette',
    badge: 'Bestseller',
    top_notes: ['Citron', 'Ananas', 'Bergamote', 'Cassis', 'Pomme'],
    heart_notes: ['Bouleau', 'Jasmin', 'Rose'],
    base_notes: ['Musc', 'Ambre gris', 'Patchouli', 'Vanille'],
    description: 'Le parfum masculin culte connu pour son sillage puissant et sa fraîcheur boisée séductrice.',
    image_file: '122200648058207032_1.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122200648058207032_1.jpg'
  },
  {
    id: 'armaf-club-de-nuit-woman',
    name: 'CLUB DE NUIT WOMAN',
    brand: 'Armaf',
    tagline: 'Féminité séduisante rose poudrée, litchi, agrumes & vanille',
    price: 25000,
    volume: '105 ml',
    family: 'floral',
    category_label: 'Eau de Parfum',
    badge: 'Coup de Cœur',
    top_notes: ['Orange', 'Bergamote', 'Pamplemousse', 'Pêche'],
    heart_notes: ['Rose', 'Jasmin', 'Géranium', 'Litchi'],
    base_notes: ['Patchouli', 'Vanille', 'Musc', 'Vétiver'],
    description: 'Une composition féminine sophistiquée aux accents floraux et fruités envoûtants.',
    image_file: '122200648058207032_2.jpg',
    image_local_path: '/data/data/com.termux/files/home/atelier/mgperfume-website/data/images/122200648058207032_2.jpg'
  }
];

// Fusionner en évitant les doublons
const fullCatalog = [...certifiedCatalog];

newQualifiedProducts.forEach(newP => {
  const existingIdx = fullCatalog.findIndex(p => p.id === newP.id || p.name.toLowerCase() === newP.name.toLowerCase());
  if (existingIdx >= 0) {
    fullCatalog[existingIdx] = newP;
  } else {
    fullCatalog.push(newP);
  }
});

console.log(`✅ Total des produits authentifiés : ${fullCatalog.length} produits certifiés.`);
fs.writeFileSync('/data/data/com.termux/files/home/atelier/mgperfume-website/data/products_certified_vision.json', JSON.stringify(fullCatalog, null, 2));
