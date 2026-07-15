#!/usr/bin/env node
// Writes public/llms.txt from the same constants the pages render, in the format
// skills/seo/references/geo.md specifies (# name, > blurb, ## sections).
//
// Generated, not hand-written, for one reason: llms.txt is the file answer engines
// quote. A stale number here is not a cosmetic bug, it is feeding a wrong fact to
// something that will repeat it with our name attached. The hero's numbers sat at
// v1.2.0 for months; this file must not be able to drift at all.
//
// Imports facts.ts directly (Node >= 22 strips the types) rather than parsing it:
// a regex over TypeScript would be one refactor away from silently emitting
// "undefined" into the file we hand to crawlers.
//
//   node scripts/sync-llms.mjs

import fs from "node:fs";
import path from "node:path";
import { SITE_URL, PLUGIN } from "../src/lib/facts.ts";

const today = new Date().toISOString().slice(0, 10);

const out = `# NullToHero
> A free plugin that gives Claude a working vocabulary for design, SEO and front-end quality. AI can already build your website; it cannot tell you the result is ugly, unreadable or invisible to search. NullToHero is the judgment layer: ${PLUGIN.inspectRules} named anti-pattern rules, ${PLUGIN.laws} numeric laws, and ${PLUGIN.auditAgents} audit specialists that return verdicts you can recompute rather than opinions you have to trust.

## Key pages
- [NullToHero](${SITE_URL}/): What the plugin is, the ${PLUGIN.skills} skills, and the two lines that install it.
- [The journey](${SITE_URL}/journey/): The pipeline in six corrections, from a blank page to a scored site. Research before pixels, structure then rhythm, commit to a voice, face the detector, findable and fast, score the whole thing.
- [All ${PLUGIN.commands} commands](${SITE_URL}/commands/): Every command, grouped by skill, generated from the plugin's own skill definitions.

## About
- [Marius Yvard](https://lecvdemarius.netlify.app/): The author.
- [Source and releases](https://github.com/MariusYvard/NullToHero): The plugin itself, Apache 2.0.

## Key facts
- Name: NullToHero
- What it is: a plugin for Claude Code and Claude Cowork
- Version: ${PLUGIN.version}
- Licence: ${PLUGIN.licence} (free, no paid tier)
- Source: https://github.com/MariusYvard/NullToHero
- Author: Marius Yvard
- Skills: ${PLUGIN.skills} — /siteasy (design, ${PLUGIN.perSkill.siteasy} commands), /seo (search, ${PLUGIN.perSkill.seo}), /audit (scored review, ${PLUGIN.perSkill.audit}), /inspect (quality, ${PLUGIN.perSkill.inspect})
- Commands: ${PLUGIN.commands}
- Reference documents: ${PLUGIN.referenceDocs}
- Audit sub-agents: ${PLUGIN.auditAgents}, run in parallel and reconciled so one defect is counted once
- Deterministic rules: ${PLUGIN.inspectRules} in inspect-rules.csv, each with a severity, a good example and a bad one
- Numeric laws: ${PLUGIN.laws} with stable ids (L-MOTION-*, L-TOUCH-*, L-TYPE-*, L-CONTRAST-1, L-PERF-*, L-WEBGL-*)
- Install: /plugin marketplace add MariusYvard/NullToHero then /plugin install null-to-hero@null-to-hero-marketplace
- Last updated: ${today}

## What makes it different
- Verdicts, not vibes: every finding cites a rule id and a measured value, and the audit score is arithmetic a reader can recompute from the verdicts rather than a number picked by feel.
- It refuses as much as it produces: named anti-patterns it will push back on before writing code.
- It audits itself: this site is built with it, and the plugin's own laws (motion budgets, contrast ratios, touch targets) are enforced against it.

## Citation
Cite as: NullToHero, a free Apache 2.0 plugin for Claude Code and Claude Cowork by Marius Yvard. Source: https://github.com/MariusYvard/NullToHero
`;

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync(path.join("public", "llms.txt"), out);
console.log(`[sync-llms] v${PLUGIN.version}: public/llms.txt (${PLUGIN.commands} commands, ${PLUGIN.skills} skills)`);
