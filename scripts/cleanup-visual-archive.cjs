const fs = require('fs');
const path = require('path');

const trackerPath = path.join(__dirname, '../data/DATABASE_TRACKER.json');
let tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));

// 1. Fix Khamrah image URL
const khamrah = tracker.find(p => p.id === 'lattafa-khamrah');
if (khamrah) {
  khamrah.image = 'https://xnmolqmcfnjvcblizahu.supabase.co/storage/v1/object/public/products/122201872976207032_1.jpg';
  console.log('Fixed lattafa-khamrah image URL to correct path.');
}

// 2. Define IDs to purge
const idsToPurge = new Set([
  'archived-img-4',  // Sentir Féminine multi-grid category banner
  'archived-img-5',  // Duplicate of active lattafa-eclaire
  'archived-img-6',  // Duplicate of active lattafa-khamrah
  'archived-img-7',  // Olfactory dupe comparison graphic (Teriaq vs Angel)
  'archived-img-10', // Mixed feminine perfume grid banner
  'archived-img-11', // Ordering guide infographic Step 1
  'archived-img-13', // General brand couple campaign banner
  'archived-img-15', // Usage tips instructional graphic
  'archived-img-16', // Oil collection group collage
  'archived-img-18', // Influencer selfie without product bottle hero
  'archived-img-23', // Oil collection promo collage
  'archived-img-25', // Duplicate of active afnan-9pm-rebel
  'archived-img-26', // Duplicate of active afnan-9pm-elixir
  'archived-img-28', // Oil collection marketing graphic
  'archived-img-43', // Kayali & MG shopping bag combo graphic
  'archived-img-44', // Unmapped WhatsApp image file (0-WA0014)
  'archived-img-45'  // test.jpg
]);

