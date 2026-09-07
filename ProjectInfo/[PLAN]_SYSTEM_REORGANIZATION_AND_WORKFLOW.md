# [PLAN] — Réorganisation Système & Workflow Agence

> **Document de référence permanent** — Ce plan est destiné à être lu par un agent IA en charge de l'exécution. Il définit les règles, les structures et les processus pour tous les projets futurs de l'agence.

---

## PARTIE 1 — STRUCTURE DE DOSSIERS INTELLIGENTE

### 1.1 — Principe Général

Chaque type d'actif a UN emplacement canonique. Pas de duplication, pas d'ambiguïté.

```
~/
├── website-template/               ← Template Next.js maître (NE PAS COMMITTER de code client ici)
├── <nomclient>-website/            ← Chaque projet client live dans ~/
│   └── (code source Next.js complet)
└── storage/shared/Documents/
    └── Clients/
        └── <NomClient>/           ← Tous les actifs non-code du client
            ├── Brand/             ← Logos, palettes, chartes graphiques
            ├── Stock-Images/      ← Photos réelles du client (produits, locaux)
            ├── Social-Screenshots/← Captures réseaux sociaux (REFERENCE UNIQUEMENT, jamais sur le site)
            ├── Notes/             ← Briefs, réunions, retours client
            └── CLIENT_BRIEF.md    ← Fiche client structurée (voir Section 2)
```

### 1.2 — Règle Absolue de Nommage

| Type d'actif | Convention de nom | Exemple |
|---|---|---|
| Dossier projet code | `<nomclient>-website` | `docteurcakes-website` |
| Dossier client (Documents) | `<Nom Complet Client>` | `Patisserie Docteur Cakes` |
| Repo GitHub | `Weshmorayy/<nomclient>-website` | `Weshmorayy/docteurcakes-website` |

### 1.3 — Index des Projets

Maintenir à jour le fichier `/data/data/com.termux/files/home/website-template/ProjectInfo/PROJECTS_INDEX.md` avec ce tableau :

| Client | Slug | Repo GitHub | Statut | Type | Date |
|---|---|---|---|---|---|
| Pâtisserie Docteur Cakes | docteurcakes | Weshmorayy/docteurcakes-website | ✅ En production | Vitrine | 2026-09 |
| Nouvelle Cosmétique Ivoirienne | nouvellecosmetique | Weshmorayy/nouvellecosmetique-website | ✅ En production | Boutique | 2026-09 |
| Maison Sy Traiteur | maitresy | Weshmorayy/maitresy-website | ✅ En production | Vitrine | 2026-08 |

---

## PARTIE 2 — COMMANDE TERMUX : `new-client`

### 2.1 — Emplacement du Script

```
~/bin/new-client
```
Rendu exécutable avec `chmod +x ~/bin/new-client`.

### 2.2 — Code du Script

