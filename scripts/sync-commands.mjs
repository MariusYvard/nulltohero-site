#!/usr/bin/env node
// Reads the Commands table out of each SKILL.md in the NullToHero plugin repo and
// writes src/data/commands.json. Run it at every plugin release, the same way the
// plugin runs tools/sync-overview.mjs:
//
//   node scripts/sync-commands.mjs [path-to-plugin-repo]
//   NULLTOHERO_REPO=/path/to/repo node scripts/sync-commands.mjs
//
// Why generated: the site's numbers were hand-copied to nine places and every one
// of them had rotted to v1.2.0 / 35 commands while the plugin shipped v1.33.0 / 65.
// A hand-written list of 65 commands would rot the same way, only more slowly and
// less visibly. The output is committed so the build never needs the plugin repo.
//
// Fails loudly rather than writing a half-empty page: a commands page that silently
// lost a skill is worse than a build error.

import fs from "node:fs";
import path from "node:path";

const SKILLS = [
  { id: "siteasy", title: "Make it look designed", blurb: "Plan, build and refine interfaces the way a studio would." },
  { id: "seo", title: "Make it findable", blurb: "Get found by Google and by the engines that read your site first." },
  { id: "inspect", title: "Make it pass review", blurb: "Named rules, measured values, verdicts. Not vibes." },
  { id: "audit", title: "Score the whole thing", blurb: "Every specialist at once, reconciled into one scored report." },
];

const repo = process.argv[2] || process.env.NULLTOHERO_REPO || "C:/Users/mariu/vitrines/NullToHero";

if (!fs.existsSync(path.join(repo, ".claude-plugin", "plugin.json"))) {
  console.error(`[sync-commands] not a NullToHero plugin repo: ${repo}`);
  console.error(`[sync-commands] pass the path: node scripts/sync-commands.mjs <path>  (or set NULLTOHERO_REPO)`);
  process.exit(1);
}

const version = JSON.parse(fs.readFileSync(path.join(repo, ".claude-plugin", "plugin.json"), "utf8")).version;

// | `command [arg]` | Category | Description | Reference |
const ROW = /^\|\s*`([a-z0-9-]+)([^`]*)`\s*\|([^|]*)\|([^|]*)\|/gim;

const out = { version, generatedFrom: "SKILL.md Commands tables", skills: [] };
let total = 0;

for (const skill of SKILLS) {
  const file = path.join(repo, "skills", skill.id, "SKILL.md");
  if (!fs.existsSync(file)) {
    console.error(`[sync-commands] missing ${file}`);
    process.exit(1);
  }
  const md = fs.readFileSync(file, "utf8");
  const section = md.split(/^## Commands/m)[1] || "";
  const body = section.split(/^## /m)[0] || "";

  const seen = new Set();
  const commands = [];
  for (const m of body.matchAll(ROW)) {
    const name = m[1].trim();
    if (seen.has(name)) continue;
    seen.add(name);
    commands.push({
      name,
      args: m[2].trim(),
      category: m[3].trim(),
      description: m[4].trim().replace(/\s+/g, " "),
    });
  }

  if (commands.length === 0) {
    console.error(`[sync-commands] parsed 0 commands from ${skill.id}/SKILL.md — the table shape changed, fix the parser`);
    process.exit(1);
  }

  out.skills.push({ ...skill, commands });
  total += commands.length;
  console.log(`  /${skill.id.padEnd(8)} ${String(commands.length).padStart(2)} commands`);
}

out.total = total;

const dest = path.join(process.cwd(), "src", "data", "commands.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log(`[sync-commands] v${version}: ${total} commands across ${out.skills.length} skills -> src/data/commands.json`);
