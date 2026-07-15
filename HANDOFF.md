# Handoff — NullToHero (le plugin et son site)

État au 15/07/2026. À lire en entier avant de toucher à quoi que ce soit.

## Les deux dépôts

| Quoi | Chemin local | Remote | En ligne |
|---|---|---|---|
| **Le plugin** | `C:\Users\mariu\vitrines\NullToHero` | `MariusYvard/NullToHero` | marketplace Claude, **v1.33.1** |
| **Le site** | `C:\Users\mariu\Claude\Projects\Taff perso\nulltohero-next` | `MariusYvard/nulltohero-site` | https://nulltohero.netlify.app (CD depuis `main`) |

Les deux sont propres et poussés. Le site se déploie tout seul à chaque push sur `main`.

**Ne pas confondre avec les copies mortes** : `C:\dev\NullToHero` (v1.14.0) et `OneDrive\...\GitHub\NullToHero` (v1.5.0) sont périmées. Le seul dépôt vivant du plugin est `vitrines\NullToHero`.

## Lire d'abord

- `NOTES.md` (ce dépôt) — le moteur du hero en 7 actes, et les pièges qui ont coûté des heures.
- `src/lib/facts.ts` — **source unique** de tout chiffre que le site affirme sur le plugin. Ils étaient dupliqués à neuf endroits et avaient tous pourri à v1.2.0 / 3 skills / 35 commandes pendant que le plugin publiait v1.33.0 / 4 / 65.

## Les quatre pièges qui font perdre des heures