```bash
#!/data/data/com.termux/files/usr/bin/bash
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🆕  NOUVEAU CLIENT — Weshmorayy Agence"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "📋 Nom complet du client (ex: Patisserie Docteur Cakes) : " CLIENT_NAME
if [ -z "$CLIENT_NAME" ]; then echo "❌ Le nom ne peut pas être vide."; exit 1; fi

CLIENT_SLUG=$(echo "$CLIENT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

read -p "🏷️  Secteur d'activité (ex: pâtisserie, cosmétique, traiteur) : " CLIENT_SECTOR

echo ""
echo "📦 Type de site :"
echo "  1) Vitrine simple"
echo "  2) Vitrine avec catalogue de services"
echo "  3) Boutique en ligne (e-commerce)"
read -p "Votre choix (1/2/3) : " SITE_TYPE

case $SITE_TYPE in
  1) SITE_TYPE_LABEL="Vitrine simple" ;;
  2) SITE_TYPE_LABEL="Vitrine avec catalogue" ;;
  3) SITE_TYPE_LABEL="Boutique en ligne" ;;
  *) SITE_TYPE_LABEL="À définir" ;;
esac

DOCS_BASE="$HOME/storage/shared/Documents/Clients/$CLIENT_NAME"
DATE_NOW=$(date +"%Y-%m-%d")

mkdir -p "$DOCS_BASE/Brand" "$DOCS_BASE/Stock-Images" "$DOCS_BASE/Social-Screenshots" "$DOCS_BASE/Notes"

cat > "$DOCS_BASE/CLIENT_BRIEF.md" << BRIEF_EOF
# Fiche Client — $CLIENT_NAME

> Créée le : $DATE_NOW
> Type de site : $SITE_TYPE_LABEL

---

## 1. Informations Générales

- **Nom** : $CLIENT_NAME
- **Secteur** : $CLIENT_SECTOR
- **Slug projet** : $CLIENT_SLUG
- **Type de site** : $SITE_TYPE_LABEL

## 2. Contact Client

- **Téléphone / WhatsApp** :
- **Email** :
- **Adresse** :

## 3. Réseaux Sociaux

- **Facebook** :
- **Instagram** :
- **WhatsApp Channel** :
- **Abonnés approx.** :

## 4. Identité Visuelle

- **Couleur principale** :
- **Couleur secondaire** :
- **Couleur d'accentuation** :
- **Logo fourni** : [ ] Oui  [ ] Non

## 5. Contenu & Services

### Services / Produits

### Tarification

### Zone de Service / Livraison

## 6. Paiements Acceptés

- [ ] Wave :
- [ ] MTN Mobile Money :
- [ ] Orange Money :
- [ ] Espèces :

## 7. Informations SEO

- **Ville principale** :
- **Quartiers cibles** :
- **Mots-clés métier** :

## 8. Exigences Spéciales & Notes

## 9. Historique du Projet

| Date | Événement |
|------|-----------|
| $DATE_NOW | Dossier client créé |
BRIEF_EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  Dossier client créé !"
echo ""
echo "📁 Emplacement : $DOCS_BASE"
echo ""
echo "📌 Prochaines étapes :"
echo "   1. Déposer logo dans       : Brand/"
echo "   2. Déposer photos produits : Stock-Images/"
echo "   3. Remplir                 : CLIENT_BRIEF.md"
echo "   4. Demander à l'IA de lire : CLIENT_BRIEF.md pour démarrer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

### 2.3 — Installation (une seule fois)

```bash
mkdir -p ~/bin
# Coller le script dans ~/bin/new-client puis :
chmod +x ~/bin/new-client
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

**Utilisation :** `new-client`

---

## PARTIE 3 — VARIÉTÉ DE DESIGNS : TAXONOMIE ET PROCESSUS DÉCISIONNEL

### 3.1 — Les 5 Fondations Visuelles

L'agent propose UNE fondation et attend confirmation avant de coder.

---

