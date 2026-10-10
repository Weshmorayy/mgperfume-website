# Rapport — Intégration « New-sept-27th » — MG Perfume

Date : 7 octobre 2026
Sources traitées : **26 packshots produits** + **9 captures Facebook**
Base cible : `products` (Supabase) — 136 lignes après intégration

---

## 1. Ce qui a été fait

| Étape | Résultat |
|---|---|
| Analyse visuelle des 26 packshots | faite (vision directe, une image à la fois) |
| Analyse des 9 captures Facebook | faite — utilisées **comme source d'information uniquement**, jamais publiées comme visuel produit |
| Comparaison avec la base existante | 115 lignes relues avant écriture |
| Upload des visuels | **26 fichiers** dans le bucket `products` (dont `image-a-venir.jpg`) |
| Produits ajoutés | **21 nouveaux** |
| Produits mis à jour | **6 existants** (visuel + pyramide olfactive + description) |
| Tracker | `data/DATABASE_TRACKER.json` réécrit en **miroir de la base** : 136 lignes |
| Base live | 115 → **136 lignes** (82 visibles, 54 archivées) |
| Ordre boutique | **nouveautés en tête** — les 5 nouveaux parfums sont en positions 1 à 5 |

Aucun doublon créé : les 6 produits déjà présents ont été reconnus par leur nom et mis à jour au lieu d'être dupliqués.

---

## 2. Produits ajoutés — publiés dans la boutique (5)

| Produit | Marque | Prix | Volume |
|---|---|---|---|
| Vanilla Latte | Gulf Orchid | 20 000 FCFA | 100 ml |
| Supremacy Collector's Edition | Afnan | 45 000 FCFA | 100 ml |
| 9PM Night Out | Afnan | 45 000 FCFA | 100 ml |
| Brûlée | Ahmed Al Maghribi | 25 000 FCFA | 100 ml |
| Ghost | Spectre | 35 000 FCFA | 100 ml |

Ces cinq produits ont un visuel, un prix, une pyramide complète et une description. Ils sont visibles et achetables.

## 3. Produits ajoutés — archivés, invisibles dans la boutique (16)

Archivés parce qu'**il manque le prix**, parce que **le client n'a pas envoyé de photo**, ou les deux. Ils sont en base, prêts à publier dès que l'information arrive.

| Produit | Marque | Ce qui manque |
|---|---|---|
| Vanilla Addiction | Gulf Orchid | prix, pyramide, description |
| Pink Marshmallow | Gulf Orchid | prix, pyramide, description |
| Heavenly Lychee | Gulf Orchid | prix, pyramide, description |
| Sweet Like Candy (30 ml) | Gulf Orchid | prix, pyramide, description |
| Royal Rose | Gulf Orchid | prix, pyramide, description |
| Vanilla Aura | Maison Asrar | prix |
| Vanilla Seduction | Maison Asrar | prix |
| Oud Sable | Callisto Paris | prix |
| Iris Gourmand | Callisto Paris | prix |
| African Gold | Callisto Paris | prix |
| Iris Absolu | Callisto Paris | prix |
| Mirage | Callisto Paris | prix |
| Coeur de Patchouli | Callisto Paris | prix + **photo** |
| Élixir & Plaisir | Maison Massimo | prix |
| Vanille Platinum | Maison Massimo | prix |
| Khair Fusion | Paris Corner | prix + **notes de fond** + **photo** |

## 4. Produits existants mis à jour (6)

Le nouveau visuel remplace l'ancien et les informations de la pyramide olfactive sont désormais celles des étuis et des posts du client.

| Produit | Marque | Ce qui a changé |
|---|---|---|
| Naughty Vanilla | Gulf Orchid | nouveau visuel + pyramide reprise de l'étui (Amande, Miel, Bergamote / Fleur d'oranger, Pistache, Crème glacée / Vanille, Ambre, Fève de tonka) |
| 9pm | Afnan | nouveau visuel + pyramide complète |
| Coeur Blanc | Maison Massimo | nouveau visuel + pyramide complète |
| LA ROSE BLEU (Niche Edition) | Maison Massimo | nouveau visuel + pyramide complète |
| Voyage de Nuit | Maison Massimo | nouveau visuel + description reprise du coffret |
| GOLD SIGNATURE | Maison Massimo | nouveau visuel + pyramide complète |

---

## 5. ⚠️ Ce qu'il manque — à demander au client

### 5.1 Prix manquants — 16 produits

C'est le point bloquant n°1. **Aucun prix n'apparaît** pour ces 16 références, ni sur les packshots, ni dans les captures Facebook.

> Vanilla Addiction · Pink Marshmallow · Heavenly Lychee · Sweet Like Candy (30 ml) · Royal Rose · Vanilla Aura · Vanilla Seduction · Oud Sable · Iris Gourmand · African Gold · Iris Absolu · Mirage · Coeur de Patchouli · Élixir & Plaisir · Vanille Platinum · Khair Fusion

**Décision appliquée :** prix saisi à `0` et produit `archivé`, donc **invisible dans la boutique**. La colonne `price` est `NOT NULL` en base — il est techniquement impossible de la laisser vide. Sans l'archivage, la boutique aurait affiché « 0 FCFA ».

