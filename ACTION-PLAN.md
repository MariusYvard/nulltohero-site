# Plan d'action SEO, nulltohero.netlify.app

Issu de `FULL-AUDIT-REPORT.md`, 17/07/2026. Score de départ : **62/100**. Commit audité : `c3e8603`.

**Statut : les 18 points sont traités.** Un seul est volontairement partiel, il est nommé plus bas.

## Critique

### 1. Canoniques auto-référents — FAIT

`alternates: { canonical: "/journey/" }` et `"/commands/"`. Un commentaire sur `layout.tsx` dit pourquoi le littéral `"/"` ne s'hérite pas sans dégât, pour que la prochaine route n'y retombe pas.

Vérifié : les trois pages se déclarent elles-mêmes.

```
/            https://nulltohero.netlify.app/
/journey/    https://nulltohero.netlify.app/journey/
/commands/   https://nulltohero.netlify.app/commands/
```

### 2. Les 32 descriptions cassées — FAIT, et la cause avec

`sync-commands.mjs` lit désormais **l'en-tête du tableau** au lieu de supposer sa forme. `siteasy` a `| Command | Category | Description | Reference |`, les trois autres `| Command | What it does | Reference |` : l'ancien parser prenait la colonne 3 dans les deux cas, donc la référence pour 32 commandes sur 65.

Trois garde-fous ajoutés, parce que « ça a parsé » et « ça a parsé la bonne colonne » sont deux questions différentes :

- échec si la colonne description est introuvable, avec l'en-tête rencontré ;
- échec si une description ressemble à un lien de référence ou est vide (le défaut exact qui était en production) ;
- échec si le compte diverge de `facts.ts`.

Le troisième a immédiatement servi : le parser réécrit rendait **64** commandes contre 65. La ligne perdue était `report [url\|file\|generate]`, qui porte un **pipe échappé dans sa cellule**, et qu'un `split("|")` naïf déchire. Sans ce contrôle croisé, une commande disparaissait du site en silence.

Vérifié : 65 commandes rendues, 0 description en lien.

## Haute

### 3. La copie parodique hors du flux — FAIT, au-delà du plan

`aria-hidden` sur les trois maquettes, comme prévu. Mais `aria-hidden` ne règle que le lecteur d'écran : un moteur de réponse lit le DOM, pas l'arbre d'accessibilité, donc le texte restait citable. Les maquettes sont donc aussi **rendues côté client** (`{mounted && ...}`), comme le terminal de l'acte 1 l'était déjà.

Vérifié : "Unleash the power" et "Welcome to my website" sont à **0 occurrence** dans le HTML servi. Aucun changement visuel : `mounted` bascule à l'hydratation et ces actes sont clippés hors écran à scroll 0.

### 4. La narration dans le HTML — FAIT

Les sept actes sont rendus en liste `sr-only`, inconditionnellement, depuis le même tableau `NARRATION`. Aucune copie nouvelle. Cette liste est aussi l'équivalent accessible du hero, ce qui permet de passer la carte visuelle en `aria-hidden` au lieu de la faire lire acte par acte à un lecteur d'écran.

Vérifié : "it starts as a command" et "Machines read it first" sont présents, ils étaient à 0.

### 5. three.js à la demande — FAIT

Le rendu 3D est sorti dans `src/components/Wordmark3D.tsx`, chargé par `next/dynamic({ ssr: false })`.

| | Avant | Après |
|---|---|---|
| JS demandé par la home | 1623 Ko | **803 Ko** |
| chunk three.js (821 Ko) | `<script async>` | plus référencé |

## Moyenne

### 6. SoftwareApplication — FAIT

`operatingSystem: "Windows, macOS, Linux"` et `softwareRequirements: "Claude Code or Claude Cowork"`. `codeRepository` retiré (son `domainIncludes` est `SoftwareSourceCode`), remplacé par `sameAs`. `author.sameAs` ajouté. `dateModified` branché sur `PLUGIN.updated`, que `sync-commands.mjs` estampille à la synchro : **pas** la date de build, parce qu'un rebuild sans changement n'est pas une modification et qu'une fraîcheur qui monte à chaque déploiement est une fraîcheur non méritée.

Pas d'`aggregateRating`, décision inchangée et juste.

### 7. Les 404 — FAIT

`src/app/not-found.tsx` remplace le not-found intégré de Next, qui posait son propre `<title>` en plus de celui du layout. Un seul `<title>` désormais, `noindex` conservé (rendu à la main, puisque c'est l'intégré qui le fournissait). Le canonique y reste `/` : `not-found.tsx` ne peut pas exporter de `metadata`, et sur une route noindex rien ne le consomme. C'est écrit dans le fichier.

### 8. Titles et meta descriptions — FAIT

| Page | Title | Desc |
|---|---|---|
| `/` | 56/60 | 153/160 |
| `/journey/` | 60/60 | 153/160 |
| `/commands/` | 54/60 | 158/160 |

