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

### 1. Trier les 14 échecs de contraste du site (le plus intéressant)

`node tools/audit/analyze.mjs https://nulltohero.netlify.app/ --render` (depuis le dépôt **plugin**) rend `contrast-ratio: FAIL`, 14 échantillons sous AA, pire 1,11:1.

**Attention, c'est un problème de jugement, pas de correction.** Plusieurs de ces échecs sont dans l'**acte 3** (la page à effets) et sont **intentionnels** : le site met en scène le crime que la règle 19 interdit. Le détecteur ne sait pas distinguer une démonstration d'un défaut.

Vrai défaut confirmé, hors démonstration : le `scroll` de `src/components/ScrollHint.tsx` est à **3,43:1** (il lui faut 4,5). `#8a8780` sur `#fbfaf7`.

### 2. Question de doctrine pour le plugin

Comment un audit doit-il traiter un mauvais contraste **volontaire** ? Piste : un `data-*` d'exemption que l'audit respecterait et compterait à part. À trancher avant de corriger aveuglément l'acte 3.

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