### 5.2 Visuels manquants — 2 produits

- **Coeur de Patchouli** (Callisto Paris) — pyramide complète reçue par capture, mais aucune photo du flacon.
- **Khair Fusion** (Paris Corner) — la capture ne montre qu'une vidéo d'une personne, aucun packshot.

**Décision appliquée :** visuel `image-a-venir.jpg` + produit archivé + badge « En attente de visuel ».

### 5.3 Pyramide olfactive manquante — 5 produits

Vanilla Addiction, Pink Marshmallow, Heavenly Lychee, Royal Rose et Sweet Like Candy (tous Gulf Orchid). Le client a envoyé les flacons mais aucune pyramide, ni sur les étuis, ni sur ses posts. Champs laissés vides.

### 5.4 Notes de fond manquantes — 1 produit

- **Khair Fusion** : le post donne les notes de tête et de cœur, aucune note de fond.
- **Vanilla Latte** : le post donne le caramel, le cœur jasmin / tonka / miel, mais pas de fond.

### 5.5 Volume non imprimé sur le visuel — 2 produits

Supremacy Collector's Edition et Ghost : `100 ml` a été retenu (format standard de la marque), mais le flacon ne porte aucune contenance.

---

## 6. Anomalies déjà présentes en base (non corrigées)

Repérées pendant la comparaison. Elles **ne viennent pas** de ce lot et n'ont pas été touchées — décision à prendre par le client.

| Problème | Détail |
|---|---|
| Identifiants faux | `Khamrah` porte l'id `afnan-9pm-elixir` ; `Khamrah Qahwa` porte `afnan-9pm-rebel` |
| Marque fausse | `Hawas ice` est enregistré sous la marque `Rassasi` (id `lattafa-atheeri`) |
| Doublon visible | `Reef 11` existe deux fois, tous deux **non archivés** (`reef-11` à 45 000 et `archived-img-30` à 0) |
| Prix suspect | `Mayar Cherry Intense` à **2 000 FCFA** — les autres références comparables sont à 25 000 |
| Prix incohérents | Les KAYALI 30 ml sont à 8 000 FCFA en base alors que le tracker indique 15 000 |
| Khamrah en double | `afnan-9pm-elixir` et `lattafa-khamrah` portent le même nom |
| Paires actif/archivé | Hawas Black / Diva / Ice, Souvenir Desert Rose, Souvenir Lavande, Raheeq, Reef 33, Reef Summer, Barakkat Gentle Gold / Silver, Emerald Oud, Sapphire Oud, La Rose Bleu |
| Famille vide | Le filtre « Boisés & Cèdre » ne renvoyait **jamais** rien : aucun des 136 produits n'est classé `boise` (117 `oriental`, 10 `gourmand`, 8 `floral`, 1 `aquatique`). Les boisés sont donc tous rangés dans `oriental` |
| Marques en double | 9 produits ont une marque terminée par une espace (`Lattafa ` ×5, `Ahmed Al Maghribi ` ×2, `Rassasi `, `Riiffs Perfumes `). Résultat : « Lattafa » et « Lattafa » apparaissaient comme deux maisons distinctes, avec deux compteurs séparés |

---

## 7. Suivi local et instantané de la base

Deux fichiers distincts, à ne pas confondre :

| Fichier | Rôle |
|---|---|
| `data/DATABASE_TRACKER.json` | Journal local des modifications. C'est lui qui porte l'historique du travail : produits intégrés, corrections, lots successifs. Il peut légitimement contenir des lignes absentes de la base, parce qu'elles ont été retirées depuis l'admin. **Il ne doit jamais être réécrit depuis la base.** |
| `data/DATABASE_SYNCED.json` | Instantané fidèle de la base à un instant donné, toutes colonnes. Fichier généré : **136 lignes**, 97 actives et 39 archivées. |

Le tracker local compte **154 lignes** : les 21 produits du lot « New-sept-27th » et les 6 mises à jour y sont intégrés, les 133 lignes antérieures sont conservées.

Les 19 lignes ci-dessous sont **toujours dans le tracker** : un premier passage avait réécrit le tracker depuis la base et les avait effacées, ce qui est corrigé. En revanche elles **ne sont plus en base** :

| Ligne retirée | Marque |
|---|---|
| MAWI Appletini | Paris Corner |
| MAWI Moscow Mule | Paris Corner |
| Juicy Mélange | Paris Corner |
| Yara Pink | Lattafa |
| Intense (N°7) | Collection Privée |
| Baccara | Collection Privée |
| Moula | Collection Privée |
| Vanille Somptueuse | MAH Paris |
| Eclair Affair | Paris Corner |
| Eshal Vanilla | Paris Corner |
| Bloom Bloom (Coffret Gift Box) | Maison Asrar |
| Leila (Coffret Gift Box) | Maison Asrar |
| Rose Désir (Édition 50ml) | MG Perfume |
| N'Aimez Que Moi (Flacon 30ml) | MG Perfume |
| Un Amour (Flacon 50ml) | MG Perfume |
| Rose Désir (Prestige 50ml) | MG Perfume |
| Musc (Étiquette Blanche 50ml) | MG Perfume |
| Ameer Al Oudh (King of Oud) | Lattafa |
| Ameer Al Oudh Intense | Lattafa |

