/**
 * Single source of truth for every number this site claims about the plugin.
 *
 * These were duplicated across nine places (metadata, OG, footer, the verdict
 * strip, the skills grid, hero acts 5 and 6) and every one of them had rotted to
 * v1.2.0 / 3 skills / 35 commands while the plugin shipped v1.33.0 / 4 / 65. On a
 * site whose whole pitch is "not vibes: named rules, measured values", stale
 * numbers are the one lie that costs the argument. One constant, one edit.
 *
 * `version` is NOT typed here. scripts/sync-commands.mjs already reads it out of the
 * plugin repo and writes it into commands.json, so this file imports it rather than
 * restating it. Hand-copying it drifted twice in one afternoon (the plugin went
 * 1.33.1 -> 1.34.0 -> 1.35.0 -> 1.36.0 and this constant trailed every time), which is
 * the same rot that once left the site advertising v1.2.0 / 3 skills / 35 commands.
 * A number a human retypes on every release is a number that will be wrong: the one
 * that is already read from the source is the one to trust. Re-run `npm run
 * sync:commands` after a plugin release and the version follows on its own.
 *
 * The counts below still need a human, so when bumping: re-read the badge line in the
 * plugin's README (**vX.Y.Z** · 4 skills · 60 commands · 119 reference docs · 15 audit
 * sub-agents), and re-count perSkill from each SKILL.md's Commands table.
 *
 * Note the README carries TWO versions: that badge line, and a shields.io badge
 * above it. Read the badge line, not the shield — the shield sat at 1.21.0 for
 * thirteen releases and nothing caught it until v1.34.0 added the check.
 */
// Relative, not the "@/" alias, and with the JSON attribute: scripts/sync-llms.mjs
// imports this file straight from Node, which resolves neither tsconfig paths nor a
// bare JSON import. A constant the build can read but the sync script cannot is worse
// than a hand-typed one, because only one of the two outputs would go stale.
import commands from "../data/commands.json" with { type: "json" };
/**
 * Canonical origin. Every canonical, sitemap entry, OG url and llms.txt link is
 * built from this: change it here and nowhere else.
 *
 * No trailing slash. Next's `trailingSlash: true` adds one per route, and a double
 * slash in a canonical is a duplicate-content bug that is invisible until a crawler
 * finds it.
 *
 * On a custom domain later: change this, redeploy, then 301 the old host to the new
 * one and resubmit the sitemap. The redirects matter — without them the reputation
 * built on the old origin does not carry over.
 */
export const SITE_URL = "https://nulltohero.netlify.app";

export const PLUGIN = {
  /** Read from the plugin's own repo by sync-commands.mjs. Never type it here. */
  version: commands.version,
  /** The day the facts last changed, stamped by sync-commands.mjs. Not the build date. */
  updated: commands.generatedAt,
  skills: 4,
  commands: 60,
  referenceDocs: 119,
  auditAgents: 15,
  /** tools/data/inspect-rules.csv */
  inspectRules: 71,
  /** tools/data/laws.csv — the numeric laws with stable ids */
  laws: 16,
  licence: "Apache 2.0",
  /** Commands declared in each skill's own SKILL.md table. Sums to `commands`. */
  perSkill: { siteasy: 33, seo: 18, audit: 6, inspect: 3 },
} as const;

/** "4 skills · 65 commands · 116 docs · Apache 2.0" — the one-line spec strip. */
export const SPEC_LINE = `${PLUGIN.skills} skills · ${PLUGIN.commands} commands · ${PLUGIN.referenceDocs} docs · ${PLUGIN.licence}`;