1. **Onglet caché = rAF suspendu.** `document.visibilityState === "hidden"` gèle `scrollYProgress` à 0 : le hero ne joue pas, `idx` reste à 0, le terminal et le canvas WebGL ne montent jamais. **Rien de tout ça n'est un bug du site.** Contrôler `visibilityState` avant toute mesure d'animation. J'ai perdu une heure à diagnostiquer mon instrument.
2. **Les captures de Claude in Chrome traînent de 3 à 5 s** après un scroll programmatique. Mesurer le DOM (`getComputedStyle`, `textContent`, l'attribut `data-act` du hero), jamais une image.
3. **Le mount bash du sandbox sert des fichiers tronqués** (coupés en plein mot, avec une mtime périmée). Utiliser les outils hôte (Read/Edit/Grep) ou Desktop Commander sur ces dépôts.
4. **Le shell de Desktop Commander a `NODE_ENV=production`**, donc `npm install` y **élague les devDependencies** (Tailwind, PostCSS, TypeScript disparaissent). Toujours `$env:NODE_ENV="development"` pour installer, et le **vider** pour `next build` (sinon Next construit en mode non standard et le prérendu casse).

## La règle qui a tout débloqué

**Mesurer, ne pas deviner.** Sur cette session, une mesure a réglé en un appel ce que trois essais à l'œil avaient raté, à chaque fois :

- le contraste OKLCH (conversion Ottosson écrite à la main pour valider la nav) ;
- la géométrie du terminal (`getBoundingClientRect` au lieu de pourcentages devinés) ;
- la hauteur de capitale du logo (74/71 = **1,042**, alors que j'avais écrit 1,3) ;
- l'approche des mots (`actualBoundingBoxLeft/Right`, un écart de 19px invisible à l'œil).

Deux exceptions **assumées**, toutes deux dans `src/components/Wordmark.tsx` : la taille de `Hero` (0.95) et le crénage `To`→`Hero` (11px contre 8). La mesure tranche la géométrie, pas la perception.

## Ce qui reste, par ordre de valeur

### 1. ~~Trier les 14 échecs de contraste du site~~ FAIT le 15/07/2026

Tri, correction et doctrine : voir **`NOTES.md`, section "Contraste"**. Le compte est passé de 14 à 11, et les 11 restants sont soit assumés, soit des bugs du détecteur.

**Le cadrage de cette section était faux, deux fois.** Consigné ici parce que l'erreur est instructive :

- « Plusieurs de ces échecs sont dans l'acte 3 » : **non, l'acte 3 n'en produit aucun.** Son wordmark est en couleur transparente (`background-clip:text`), le détecteur l'écarte tout seul. Une exemption pensée pour l'acte 3 n'aurait rien exempté.
- « C'est un problème de jugement, pas de correction » : **6 des 14 étaient des faux positifs**, donc d'abord un problème de mesure. Le vrai piège n'était pas de corriger une démonstration par erreur, c'était de croire le détecteur sur parole.

Répartition réelle : **3 vrais défauts** (corrigés), **5 mises en scène** (les tampons de l'acte 4, exemptés sur décision de Marius), **6 faux positifs** (la nav).

### 2. Deux bugs du détecteur, à corriger dans le plugin

Les 6 faux positifs de la nav, mesurés au pixel (capture, puis pixel modal dans la boîte de chaque élément) :

- **Fond résolu par ascendance DOM, pas par peinture.** Les 3 spans du wordmark sont mesurés à 1,11:1 contre `#0e0f13` (le body), alors que la feuille de l'acte 0 est peinte dessous : la vraie mesure est **16,27:1**. `checks.mjs` dit lui-même « A real page background (body/:root) is trusted » : c'est cette confiance qui est fausse dès qu'une couche sœur peint en dessous. Correctif : quand rien n'a peint entre l'élément et la racine, la réponse DOM est une supposition, donc vérifier au pixel et, à défaut, marquer non mesurable. Quand l'élément (ou un ascendant) peint son propre fond opaque, la réponse DOM fait foi et reste valable même hors écran. Cette coupure sépare exactement la nav (fausse) du CTA (juste).
- **Éléments non peints comptés.** « The journey », « Commands », « GitHub » sont mesurés à 375 px alors que leur parent est `display:none` à cette largeur. `getComputedStyle` sur un enfant d'un parent `display:none` rend son **propre** display, pas `none` : le filtre ne les voit pas. Correctif à un chiffre : écarter tout échantillon dont la boîte a une aire nulle.

Le plugin a déjà énoncé ce principe pour les couleurs oklch : *« An audit that invents failures is worse than one that misses them, because it gets believed. »* Ces deux bugs sont la même faute, ailleurs.

### 2 bis. Portée de l'audit, à surveiller

L'audit ne mesure **qu'une page, à scroll 0**. Il n'a donc jamais vu deux vrais défauts, corrigés à l'aveugle depuis la source : le bouton Install de la nav en thème sombre (dès qu'on quitte l'acte 0), et les CTA de `/journey` (sombre en permanence). Un compte de contraste sur une seule page d'un site scrollytelling est une couverture partielle, pas un verdict.

### 3. Reste du site

- Core Web Vitals réels, surtout le WebGL de l'acte 6 sur mobile.
- `SECURITY.md` du site.
- Le hero viole **L-MOTION-3** (loi du plugin : les tweens scrubés sont linéaires ; les wipes sont en in-out). Marius a validé le rendu actuel — à ne pas changer sans lui demander.

## Conventions à respecter

**Release du plugin** : elle touche **huit** endroits, pas trois. `plugin.json`, `marketplace.json`, `package.json`, la ligne de badge du README, le tableau de `SECURITY.md`, le frontmatter `version:` des **quatre** `SKILL.md`, et `PLUGIN_VERSION` dans `install.sh` **et** `install.ps1`. Plus `node tools/sync-overview.mjs`. Commit `Release vX.Y.Z: <sujet long, pas de corps>`, tag léger. `npm test` doit être vert (441 checks, eval 100 %) — **le validateur du dépôt est excellent, il rattrape tout**, il m'a corrigé six fois.

**Site** : `npm run build` lance `sync:llms` automatiquement. Après une release du plugin, relancer `node scripts/sync-commands.mjs` puis mettre à jour `src/lib/facts.ts`.

**PowerShell** : pas de heredoc. Pour un message de commit long, passer par un fichier et `git commit -F`.

## Ce que je n'ai pas pu vérifier

Le fondu terminal→page (commit `5b65513`) est un changement de comportement JS : sa présence ne se prouve pas au grep, il faut scroller la frontière. L'onglet était en arrière-plan quand je l'ai livré.