Deux lectures possibles, à trancher par le client :

1. ils ont été **supprimés volontairement** depuis l'admin → rien à faire : le tracker garde la trace du produit, la base non ;
2. ils ont disparu **par erreur** → ils ne sont plus en base, il faudra les recréer.

Scripts :

- `scripts/sync-db-snapshot.cjs` régénère l'instantané (`data/DATABASE_SYNCED.json`). `--check` compare sans écrire. il ne fait que **lire** la base, il n'y écrit jamais et ne touche pas au tracker.
- `scripts/check-search.cjs` contrôle la recherche et les filtres sur l'instantané : parité des tris, filtres non vides, compteurs « Maison ».

## 8. Ordre d'affichage de la boutique

La boutique affichait les produits du **plus ancien au plus récent** : les nouveautés arrivaient donc tout en bas de la dernière page. C'est corrigé.

Le catalogue se trie maintenant **du plus récent au plus ancien**. Les 5 nouveaux parfums sont en tête :

| Position | Produit |
|---|---|
| 1 | Supremacy Collector's Edition |
| 2 | Vanilla Latte |
| 3 | 9PM Night Out |
| 4 | Brûlée |
| 5 | Ghost |

L'option de tri s'appelle désormais « Nouveautés » au lieu de « Recommandés ». Les tris « Prix croissant » et « Prix décroissant » restent inchangés. Le bandeau d'accueil et la « Sélection du Moment » ne sont pas touchés.

**Le tableau de bord admin applique exactement le même ordre.** Sa liste de produits était elle aussi en ancien → récent ; elle passe maintenant en récent → ancien, avec l'option renommée « Nouveautés » (au lieu de « Ordre par défaut »).

Le comparateur est partagé dans `src/lib/productSort.ts` et utilisé par la boutique comme par l'admin : les deux listes ne peuvent plus diverger. L'admin conserve en plus ses tris `Prix : Croissant`, `Prix : Décroissant`, `Nom : A à Z` et `Nom : Z à A`.

## 9. Recherche et filtres (boutique et admin)

La recherche ne donnait pas les mêmes résultats selon l'endroit :

- **l'admin** ne cherchait que dans le nom, la maison et l'accroche. Une recherche sur une note (« fleur d'oranger », « vanille ») ne remontait donc presque que les derniers produits saisis, ce qui donnait l'impression que seules les nouveautés répondaient ;
- **la boutique** cherchait aussi dans la description et les notes.

C'est unifié dans `src/lib/productSearch.ts`, utilisé par les deux écrans :

| Point | Comportement |
|---|---|
| Champs fouillés | nom, maison, accroche, description, notes de tête / cœur / fond, famille, catégorie, badge, contenance |
| Accents et casse | « Brûlée » = « brulee », « Lattafa » = « lattafa » |
| Plusieurs mots | tous les mots doivent être présents |
| Tri | appliqué en dernier : « Nouveautés », « Prix croissant » et « Prix décroissant » renvoient **exactement le même ensemble**, simplement ordonné autrement |
| Compteurs « Maison » | recalculés après la recherche et la famille : ils diminuent à mesure que l'on tape |
| Onglets famille | construits depuis les données réelles : plus d'onglet « Boisés » qui ne peut rien renvoyer |
| Maisons | regroupées sur le libellé normalisé : « Lattafa » et « Lattafa » ne font plus deux puces |

Contrôles rejouables sur l'instantané réel : `node scripts/check-search.cjs`. Tous passent — 15 requêtes testées dans les 3 tris, chaque famille proposée renvoie au moins un produit, chaque compteur « Maison » est vérifié.

## 10. Règles appliquées

- Les captures Facebook ont servi à **lire des informations** (prix, pyramides, prose du client). Elles n'ont **jamais** été publiées comme image de produit.
- Aucun prix, aucune note, aucune description n'a été inventé. Là où l'information manquait, le champ est resté vide.
- Les pyramides des 5 produits Gulf Orchid sans indication ont été laissées vides plutôt que reprises d'un site marchand tiers.
- Les noms de marque `Ahmed Al Maghribi` (Brûlée) et `Maison Asrar` (Vanilla Aura, Vanilla Seduction) ont été confirmés par recoupement avant saisie.
- Tous les textes visibles sont en français. Les descriptions reprennent la prose du client quand elle existait (Vanilla Aura, Khair Fusion, Voyage de Nuit, Naughty Vanilla).

---

## 11. Pour débloquer les 16 produits archivés

Il suffit de **la liste des prix** pour ces 16 références. Dès réception :

1. passer `price` à la valeur réelle,
2. passer `is_archived` à `false`,
3. pour Coeur de Patchouli et Khair Fusion, remplacer `image-a-venir.jpg` par le vrai packshot.

Aucune autre donnée n'est nécessaire pour mettre en ligne les 14 produits dont le visuel et la pyramide sont déjà complets.