#### FONDATION A — "Prestige Sombre" (Dark Luxury)
**Identité :** Élégance nocturne, raffinement, clientèle premium.
**Palette type :** Noir profond + Or royal (#D4AF37) + Blanc cassé (sections alternées).
**Structure :**
1. Hero plein écran sombre + titre éditorial en Or
2. Section blanche : catalogue / cartes épurées
3. Section sombre : grande photo + bloc texte asymétrique
4. Section blanche : tarifs / commande
5. Footer noir
**Niches :** Pâtisserie haut de gamme, bijouterie, coiffure luxe, événementiel.
**Exemple :** Docteur Cakes ✅

---

#### FONDATION B — "Clarté Moderne" (Clean Light)
**Identité :** Franchise, accessibilité, santé.
**Palette type :** Blanc dominant + 1 couleur franche (bleu, vert, rouge) + gris chaud.
**Structure :**
1. Hero blanc avec grande photo lumineuse + badge coloré
2. Section gris clair : 2–3 avantages en mise en page éditoriale (pas 3 colonnes égales)
3. Section blanche : produits / services en grille asymétrique
4. Section couleur franche : CTA fort
5. Footer blanc ou gris
**Niches :** Santé, services aux particuliers, formation.

---

#### FONDATION C — "Chaleur Artisanale" (Artisan Warm)
**Identité :** Authenticité, terroir, fait-main, confiance locale.
**Palette type :** Crème/ivoire + Terre cuite ou olive + brun chaud.
**Structure :**
1. Hero avec texture subtile + photo authentique du client
2. Section crème : storytelling + grande photo éditoriale
3. Section terre cuite : produits en cards texturées
4. Section blanche : commande
5. Footer brun
**Niches :** Traiteur, restauration locale, artisanat, épicerie fine.

---

#### FONDATION D — "Urbain Audacieux" (Bold Urban)
**Identité :** Énergie, jeunesse, street credibility.
**Palette type :** Noir ou blanc fort + 1–2 couleurs ultra-vives + typo XXL.
**Structure :**
1. Hero avec typo XXL débordante, fond noir ou blanc
2. Produits : grille dense, cards aux couleurs franches différentes
3. Bande horizontale : chiffres clés ou valeurs
4. CTA pleine couleur (1 seul message, 1 seul bouton)
5. Footer minimal
**Niches :** Mode, sneakers, barbershop, boissons, jeunes adultes.

---

#### FONDATION E — "Luxe Minimal" (Minimal Luxury)
**Identité :** Raffinement discret, espace blanc, clientèle A+.
**Palette type :** Blanc dominant + neutre (taupe, sable) + noir pour typo.
**Structure :**
1. Hero quasi-vide : 1 phrase, 1 image en position absolue
2. Sections très aérées avec grands espaces blancs
3. Produits : 1 par ligne avec grande photo, description en regard
4. Témoignages : citations simples, sans avatar
5. Footer minimaliste
**Niches :** Joaillerie, parfumerie, architecte, cosmétique haut de gamme.

---

### 3.2 — Processus de Choix

```
Nouveau client reçu
        │
        ▼
Lire CLIENT_BRIEF.md
        │
        ▼
Évaluer : secteur + audience + palette souhaitée
        │
        ├── Même niche qu'un projet existant ?
        │       └── Obligatoire : choisir une FONDATION DIFFÉRENTE
        │
        └── Niche nouvelle ?
                └── Choisir la fondation la plus adaptée
        │
        ▼
PROPOSER à l'USER (format obligatoire) :
"Je propose la Fondation X car [raison en 2 phrases].
Structure envisagée : Hero → [section1] → [section2] → ...
Palette : [couleur1], [couleur2], [couleur3].
Je confirme et attends ton accord avant de commencer."
        │
        ├── USER dit OK → Coder
        └── USER dit NON → Demander ce qu'il préfère
```

### 3.3 — Patterns Interdits (Anti-Répétition)

| ❌ Interdit | ✅ Alternative |
|---|---|
| 3 cartes exactement égales en colonnes | Grille asymétrique (2/3 + 1/3) ou liste éditoriale |
| FAQ accordéon systématique | Questions intégrées dans le corps des sections |
| Badge "pillule" flottant sur le Hero | Surtitre en petites capitales ou sous-titre en retrait |
| Section Contact formulaire centré seul | Fusionner dans footer ou Info Pratique |
| `from-indigo-500 to-purple-600` | Couleurs custom avec CSS variables client |
| `backdrop-blur` sur toutes les cards | Réservé à 1 élément max par page |

---

## PARTIE 4 — TEMPLATE E-COMMERCE

### 4.1 — Philosophie

Priorité : expérience mobile, rapidité, commande en 3 taps.
Phase 1 = 100% statique. Phase 2 = Medusa (uniquement si approuvé).

### 4.2 — Stack

| Besoin | Solution | Raison |
|---|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind | Cohérence template maître |
| Catalogue (phase 1) | `products[]` dans `site.ts` | Zéro backend |
| Panier (phase 1) | `localStorage` + React state | Simple, mobile-first |
| Commande (phase 1) | WhatsApp deep-link + formulaire HTML | Zéro serveur |
| Backend (phase 2) | **Medusa.js** sur VPS Hostinger Docker | Open-source, auto-hébergeable |

> ⚠️ Phase 2 (Medusa) déclenchée UNIQUEMENT après accord explicite du USER.

### 4.3 — Sections Standard E-Commerce

| Section | Rôle |
|---|---|
| `Hero.tsx` | Identité marque + CTA "Voir les produits" |
| `Store.tsx` | Grille produits — card image + nom + prix + "Ajouter" |
| `ProductModal.tsx` | Modal détail produit (description, ingrédients, tailles) |
| `Cart.tsx` | Panier flottant (drawer latéral mobile) |
| `QuickOrder.tsx` | Formulaire commande → bouton WhatsApp + formulaire normal |
| `ShippingInfo.tsx` | Livraison, paiements, délais |

### 4.4 — SiteConfig Shape E-Commerce

```typescript
interface ProductItem {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number            // FCFA (entier)
  originalPrice?: number   // Prix barré si promo
  currency: 'FCFA'
  unit?: string            // ex: "750ml"
  category: string
  images: string[]         // public/images/products/
  inStock: boolean
  featured?: boolean
  ingredients?: string[]
  variants?: ProductVariant[]
}

interface ProductVariant {
  id: string
  name: string
  price: number
  inStock: boolean
}

interface ShippingZone {
  name: string
  price: number
  delay: string
}

// Dans SiteConfig :
products: ProductItem[]
shipping: {
  zones: ShippingZone[]
  freeThreshold?: number
}
```

### 4.5 — Fonction WhatsApp Standard

```typescript
// src/lib/whatsapp.ts
export function buildWhatsAppOrderUrl(
  phone: string,
  items: CartItem[],
  zone: ShippingZone,
  total: number
): string {
  const lines = items.map(
    (item) => `• ${item.name} x${item.qty} — ${(item.price * item.qty).toLocaleString('fr-FR')} FCFA`
  )
  const message = [
    '🛍️ *Nouvelle Commande*', '',
    ...lines, '',
    `📦 Livraison : ${zone.name} — ${zone.price > 0 ? zone.price.toLocaleString('fr-FR') + ' FCFA' : 'Gratuite'}`,
    `💰 *Total : ${total.toLocaleString('fr-FR')} FCFA*`, '',
    'Merci de confirmer ma commande 🙏',
  ].join('\n')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
```

---

## PARTIE 5 — RÈGLES ANTI-IA INTÉGRÉES

### 5.1 — Référence Complète

Lire : `ProjectInfo/SpecialGuides/[GUIDE]_AVOIDING_AI_LOOK_AND_FEEL.md`

### 5.2 — Checklist Obligatoire (Avant tout commit)

#### Design
- [ ] Chaque section a un fond différent de la précédente (rythme obligatoire)
- [ ] Aucun texte sombre sur fond sombre
- [ ] Cartes de tailles et dispositions variées (pas 3 colonnes égales partout)
- [ ] Typographie avec hiérarchie marquée
- [ ] Aucun dégradé générique Tailwind (`from-indigo-500`)
- [ ] Photos réelles uniquement — jamais de screenshots de réseaux sociaux

#### Copywriting
- [ ] Aucun mot de la blacklist (`révolutionnaire`, `transcender`, `synergie`…)
- [ ] Chaque prix est précis et en FCFA
- [ ] Lieux réels mentionnés (quartier, ville)
- [ ] Moyens de paiement réels listés (Wave, MTN, Orange Money)
- [ ] Langue naturelle et prononçable à voix haute

#### Code
- [ ] `src/config/site.ts` est l'unique source de vérité
- [ ] Pas de `'use client'` inutile
- [ ] `next build` passe sans erreur TypeScript
- [ ] Tous les `alt` des images sont descriptifs

### 5.3 — Blacklist de Mots Interdits

```
révolutionnaire / transcender / redéfinir / immersion / catalyseur
synergie / excellence sans compromis / voyage sensoriel
plongez dans l'univers / laissez-vous transporter
à la pointe de la technologie / dans un monde en constante évolution
que vous soyez X ou Y / de plus / en outre / en conclusion
Notre passion culinaire élève...
```

### 5.4 — Test de l'Authenticité

> *"Est-ce qu'un vrai commerçant ivoirien enverrait ce message à un client sur WhatsApp ?"*
> Si **non** → réécrire.

---

## PARTIE 6 — WORKFLOW COMPLET D'UN NOUVEAU PROJET

```
ÉTAPE 0 : Créer le dossier client
  └── Exécuter : new-client
  └── Remplir : Documents/Clients/<NomClient>/CLIENT_BRIEF.md
  └── Déposer logo et photos dans Brand/ et Stock-Images/

ÉTAPE 1 : Analyse et Proposition de Design
  └── L'IA lit CLIENT_BRIEF.md
  └── L'IA propose : Fondation + Structure des sections + Palette exacte
  └── L'IA ATTEND la confirmation USER ← OBLIGATOIRE

ÉTAPE 2 : Choix du template
  ├── Vitrine     → Dupliquer ~/website-template
  └── E-commerce  → Dupliquer ~/website-ecommerce-template

ÉTAPE 3 : Initialisation
  └── cp -r ~/website-template ~/<nomclient>-website
  └── cd ~/<nomclient>-website && npm install
  └── Configurer site.ts et globals.css

ÉTAPE 4 : Développement
  └── Coder chaque section selon la fondation choisie
  └── Vérifier checklist anti-IA après chaque section

ÉTAPE 5 : Build et vérification
  └── NEXT_OUTPUT=export node ./node_modules/next/dist/bin/next build
  └── node ./node_modules/typescript/bin/tsc --noEmit

ÉTAPE 6 : Push GitHub et ARRÊT
  └── git init && git add . && git commit -m "feat: initial static build"
  └── gh repo create Weshmorayy/<nomclient>-website --public --source=. --remote=origin --push
  └── ⛔ ARRÊTER — Attendre validation client

ÉTAPE 7 : Itérations (si nécessaire)
  └── Appliquer uniquement les retours listés par le USER
  └── Ne pas réécrire ce qui n'a pas été demandé

ÉTAPE 8 : Déploiement
  └── Voir DEPLOYMENT_GUIDE.md
```

### Règles d'Or Agent ↔ USER

1. **Toujours proposer avant d'agir** sur le design
2. **Jamais commiter dans `~/website-template`**
3. **Toujours arrêter après le push GitHub** initial
4. **Jamais ajouter de fonctionnalités non demandées**
5. **Toujours vérifier le build** avant de déclarer terminé

---

## ANNEXE A — Commandes Rapides

```bash
new-client                                                          # Créer dossier client
cp -r ~/website-template ~/<nom>-website                           # Dupliquer template
cd ~/<nom>-website && npm install                                   # Installer deps
npm run dev                                                         # Dev server
NEXT_OUTPUT=export node ./node_modules/next/dist/bin/next build    # Build statique
node ./node_modules/typescript/bin/tsc --noEmit                    # Vérif TypeScript
gh repo create Weshmorayy/<nom>-website --public --source=. --remote=origin --push
```

## ANNEXE B — Variables CSS par Fondation

```css
/* A — Prestige Sombre */
--color-bg-primary: #0D0B09;
--color-bg-secondary: #FFFFFF;
--color-accent: #D4AF37;

/* B — Clarté Moderne */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F1F5F9;
--color-accent: #1D4ED8;

/* C — Chaleur Artisanale */
--color-bg-primary: #FDF6EC;
--color-bg-secondary: #FFFFFF;
--color-accent: #C2713A;

/* D — Urbain Audacieux */
--color-bg-primary: #0A0A0A;
--color-accent-1: #F97316;
--color-accent-2: #EF4444;

/* E — Luxe Minimal */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F5F0EB;
--color-accent: #B8A98A;
```

---

*Dernière mise à jour : 2026-09-07*
*Maintenu par : Agence Weshmorayy*