// 3. Define accurate metadata for the 28 eligible archived bottle images
const metadataMap = {
  'archived-img-1': {
    name: 'Bloom Bloom (Coffret Gift Box)',
    brand: 'Maison Asrar',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Maison Asrar",
    badge: 'Coffret Prestige',
    description: "Ensemble cadeau luxueux Bloom Bloom par Maison Asrar, présenté dans son coffret floral d'exception."
  },
  'archived-img-2': {
    name: 'Leila (Coffret Gift Box)',
    brand: 'Maison Asrar',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Maison Asrar",
    badge: 'Coffret Prestige',
    description: "Coffret d'exception Leila par la maison de haute parfumerie orientale Maison Asrar."
  },
  'archived-img-3': {
    name: 'La Rose Bleu (Niche Edition)',
    brand: 'Maison Massimo Paris',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Maison Massimo Paris",
    badge: 'Édition Niche',
    description: "Création raffinée La Rose Bleu en flacon sérigraphié et coffret d'écrin par Maison Massimo Paris."
  },
  'archived-img-8': {
    name: 'Shaghaf Vanilla Toffee',
    brand: 'Swiss Arabian',
    volume: '75 ml',
    tagline: "Sillage d'exception & notes nobles par Swiss Arabian",
    badge: 'Gourmand Niche',
    description: "Eau de parfum gourmande aux notes de vanille crémeuse et toffee caramélisé par Swiss Arabian."
  },
  'archived-img-9': {
    name: 'Teriaq (Édition Flacon Studio)',
    brand: 'Lattafa',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Lattafa",
    badge: 'Signature Oriental',
    description: "Flacon d'exception Teriaq par Lattafa, immortalisé en studio avec ses ingrédients précieux."
  },
  'archived-img-12': {
    name: 'Merveille',
    brand: 'La Folie des Délices',
    volume: '50 ml',
    tagline: "Sillage d'exception & notes nobles par La Folie des Délices",
    badge: 'Extrait de Parfum',
    description: "Extrait de parfum concentré Merveille par La Folie des Délices."
  },
  'archived-img-14': {
    name: 'Rose Désir (Édition 50ml)',
    brand: 'MG Perfume',
    volume: '50 ml',
    tagline: "Sillage d'exception & notes nobles par MG Perfume",
    badge: 'Flacon Signature',
    description: "Flacon verre 50ml Rose Désir de la collection privée MG Perfume."
  },
  'archived-img-17': {
    name: "N'Aimez Que Moi (Flacon 30ml)",
    brand: 'MG Perfume',
    volume: '30 ml',
    tagline: "Sillage d'exception & notes nobles par MG Perfume",
    badge: 'Flacon Signature',
    description: "Flacon verre 30ml N'Aimez Que Moi de la maison MG Perfume."
  },
  'archived-img-19': {
    name: 'Un Amour (Flacon 50ml)',
    brand: 'MG Perfume',
    volume: '50 ml',
    tagline: "Sillage d'exception & notes nobles par MG Perfume",
    badge: 'Flacon Signature',
    description: "Flacon élégant 50ml Un Amour par MG Perfume."
  },
  'archived-img-20': {
    name: 'Rose Désir (Prestige 50ml)',
    brand: 'MG Perfume',
    volume: '50 ml',
    tagline: "Sillage d'exception & notes nobles par MG Perfume",
    badge: 'Flacon Signature',
    description: "Flacon d'écrin Rose Désir par MG Perfume."
  },
  'archived-img-21': {
    name: 'Musc (Étiquette Blanche 50ml)',
    brand: 'MG Perfume',
    volume: '50 ml',
    tagline: "Sillage d'exception & notes nobles par MG Perfume",
    badge: 'Flacon Signature',
    description: "Présentation épurée flacon Musc étiquette blanche par MG Perfume."
  },
  'archived-img-22': {
    name: 'Raheeq',
    brand: 'Nusuk',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Nusuk",
    badge: 'Prestige Oriental',
    description: "Flacon sculptural alvéolé orné de l'abeille dorée Raheeq par Nusuk."
  },
  'archived-img-24': {
    name: '9pm (Flacon Prestige)',
    brand: 'Afnan',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Afnan",
    badge: 'Best-Seller Oriental',
    description: "Flacon iconique 9pm par Afnan Perfumes."
  },
  'archived-img-27': {
    name: 'Royal Blend Nero',
    brand: 'French Avenue',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par French Avenue",
    badge: 'Haute Parfumerie',
    description: "Flacon cristal ambré et coffret Royal Blend Nero par French Avenue (Fragrance World)."
  },
  'archived-img-29': {
    name: 'Reef Summer',
    brand: 'Reef',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Reef",
    badge: 'Prestige Émirati',
    description: "Flacon avec étui d'écrin Reef Summer de la maison de luxe Reef Perfumes."
  },
  'archived-img-30': {
    name: 'Reef 11',
    brand: 'Reef',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Reef",
    badge: 'Prestige Émirati',
    description: "Flacon et packaging d'origine Reef 11 par Reef Perfumes."
  },
  'archived-img-31': {
    name: 'Reef 33',
    brand: 'Reef',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Reef",
    badge: 'Prestige Émirati',
    description: "Flacon emblématique et étui Reef 33 par Reef Perfumes."
  },
  'archived-img-32': {
    name: 'Hawas Ice',
    brand: 'Rasasi',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Rasasi",
    badge: 'Collection Hawas',
    description: "Flacon givré Hawas Ice par la célèbre maison Rasasi."
  },
  'archived-img-33': {
    name: 'Hawas Black',
    brand: 'Rasasi',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Rasasi",
    badge: 'Collection Hawas',
    description: "Flacon onyx Hawas Black par Rasasi."
  },
  'archived-img-34': {
    name: 'Hawas Diva',
    brand: 'Rasasi',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Rasasi",
    badge: 'Collection Hawas',
    description: "Flacon féminin d'exception Hawas Diva par Rasasi."
  },
  'archived-img-35': {
    name: 'Souvenir Desert Rose',
    brand: 'Afnan',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Afnan",
    badge: 'Collection Souvenir',
    description: "Flacon dôme d'art Souvenir Desert Rose par Afnan."
  },
  'archived-img-36': {
    name: 'Souvenir Lavande',
    brand: 'Afnan',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Afnan",
    badge: 'Collection Souvenir',
    description: "Flacon dôme d'art Souvenir Lavande par Afnan."
  },
  'archived-img-37': {
    name: 'Barakkat Gentle Gold',
    brand: 'Fragrance World',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Fragrance World",
    badge: 'Édition Prestige',
    description: "Flacon doré Barakkat Gentle Gold par Fragrance World."
  },
  'archived-img-38': {
    name: 'Barakkat Gentle Silver',
    brand: 'Fragrance World',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Fragrance World",
    badge: 'Édition Prestige',
    description: "Flacon argenté Barakkat Gentle Silver par Fragrance World."
  },
  'archived-img-39': {
    name: 'Emerald Oud',
    brand: 'Al Haramain',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Al Haramain",
    badge: 'Oud Collection',
    description: "Flacon précieux et coffret Emerald Oud par Al Haramain."
  },
  'archived-img-40': {
    name: 'Sapphire Oud',
    brand: 'Al Haramain',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Al Haramain",
    badge: 'Oud Collection',
    description: "Flacon bleu saphir et coffret Sapphire Oud par Al Haramain."
  },
  'archived-img-41': {
    name: 'Ameer Al Oudh (King of Oud)',
    brand: 'Lattafa',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Lattafa",
    badge: 'Oud Legend',
    description: "Flacon iconique Ameer Al Oudh King of Oud par Lattafa."
  },
  'archived-img-42': {
    name: 'Ameer Al Oudh Intense',
    brand: 'Lattafa',
    volume: '100 ml',
    tagline: "Sillage d'exception & notes nobles par Lattafa",
    badge: 'Oud Legend',
    description: "Flacon ambré Ameer Al Oudh Intense Oud par Lattafa."
  }
};

// Filter out purged entries and update remaining archived metadata
tracker = tracker.filter(p => !idsToPurge.has(p.id));

tracker.forEach(p => {
  if (metadataMap[p.id]) {
    Object.assign(p, metadataMap[p.id]);
    p.is_archived = true;
    p.price = 0;
  }
});

console.log('Cleaned tracker length:', tracker.length);
console.log('Active product count:', tracker.filter(p => !p.id.startsWith('archived-img-')).length);
console.log('Archived count:', tracker.filter(p => p.id.startsWith('archived-img-')).length);

fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2), 'utf8');
console.log('Saved updated DATABASE_TRACKER.json successfully.');
