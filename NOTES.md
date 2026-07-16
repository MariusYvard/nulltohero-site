# NullToHero (Next.js) — notes de build

Site refait en Next.js 16 (export statique) + Tailwind 4 + motion (Framer Motion) + React Three Fiber. Thème sombre minimal, accent rouge correction. Le hero est un scrollytelling en 7 actes (`src/components/HeroScrolly.tsx`).

## Narration : les actes portent les phases

Fait le 16/07/2026. Reproche de Marius : "une personne qui arrive sur le site ne comprend pas ce qui lui arrive", "c'est juste un enchaînement de NullToHero". Exact, et la cause n'était pas la forme.

**Pendant six des sept actes, tout le contenu verbal de la page était une ligne mono de 14px en bas à gauche.** Le h1, le lede et les CTA vivent dans l'acte 6 : qui n'atteignait pas la fin avait vu un wordmark rendu sept fois et lu une légende. Le hero montrait une histoire que seule `/journey` expliquait, alors que les deux disaient déjà les mêmes six temps (cf. plus bas : "les légendes font écho à la narration du hero, délibérément"). Ils ne se parlaient simplement pas.

Chaque acte lit maintenant sa phase dans `src/lib/pipeline.ts` (source unique, extraite de `journey/page.tsx`) et rend un carton : numéro, légende, titre, une phrase courte (`short`, ~18 mots — le `body` fait 60 mots, personne ne s'arrête pour lire en scrubbant), puces de commandes. **Le moteur d'animation, les wipes et le timing ne sont pas touchés.**

Deux irrégularités que la mise en correspondance a révélées, les deux réelles :

- **L'acte 1 (le terminal) ne correspond à aucune phase.** Ce n'est pas une étape du travail, c'est la mécanique : ce qu'est la chose et où on la tape. C'était le plus gros trou de la page, l'acte 1 le porte désormais au lieu d'une vanne.
- **L'acte 5 était légendé "corrected. committed. calm.", qui est le verdict PASS de la phase 06, pas une phase.** Donc **la phase 05 (`/seo`, 19 commandes) n'apparaissait nulle part dans le hero** : l'histoire allait design → détecteur → 3D et sautait silencieusement la deuxième skill du plugin. L'acte 5 porte la phase 05, le verdict redescend à l'acte 6 en tampon PASS, où il est mérité.

**Le carton est sur une plaque, la ligne de 14px n'en avait pas besoin.** Elle survivait aux actes 2, 3 et 4 en `mix-blend-difference` : ça marche pour une ligne grise fine sur n'importe quoi, pas pour un paragraphe. Les actes sont des maquettes pleine page en couleurs arbitraires, donc le contraste contre elles n'est pas une valeur mesurable. La plaque redonne un fond tokenisé.

Piège à retenir : **la plaque est `bg-paper/85`, donc l'acte transparaît et le contraste dépend de l'acte.** Mesuré contre le fond réel de chacun (pas contre `--paper`), les 4 couples tiennent AA sur les 6 actes cartonnés, pire 5,12:1 (ink-faint sur l'acte 5). La même plaque sombre sur une maquette **blanche** mesure 1,65:1 : ça ne tient que parce que chaque acte est soit la feuille claire (0 et 2, traités par `data-hero-light`, comme la nav) soit sombre. Si un acte repasse en clair, il rejoint le sélecteur ou la carte devient opaque.

La section "The order" de la home (pipeline condensé) est retirée : les actes le racontent, un rappel un écran plus bas était la même liste dite deux fois. "How it works" reste, la mécanique n'est nulle part ailleurs.

## Moteur d'animation du hero

Règle centrale : **aucun acte ne disparaît en fondu, il est recouvert**, comme une coupe au montage. Le fondu croisé était le reproche principal ("low effort", "répétitif") : sept fondus identiques, c'est le geste par défaut. Chaque frontière a donc sa propre mécanique, en `clip-path` sur l'acte entrant (`z-index: i`, l'acte sortant reste visible dessous et continue de bouger, ce qui donne la profondeur).

| Frontière | Mécanique | Ease |
|---|---|---|
| 0→1 | un store noir descend sur la feuille | `cubicBezier(0.7,0,0.3,1)` |
| 1→2 | l'écran du terminal grandit jusqu'à devenir la page (`inset(... round Npx)`) | `cubicBezier(0.45,0,0.2,1)` |
| 2→3 | les effets éclosent en iris (`circle(N% at 50% 42%)`) | `cubicBezier(0.5,0,0.3,1)` |
| 3→4 | **coupe franche** : le détecteur fige l'image, le changement est dans le contenu (désaturation + tampons), pas dans un fondu | — |
| 4→5 | une passe de correction balaie de gauche à droite, arête rouge en tête | `cubicBezier(0.85,0,0.15,1)` |
| 5→6 | le cadre s'ouvre comme un objectif (letterbox) | `cubicBezier(0.5,0,0.25,1)` |

- **Les wipes sont scrubbés, donc ease in-out, jamais expo-out.** Un wipe expo-out est à ~90 % au milieu de sa fenêtre de scroll : il claque puis attend, l'inverse de suivre la main du lecteur. Seule la dérive du contenu (`E_DRIFT`) garde l'expo-out, où un settle tardif est justement ce qu'on veut.
- L'opacité d'un acte est un **palier** (0 ou 1), jamais une rampe : elle ne sert qu'à démonter l'acte une fois complètement caché.
- `useSpring` a été retiré : dans cette combinaison Next 16 / motion 11 il ne convergeait pas (visuels ~2 actes en retard). L'organique vient des courbes, pas d'un ressort.
- Acte 3 et acte 4 partagent le même composant `SlopPage`, pour que la coupe franche tombe sur des pixels identiques et se lise comme un gel d'image.
- Acte 6 : extrusion 2D→3D du wordmark (z-stack de 20 plans texturés Satoshi, R3F).

## Pièges de mesure (coûteux à re-découvrir)

### L'onglet caché fausse TOUT (piège n°1)

Un navigateur **suspend `requestAnimationFrame` dans un onglet en arrière-plan** (`document.visibilityState === "hidden"`). Or motion pilote `useScroll` par rAF. Dans un onglet caché : `scrollYProgress` reste figé à 0 même quand `window.scrollY` bouge, donc les 7 actes restent dans leur état progression-zéro, `idx` reste à 0, le terminal (`idx === 1`) et le canvas WebGL ne montent jamais, et les captures d'écran sont vides ou périmées de plusieurs secondes.

**Rien de tout ça n'est un bug du site.** J'ai brûlé une session entière à diagnostiquer mon instrument de mesure : j'ai cru à un `useScroll` cassé, accusé les ancêtres positionnés, et remplacé `useScroll` par une boucle rAF maison (qui aurait eu exactement le même problème, en pire : elle tourne en continu même hors du hero). Tout a été annulé.

**Avant toute vérification navigateur, contrôler `document.visibilityState`.** S'il vaut `hidden`, aucune mesure d'animation n'est fiable.

### L'avertissement useScroll est cosmétique

*"Please ensure that the container has a non-static position..."* : **l'ignorer**. Ne pas mettre `position: relative` sur `<main>` ni `<body>` pour le faire taire — ils ne scrollent jamais (c'est `html`), et c'est du bruit ajouté pour rien. `useScroll` mesure correctement sans.

### Autres

- La nav est `fixed`, pas `sticky` : en sticky elle mange les 68 premiers px du flux, donc le hero démarrait sous elle et son `backdrop-blur` composait sur le body sombre au lieu de la feuille de l'acte 0.
- `@theme inline` de Tailwind 4 compile les utilitaires contre `--paper` / `--ink`, **pas** contre `--color-paper`. Pour réthémer la nav au-dessus des actes blancs, il faut surcharger les noms bruts (`html[data-hero-light] header { --paper: ... }`), et donner une classe de couleur explicite aux éléments (sinon ils héritent la couleur *calculée* du body et ignorent la variable).
- Vérification navigateur : **les captures d'écran de Claude in Chrome traînent de 3 à 5 s après un scroll programmatique.** Elles m'ont fait diagnostiquer des bugs inexistants (terminal vide, mot 3D disparu, nav désynchronisée) qui étaient tous des frames périmées. Mesurer le DOM (`getComputedStyle`, `textContent`, un attribut `data-act`) est la seule vérification fiable ici. Lenis n'honore pas non plus toujours `scrollTo(y, {immediate:true})`.
- Le hero expose `data-act={idx}` sur la piste : c'est le point de mesure qui a fini par isoler le gel de `scrollYProgress`. Le garder.

## Contraste : le tri des 14 échecs, et la doctrine d'exemption

Fait le 15/07/2026. Les 14 échantillons de `contrast-ratio: FAIL` se répartissent en **trois** catégories, pas deux. La troisième est celle qui manquait au cadrage.

| Catégorie | Nb | Où |
|---|---|---|
| Vrais défauts | 3 | `scroll` de l'acte 0, CTA de l'acte 5, CTA de l'acte 6 |
| Mise en scène assumée | 5 | les tampons FAIL/WARN de l'acte 4 |
| **Faux positifs du détecteur** | 6 | la nav |

**L'acte 3 ne produit aucun échec de contraste.** La page à effets pèche par gradients et par effets, pas par contraste, et son wordmark est en `background-clip:text` (couleur transparente), que le détecteur écarte de lui-même. Le cadrage de départ ("plusieurs de ces échecs sont dans l'acte 3, ils sont volontaires") était faux : une exemption pensée pour l'acte 3 n'aurait rien exempté du tout.

### Cause racine des 3 vrais défauts : un rouge pour deux métiers

`--red` était vérifié dans **un seul sens**, comme texte sur fond sombre (5,2:1, d'où le commentaire "red accent 5.15:1"), puis employé dans l'autre, comme fond de bouton sous du blanc (3,68:1). Personne n'avait mesuré ce sens-là.

Balayage de `oklch(L 0.2 29)` avec `tools/audit/lib/contrast.mjs` :

- rouge **comme texte** sur `--paper` : il faut L >= 61 % pour atteindre 4,5:1
- **blanc sur** rouge : il faut L <= 59 % pour atteindre 4,5:1
- à L = 60 %, les deux échouent

**Aucun rouge unique ne satisfait les deux sens.** Ce n'est pas un arbitrage de goût, c'est une impossibilité mesurée, et c'est pour ça qu'il y a maintenant `--red` (accent lu) et `--red-solid` (surface lue en blanc). Le thème papier faisait déjà ça sans le dire (53 %), voilà pourquoi la nav passait.

Au passage, `--red-deep` (survol) **éclaircissait** : le blanc y tombait à 2,89:1, donc le survol était moins lisible que le repos. Il assombrit maintenant (6,68:1).

Deux défauts que l'audit **ne peut pas voir** ont été corrigés au même endroit : le bouton Install de la nav repasse en thème sombre dès qu'on quitte l'acte 0 (3,68:1 avant), et `/journey` est sombre en permanence. L'audit ne mesure qu'une page, à scroll 0.

### Doctrine : comment traiter un mauvais contraste volontaire

Retenue et appliquée aux tampons de l'acte 4 (`data-contrast-exempt="staging"` dans `HeroScrolly.tsx`). Six règles, dans cet ordre.

1. **Réparer la mesure avant d'ouvrir l'exemption.** 6 des 14 échecs étaient des bugs du détecteur. Livrer l'exemption d'abord, c'est fournir l'outil qui fera taire les bugs au lieu de les corriger. L'exemption ne vaut que posée sur un détecteur juste.
2. **Portée à l'élément, jamais héritée.** Cinq badges à exempter, c'est cinq marques. Une exemption de sous-arbre devient un blanc-seing, et le coût doit croître avec la taille du mensonge.
3. **Le motif est obligatoire.** `data-contrast-exempt` sans `data-contrast-exempt-reason` est lui-même un échec. Tout le mécanisme tient là : le prix d'une exemption est d'écrire l'argument, et de le mettre dans le diff où la revue le voit.
4. **Vocabulaire fermé.** `staging`, `decorative-ghost`, `disabled`, `logotype`, `incidental`. Un champ libre finit toujours par dire "parce que".
5. **Jamais soustrait en silence.** Le verdict se calcule sur les échecs non exemptés, mais le compte exempté s'imprime toujours : `{ failures: N, exempt: M, worst: X }`. Un audit où l'on atteint zéro à l'annotation fabrique de la conformité de façade.
6. **Exempté n'est pas conforme.** Le point qui décide de l'honnêteté du mécanisme. La WCAG 1.4.3 prévoit trois exceptions (texte incident ou inactif, logotypes, seuil du grand texte) : "c'est une démonstration" n'en fait pas partie. Le plugin doit donc rapporter ces échantillons comme **hors du jugement de l'audit, par choix de l'auteur**, pas comme conformes. Les tampons de l'acte 4 restent sous AA et le site l'assume ; il ne prétend pas le contraire.

Corollaire pour la règle 19 : une règle peut être enfreinte **comme sujet**. Le marqueur dit "cet élément est une citation, pas une affirmation". Un guide de style qui cite de la mauvaise prose ne se contredit pas.

## Points connus

- WebGL (acte 6) : "Context Lost" en dev après de nombreux rechargements HMR (les contextes s'accumulent, le navigateur en tue). Sur un chargement frais c'est OK. Résilience ajoutée (`preventDefault` sur `webglcontextlost`).
- Nav au-dessus des actes blancs (0 et 2) : réglé. `HeroScrolly` pose `data-hero-light` sur `<html>`, la nav rebascule ses propres tokens sur ceux du papier (globals.css). Les 6 paires contrastent AA (vérifié avec `tools/audit/lib/contrast.mjs` du plugin : ink 16.3:1, ink-soft 8.0:1, red 5.5:1, blanc sur red 5.9:1).
- **Police acte 0 : Black Monster.** Auto-hébergée (`public/fonts/black-monster.woff2`), sous-ensemblée aux 8 glyphes de "NullToHero" : 122 Ko TTF → 2,6 Ko woff2. La police complète n'est pas embarquée. **Marius a tranché : on garde, question close.** Pour mémoire, sans y revenir : le readme de l'auteur demande une licence pour usage promotionnel (creativework69@gmail.com, liens d'achat dans `Downloads/black-monster/read me BLACK MONSTER.txt`). Repli si jamais : **Yellowtail** (OFL, Google Fonts), le plus proche en libre — même brosse années 40, tranches biseautées, italique. Le retour arrière tient en deux lignes : `fontFamily` dans `HeroScrolly` + le `@font-face` dans `globals.css`. Bangers avait été essayé : c'est de l'encre comic, pas de la brosse.
- L'écriture de l'acte 0 est **temporelle, pas scrubée** : une main a son rythme propre, le scrub le lierait à la molette. Les majuscules durent ~2× une minuscule (voir `PEN`), c'est cette irrégularité qui la fait lire comme écrite.
- Pages `journey` / `commands` : quand elles arriveront, prévoir un padding haut (`pt-16`) — la nav est `fixed`, elle ne réserve plus de place dans le flux.

## Session polish autonome (boucle améliore → vérifie → déduis)

- Essayé `useSpring(scrollYProgress)` pour l'élan organique : ne converge pas ici (visuels ~2 actes en retard). Retiré. L'ease expo-out sur les `useTransform` porte l'organique.
- Essayé un modèle "acte actif piloté par ressort" (animate + spring sur idx) au lieu du scrub : régresse (jumble, mauvais acte affiché). Revenu au scrub piloté au scroll, qui atterrit proprement (vérifié actes 1→6 sur onglet neuf).
- État retenu : scrub au scroll + direction d'entrée/sortie différente par acte + ease expo-out + mécaniques internes distinctes. Plus de flou uniforme, plus de décalage.
- Piste pour aller plus loin sur l'organique (non faite, à valider avec toi) : continuité visuelle du wordmark d'un acte à l'autre (même taille/position qui se morphe), et/ou une lib de scroll fluide (Lenis) pour l'élan, ce que le budget motion initial excluait.

## Reste à faire

- Pages `journey` et `commands` en React.
- SEO/GEO : metadata par route, JSON-LD SoftwareApplication + BreadcrumbList, sitemap, robots, llms.txt, og.png.
- Audit du plugin (`/inspect`, `/seo`) sur la sortie, polish CWV, déploiement Netlify (`npm run build` → dossier `out/`).
- Piste d'amélioration organique : continuité du wordmark d'un acte à l'autre, profondeur/parallax interne, rythme (durées d'actes variables).