Une erreur à consigner : j'ai d'abord ajouté un CTA aux **trois**, ce qui a porté `/journey` à **175** caractères, exactement la troncature que le commentaire du code prévenait. L'audit ne demandait le CTA que sur la home et `/commands`. Corrigé, et le pourquoi est maintenant dans le fichier.

### 9. HowTo — FAIT

Sur les quatre étapes d'install, alimenté par le tableau `STEPS` que la section rend, donc le markup ne peut pas décrire un parcours que la page n'affiche pas. Pas appliqué aux six phases de `/journey`, la sémantique ne colle pas.

### 10. Polices — FAIT autrement, et c'est le point partiel

**Auto-hébergées** (5 poids Satoshi + JetBrains Mono variable, 160 Ko), pas passées en `next/font`.

Le plan sous-estimait le problème. `fonts.googleapis.com` est **injoignable depuis ta machine** : ce n'était pas un risque théorique de CLS, ton site rendait sans police mono chez toi pendant que l'audit notait le même code « correct ». Auto-héberger supprime la dépendance au lieu de la déplacer, et rend le build indépendant du réseau.

`next/font` n'a **pas** été appliqué, délibérément : il renomme les familles en identifiant haché, or `Wordmark3D` cuit sa texture WebGL via `document.fonts.load("900 150px Satoshi")`. Une famille renommée y cuirait silencieusement la police de repli, et je n'ai aucun instrument fiable pour le voir. **Ce qui reste ouvert : l'appariement automatique des métriques de repli.** En pratique le risque de reflow s'effondre (même origine, préchargé), mais il n'est pas nul. À trancher avec le wordmark sous les yeux.

Effets de bord, tous dans le bon sens : plus aucune requête tierce, quatre `preconnect` et deux feuilles bloquantes supprimées, et la CSP se referme à `style-src 'self'` / `font-src 'self'`.

Au passage : Fontshare ne publie pas Satoshi en 800. L'ancienne feuille le demandait et ne l'a jamais reçu.

## Basse

- **HSTS** : posé dans `netlify.toml` à `max-age=63072000`, **mais mesuré en ligne à `max-age=31536000; includeSubDomains; preload`**. Netlify pose son propre HSTS et gagne sur le fichier : le header existe (le constat d'audit disait « aucun »), la valeur est celle de la plateforme, pas la mienne. Un an au lieu de deux, ce qui est sans conséquence pratique. Écrit ici plutôt que présenté comme un réglage qui a pris.
- **Nœud WebSite** : ajouté, sans `SearchAction` (il n'y a pas de recherche sur le site, en revendiquer une serait faux).
- **Apache 2.0** : lié vers la licence dans le pied de page. Son URL réelle n'existait que dans le JSON-LD, où aucun lecteur ne va.
- **Phrase sur l'auteur** : ajoutée. Il était nommé partout et présenté nulle part.
- **Ligne GitHub issues** : ajoutée. Le canal existait déjà, rien ne le disait.
- **Cibles tactiles** : `min-h-11` (44px) vers `min-h-12` (48px), 10 occurrences, plus du padding vertical sur les liens de pied de page qui n'en avaient aucun.
- **Catégorie nommée** : « A Claude Code plugin for design, SEO and front-end quality review » dans le pied de page. Version minimale et assumée de `competitor-pages` : **pas de page de comparaison**. Nommer les manques d'un concurrent sur son propre domaine est une affirmation qu'il faut ensuite maintenir vraie, et il n'y a pas de matrice honnête à construire sans les avoir testés. À faire avec toi si tu le veux.
- **Redirections sans slash final** : vérifiées en ligne, rien à faire. `/journey` rend **301** vers `/journey/`, `/commands` **301** vers `/commands/`, et la forme canonique rend 200. Pas de contenu dupliqué : le doute de l'audit est levé par la mesure, pas par un correctif.

**WCAG 2.2 non lié** : la mention n'existe que dans les descriptions de commandes, qui sont des **données générées** depuis les SKILL.md du plugin. Y injecter un lien demanderait un linkifier dans le rendu, pour une occurrence. Le besoin de fond (« aucune citation sortante ») est couvert par le lien Apache. Écarté volontairement.

## Hors SEO

La police **Black Monster** reste en licence usage personnel sur un site promotionnel. Non touchée : `NOTES.md` dit « Marius a tranché : on garde, question close ». Le signalement reste, la décision est la tienne.

## Ce que l'audit n'a toujours pas couvert

Aucune donnée de terrain Core Web Vitals. Les gains de performance sont mesurés en octets sur `out/`, pas en LCP ou INP observés. Le poids compressé réel n'est pas relevé : les 803 Ko sont bruts, l'estimation brotli est une règle de trois.

Le rendu mobile n'est vérifié par aucun instrument de mon côté (onglet non focalisable, rAF suspendu ; Playwright non installable). Tes captures restent la seule mesure.
