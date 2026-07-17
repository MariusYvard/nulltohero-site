# Audit SEO complet, nulltohero.netlify.app

> **Ce rapport est l'état AVANT correction, conservé tel quel.** Les 18 points ont été
> traités le 17/07/2026 : voir `ACTION-PLAN.md` pour ce qui a été fait, ce qui a été fait
> autrement et pourquoi, et le seul point resté partiel (l'appariement des métriques de
> police). Les constats ci-dessous décrivent le commit `c3e8603`, plus le code actuel.

Date : 17/07/2026. Commit audité : `c3e8603` (version en ligne). Plugin v1.39.0.

Méthode : cinq spécialistes en parallèle (technique, contenu, schema, performance, GEO), agrégés selon les sept poids du protocole. Le site est un export statique Next.js (`output: "export"`), donc `out/` est exactement ce que Netlify sert : les constats sont lus sur le fichier livré, pas sur une intention de code.

Deux réserves de couverture, énoncées d'emblée. La dimension performance a été mesurée à la main après trois échecs réseau de l'agent (le VPN de la machine coupait l'API), avec les mêmes poids. Et aucune donnée de terrain Core Web Vitals n'a été relevée : les constats de performance sont statiques (poids, gating, stratégie de police), pas des LCP ou INP observés.

## Score de santé SEO : 62/100

| Dimension | Poids | Score | Contribution |
|---|---|---|---|
| Technique | 22% | 71 | 15,62 |
| Qualité de contenu | 23% | 59 | 13,57 |
| On-page | 20% | 49 | 9,80 |
| Schema | 10% | 51 | 5,10 |
| Performance | 10% | 71 | 7,10 |
| Recherche IA (GEO) | 10% | 60 | 6,00 |
| Images | 5% | 95 | 4,75 |
| **Total** | 100% | | **61,94, arrondi à 62** |

Type détecté : site produit d'un outil pour développeurs, mono-produit, gratuit, auteur unique. Trois pages : `/`, `/journey/`, `/commands/`.

Le score se recalcule à la main depuis le tableau. C'est la règle que le plugin s'impose, elle s'applique à son propre site.

## Les cinq problèmes critiques

### 1. Le canonique de /journey/ et /commands/ pointe vers la home

Sévérité : critique. Trois agents l'ont trouvé indépendamment.

`out/journey/index.html` et `out/commands/index.html` portent tous deux :

```html
<link rel="canonical" href="https://nulltohero.netlify.app/"/>
```

Un seul canonique par page (donc pas un conflit de balises, c'est le seul signal et il est faux). Il contredit deux autres signaux de la même page : `og:url` est correct (`.../journey/`), et `sitemap.ts` déclare les trois URL comme distinctes et séparément prioritaires. Le BreadcrumbList de la page affirme lui aussi qu'elle est un nœud indexable propre.

Cause racine : `src/app/layout.tsx` pose `alternates: { canonical: "/" }`. Ni `journey/page.tsx` ni `commands/page.tsx` ne surchargent `alternates` (ils surchargent `title`, `description` et `openGraph.url`, mais pas celui-là), donc les deux héritent de la chaîne littérale `"/"`. La home semble correcte par coïncidence : son chemin est `/`.

Conséquence : deux tiers du site se déclarent non indexables. Search Console peut légitimement les ranger en "Duplicate, Google chose different canonical than user", ce qui retire la page et son rich result de son URL propre.

Correctif : deux lignes. `alternates: { canonical: "/journey/" }` et `alternates: { canonical: "/commands/" }`.

### 2. 32 des 65 commandes affichent du markdown brut au lieu d'une phrase

Sévérité : haute.

Sur `/commands`, toutes les commandes `/seo`, `/inspect` et `/audit` rendent leur description en markdown non interprété :

- `/seo audit` : `[references/audit.md](references/audit.md)`
- `/inspect detect` : `[references/detect.md](references/detect.md)`
- `/audit full`, `seo`, `defects`, `design`, `quick`, `verify` : six fois la chaîne identique `[references/full.md](references/full.md)`

Les 33 commandes `/siteasy` sont indemnes et se lisent normalement.

Cause racine, dans `src/data/commands.json` : la vraie phrase existe pour chaque commande, elle est simplement dans le champ `category` au lieu de `description`. `scripts/sync-commands.mjs` attend une table à trois colonnes (`| commande | Category | Description |`), or les SKILL.md de seo, inspect et audit ont une forme à deux colonnes (`Description | Reference`). Le mapping de colonnes glisse.

Conséquence : la page qui liste l'offre entière du produit est à moitié cassée, et six lignes sont du contenu dupliqué à l'octet près. `/commands` pèse 88 Ko, c'est la plus grosse page du site, et c'est celle qui doit convaincre.

Correctif : corriger le mapping dans `sync-commands.mjs`, relancer `npm run sync:commands`, rebuild.

### 3. La copie parodique précède le vrai pitch dans le HTML servi

Sévérité : haute. Trouvé par le contenu et par le GEO.

Le hero est un récit en sept actes. Tous les actes sont livrés dans le HTML initial (export statique) ; seuls `clip-path` et `opacity`, pilotés au scroll, décident de ce qu'un humain voit. Dans l'ordre du document, le premier bloc de texte non décoratif est une maquette :

> "Welcome to my website. This is a paragraph of text. Click the button below to learn more about our services."

Puis deux blocs qui portent "Unleash the power of AI-driven synergy, instantly." et un bouton "Get Started". Aucun des trois ne porte `aria-hidden`, contrairement au wordmark décoratif de l'acte 0, qui l'a. Le vrai h1 ("Every page is born null. This one corrects itself.") n'arrive qu'après.

Conséquence double. Une heuristique d'extraction qui lit les premières phrases du corps a un chemin direct pour citer la parodie comme le pitch du produit. Et un lecteur d'écran annonce un faux site comme s'il était la navigation réelle.

Correctif : `aria-hidden="true"` sur les trois blocs de maquette (actes 2, 3 et 4 dans `HeroScrolly.tsx`), en reprenant le motif que l'acte 0 utilise déjà. Aucun changement visuel.

### 4. La narration des actes 1 à 6 n'atteint jamais le HTML

Sévérité : moyenne à haute. Régression introduite le 16/07/2026 par le travail de narration.

La carte de narration rend `NARRATION[mounted ? idx : 0]`. `mounted` démarre à `false` et ne bascule que dans un `useEffect` ; `idx` ne bouge qu'au scroll. Ni le build ni un moteur qui n'exécute pas neuf hauteurs d'écran de scroll ne sortent `idx` de 0. Donc `NARRATION[1]` à `NARRATION[6]` sont absents du HTML livré : la mécanique ("it starts as a command", "It lives inside Claude") et cinq des six phases. Vérifié : la page contient "a blank page and a marker" (acte 0) mais pas "it starts as a command" ni "null to hero.". Le terminal de l'acte 1 tombe pareil (`{idx === 1 && <Terminal>}`).

C'est l'ironie exacte de ce chantier : le fond a été remonté dans les actes pour qu'un humain le lise, et les actes sont rendus côté client, donc les machines ne le lisent pas. `/journey` énonce les mêmes six phases en prose inconditionnelle, ce qui limite les dégâts. Mais la home est l'URL de priorité 1 du sitemap.

Correctif : aucune nouvelle copie à écrire, `PHASES` et `MECHANICS` portent déjà le texte. Rendre les sept entrées dans le DOM (par exemple une liste visuellement masquée des sept légendes et titres) au lieu de les conditionner à `idx`.

### 5. 857 Ko de three.js téléchargés sur chaque chargement de la home

Sévérité : haute.

Mesuré dans `out/` :

| Ce qui est demandé au chargement de `/` | Poids brut |
|---|---|
| `chunks/00x7f-2a_005j.js` (contient three.js) | **857,2 Ko** |
| 11 autres chunks | 766 Ko |
| **Total JS de la home** | **1623 Ko bruts, 12 chunks** |

Le chunk three.js est appelé en `<script src="..." async>` dans `index.html`. `/journey/` ne le référence pas du tout (0 occurrence), donc le découpage par route fonctionne. Le problème est ailleurs : `show3d` est un `useState(false)` qui ne passe à `true` qu'à partir de l'acte 4, mais `HeroScrolly` importe `Canvas` statiquement, donc **le gating diffère le montage du canvas, pas le téléchargement de three.js**. Tout visiteur de la home paie 857 Ko pour un mot 3D décoratif à l'acte 6, que la majorité n'atteindra jamais.

Honnêteté sur le chiffre : ce sont des octets bruts sur disque. Netlify sert en brotli, qui ramène typiquement du JS autour de 25 à 30%, soit de l'ordre de 220 Ko réellement transférés. Ça reste le poste dominant du site. Le transfert compressé n'a pas été mesuré (le réseau de la machine était coupé).

Correctif : `next/dynamic(..., { ssr: false })` sur le canvas, pour que three.js devienne un chunk à part récupéré quand `show3d` bascule.

## Par dimension

### Technique, 71/100

Ce qui tient, vérifié et non supposé :

- `robots.txt` : `Allow: /` pour `*`, plus 12 agents IA nommés un par un (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, meta-externalagent). Aucun `Disallow`. `Sitemap:` et `Host:` corrects.
- `sitemap.xml` : bien formé, trois URL avec slash final cohérent avec `trailingSlash: true`, priorités 1.0 et 0.8, déclaré dans robots.txt.
- CSP : exemplaire. Hachages SHA-256 par route de chaque script inline, pas de `unsafe-inline` ni `unsafe-eval` dans `script-src`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, doublé d'un `X-Frame-Options: DENY`.
- Rendu JS : l'export statique pré-rend tout. Le h1, les deux CTA en vrais `<a href>`, les quatre étapes, les quatre cartes de skills, les deux lignes d'install et le pied de page sont du vrai texte dans le HTML brut. Un crawler sans JS reçoit le contenu.
- `noindex` correctement limité à la route 404.
- 11 des 12 scripts en `async` : rien ne bloque le rendu.

Ce qui manque :

- Le canonique (voir critique 1).
- Les pages 404 (`out/404.html`, `out/404/index.html`, `out/_not-found/index.html`) portent **deux `<title>` consécutifs** et le canonique de la home. Même cause racine que le canonique. `noindex` est présent donc pas de risque d'indexation, mais le markup est invalide.
- Pas d'en-tête `Strict-Transport-Security` (0 occurrence dans `netlify.toml` et `out/_headers`). À poser plutôt que de compter sur un défaut de plateforme non vérifié.
- Redirections sans slash final (`/journey` vers `/journey/`) non vérifiées en direct.

### Contenu, 59/100

Le point fort réel : **aucun chiffre ne dérive**. 4 skills, 65 commandes, 117 docs, 71 règles, 15 sous-agents et la répartition 33/19/10/3 sont identiques dans `facts.ts`, les deux blocs de métadonnées, le corps des trois pages et `llms.txt`. C'est `src/lib/facts.ts` qui tient ça, et ses commentaires racontent que la dérive était un vrai problème avant lui.

Les faiblesses, hors critiques déjà listés :

- `/journey` fait environ 550 mots contre un plancher de 800 pour de l'informationnel. Concis par choix éditorial assumé (les commentaires de code le disent), pas famélique.
- Aucune date visible sur aucune page. `llms.txt` porte "Last updated: 2026-07-17" mais n'est lié que depuis le pied de page. La version (v1.39.0) sert de substitut partiel, et pour un logiciel c'est arguablement plus précis qu'une date.
- Aucune citation sortante. "Apache 2.0", "WCAG 2.2" et "Core Web Vitals" sont du texte nu. L'URL réelle de la licence n'existe que dans le JSON-LD, invisible au lecteur.
- Aucune phrase de crédibilité de l'auteur sur le site lui-même. Marius Yvard est nommé et lié partout (pied de page, `rel=author`, `meta author`, JSON-LD Person, llms.txt), tous vers la même URL, ce qui est plus cohérent que la plupart des sites d'outils solo. Mais il faut quitter le site pour savoir qui il est.
- Pas de page About ni Contact. GitHub Issues est le canal de fait, sans être nommé nulle part.

### On-page, 49/100

Le score est plafonné par le canonique, pas par la qualité rédactionnelle. Les h1 sont uniques et sur le sujet, l'ordre des titres est propre sur les trois pages (aucun niveau sauté), les slugs sont courts et cohérents.

| Page | Title | Longueur |
|---|---|---|
| `/` | NullToHero: the Claude plugin that corrects your website | 56 |
| `/journey/` | The journey, NullToHero | 24 |
| `/commands/` | All 65 commands, NullToHero | 28 |

`/journey` et `/commands` utilisent moins de la moitié de la place et ne portent presque aucun signal thématique autonome : "The journey" ne dit rien de Claude, de plugin ni de design à qui ne connaît pas la marque.

Les trois meta descriptions font 131, 153 et 136 caractères. Aucune n'est tronquée, donc c'est de la place inutilisée et non un texte coupé. Aucune ne contient de verbe d'action.

### Schema, 51/100

Trois types livrés : `SoftwareApplication` sur `/`, `BreadcrumbList` sur les deux autres. Tous syntaxiquement valides, rendus serveur et non injectés côté client.

Un point tranché plutôt que supposé : `offers: {"price":"0","priceCurrency":"EUR"}` est **correct**. `offers` n'est pas requis, mais dès qu'il est présent, `price` et `priceCurrency` le deviennent ensemble, et la consigne de Google pour une app gratuite est bien `price: "0"`. `priceCurrency` doit rester un code ISO 4217 valide, il n'existe pas d'état "sans devise". Le commentaire du code ("0 is the honest one") est juste.

À corriger :

- `operatingSystem: "Any (Claude Code, Claude Cowork)"`. La propriété attend de vrais systèmes d'exploitation, pas une application hôte. Un consommateur qui filtre "tourne sous Windows" ne matchera pas, alors que le plugin y tourne. Utiliser `operatingSystem: "Windows, macOS, Linux"` et `softwareRequirements: "Claude Code or Claude Cowork"`.
- `codeRepository` : son `domainIncludes` est `SoftwareSourceCode`, pas `SoftwareApplication`. `downloadUrl`, déjà présent et correctement typé, fait le travail.
- Manquants utiles : `dateModified`, `author.sameAs`, un nœud `WebSite`, et un `HowTo` sur les quatre étapes d'install (qui sont littéralement quatre étapes séquentielles exécutées par le lecteur, avec leurs commandes).

À ne pas corriger : l'absence d'`aggregateRating`. Le rich result étoilé l'exige, donc il restera hors de portée. C'est délibéré et c'est juste : le produit n'a aucun avis, et en fabriquer un pour débloquer le snippet serait une violation de politique, matériellement pire que de ne pas l'avoir.

### Performance, 71/100

Voir le critique 5 pour l'essentiel. Le reste :

- Candidat LCP : du texte. La police d'affichage auto-hébergée (`black-monster.woff2`, 2660 octets, sous-ensemble de 8 glyphes) est préchargée avec `crossorigin`. Bien fait.
- Satoshi et JetBrains Mono passent par des `<link rel=stylesheet>` externes (Fontshare, Google Fonts) avec `display=swap`, `preload as=style` et `preconnect`, mais **pas** par `next/font` (0 occurrence dans `src/`). Donc pas d'appariement automatique des métriques de repli, donc un reflow au swap est possible.
- CLS : risque faible côté images (il n'y en a pas) et le hero est en `sticky`.
- INP : non mesuré. Risque réel à surveiller vu les gestionnaires de scroll, Lenis et une piste de 940vh.

### Recherche IA (GEO), 60/100

| Plateforme | Score | Point bloquant |
|---|---|---|
| Bing Copilot | 90 | rien de significatif : OG complet, Twitter card, image OG générée |
| Perplexity | 55 | claims cohérents et traçables au dépôt, mais aucun lien de source en ligne |
| ChatGPT | 45 | aucun signal de fraîcheur hors llms.txt |
| Google AI Overviews | 40 | contenu en forme de how-to sans HowTo, FAQPage ni QAPage |

`llms.txt` est un vrai actif : bloc de faits, ligne "Cite as", date, et surtout il est **généré** depuis `facts.ts` et `commands.json` par `sync-llms.mjs`, câblé dans `npm run build`. Il ne peut pas rancir comme un llms.txt tenu à la main.

Le `NumberTicker` a été réécrit pour que le HTML serveur porte les vraies valeurs ("4 skills", "65 commands") et non des zéros. Le commentaire du code nomme le bug ("shipping zeroes to the machines is the worst possible lie"). Le correctif est bien dans le build livré.

Manque, hors critiques 3 et 4 : aucun contenu de comparaison ni d'alternatives, alors que le plugin embarque `/siteasy competitor-pages` fait exactement pour ça. Le site n'applique pas à lui-même la commande qu'il vend.

### Images, 95/100

Zéro `<img>` sur les trois pages. Mesuré, pas supposé. Il n'y a donc rien à optimiser : pas d'alt manquant, pas de format à convertir, pas de CLS d'image, pas de LCP image. Toute la classe de risque est absente par construction. La seule image du site est l'OG, générée au build par `src/app/opengraph-image.tsx`, servie avec un Content-Type corrigé.

Une remarque qui n'est pas un défaut d'image SEO mais mérite d'être posée : un site produit sans une seule capture ne donne à voir aucune sortie du plugin, et n'a rien à proposer à Google Images.

## Hors périmètre SEO, mais à traiter

`src/app/globals.css` porte un commentaire explicite et non résolu : la police d'affichage "Black Monster" est en licence usage personnel, et le readme de l'auteur exige une licence pour un usage promotionnel, ce qu'est un site produit. Marqué "To be settled before deploy". Le site est déployé. Le repli identifié est Yellowtail (OFL), à deux lignes de distance.
