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

/* Read the table's own header instead of assuming its shape.
   The old parser hard-coded `| command | Category | Description | Reference |` and took
   column 3 as the description. That is siteasy's shape. seo, inspect and audit use
   `| Command | What it does | Reference |`, so for 32 of the 65 commands column 3 was the
   REFERENCE, and the site shipped "[references/audit.md](references/audit.md)" as the
   description of /seo audit — six of them byte-identical. It parsed 65 rows and failed
   no check, because "did it parse" and "did it parse the right column" are not the same
   question. The header answers the second one. */
/* Split on unescaped pipes only. `report [url\|file\|generate]` puts an escaped pipe
   INSIDE its command cell, so a naive split("|") shreds that row and silently drops the
   command: the first run of this parser reported 18 seo commands where there are 19, and
   64 total where facts.ts says 65. The count is the tell. Unescape after splitting, so
   the JSON carries `[url|file|generate]` and not the markdown backslash. */
const cells = (line) =>
  line
    .replace(/^\s*\|/, "")
    .replace(/(?<!\\)\|\s*$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, "|"));
const findCol = (header, names) => header.findIndex((h) => names.includes(h.toLowerCase()));

/* The date the site's facts last actually changed, which is the day this ran against a
   plugin release. Not the build date: a rebuild with no content change is not a
   modification, and `dateModified` that ticks up every deploy is a freshness claim the
   site has not earned. sync-llms.mjs stamps today's date for llms.txt on every build;
   this one is the honest source for structured data. */
const out = { version, generatedAt: new Date().toISOString().slice(0, 10), generatedFrom: "SKILL.md Commands tables", skills: [] };
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

  const rows = body.split("\n").filter((l) => /^\s*\|/.test(l));
  if (rows.length < 3) {
    console.error(`[sync-commands] no Commands table found in ${skill.id}/SKILL.md`);
    process.exit(1);
  }

  const header = cells(rows[0]);
  const iCmd = findCol(header, ["command"]);
  const iDesc = findCol(header, ["description", "what it does"]);
  const iCat = findCol(header, ["category"]);
  if (iCmd === -1 || iDesc === -1) {
    console.error(`[sync-commands] ${skill.id}/SKILL.md: cannot locate the command and description columns in header: ${rows[0].trim()}`);
    console.error(`[sync-commands] add the new column name to findCol() rather than guessing an index.`);
    process.exit(1);
  }

  const seen = new Set();
  const commands = [];
  for (const row of rows.slice(2)) {
    // slice(2) skips the header and its |---|---| separator
    const c = cells(row);
    const m = /^`([a-z0-9-]+)([^`]*)`/.exec(c[iCmd] ?? "");
    if (!m) continue;
    const name = m[1].trim();
    if (seen.has(name)) continue;
    seen.add(name);
    commands.push({
      name,
      args: m[2].trim(),
      category: iCat === -1 ? "" : c[iCat],
      description: (c[iDesc] ?? "").replace(/\s+/g, " "),
    });
  }

  if (commands.length === 0) {
    console.error(`[sync-commands] parsed 0 commands from ${skill.id}/SKILL.md — the table shape changed, fix the parser`);
    process.exit(1);
  }

  /* The check the old parser lacked. It is not enough to parse rows: a description that
     is a reference link means the column mapping slid, and the site would ship it as
     product copy. This is the exact failure that shipped to production. */
  const linkish = commands.filter((c) => /^\[?references\//.test(c.description) || c.description === "");
  if (linkish.length) {
    console.error(`[sync-commands] ${skill.id}: ${linkish.length} description(s) look like a reference link or are empty, e.g. ${linkish[0].name} -> "${linkish[0].description}"`);
    console.error(`[sync-commands] the description column is misidentified. Header was: ${rows[0].trim()}`);
    process.exit(1);
  }

  out.skills.push({ ...skill, commands });
  total += commands.length;
  console.log(`  /${skill.id.padEnd(8)} ${String(commands.length).padStart(2)} commands`);
}

out.total = total;

/* Cross-check the parse against the counts a human maintains in src/lib/facts.ts.
   Two independent readings of the same plugin: if they disagree, one of them is wrong
   and neither this script nor the human gets to decide which silently. The first run of
   the header-driven parser produced 64 where facts says 65, and that gap is the only
   reason the dropped `report` command was ever noticed. A parser that reports its own
   total and nothing else can be confidently wrong. */
const expected = { siteasy: 33, seo: 19, audit: 10, inspect: 3 };
const drift = out.skills
  .filter((s) => expected[s.id] !== undefined && s.commands.length !== expected[s.id])
  .map((s) => `/${s.id}: parsed ${s.commands.length}, facts.ts says ${expected[s.id]}`);
if (drift.length) {
  console.error(`[sync-commands] count mismatch against src/lib/facts.ts:`);
  for (const d of drift) console.error(`  ${d}`);
  console.error(`[sync-commands] either the parser is dropping rows or facts.ts is stale. Fix one, do not ignore this.`);
  process.exit(1);
}

const dest = path.join(process.cwd(), "src", "data", "commands.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log(`[sync-commands] v${version}: ${total} commands across ${out.skills.length} skills -> src/data/commands.json`);
