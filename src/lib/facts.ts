/**
 * Single source of truth for every number this site claims about the plugin.
 *
 * These were duplicated across nine places (metadata, OG, footer, the verdict
 * strip, the skills grid, hero acts 5 and 6) and every one of them had rotted to
 * v1.2.0 / 3 skills / 35 commands while the plugin shipped v1.33.0 / 4 / 65. On a
 * site whose whole pitch is "not vibes: named rules, measured values", stale
 * numbers are the one lie that costs the argument. One constant, one edit.
 *
 * Upstream truth is the badge line in the plugin's README, which its own
 * validator enforces against the repository:
 *   **v1.34.0** · 4 skills · 65 commands · 117 reference docs · 15 audit sub-agents
 *
 * Verified against github.com/MariusYvard/NullToHero @ v1.34.0 (2026-07-15).
 * When bumping: re-read that badge, and re-count perSkill from each SKILL.md's
 * Commands table.
 *
 * Note the README carries TWO versions: that badge line, and a shields.io badge
 * above it. Read the badge line, not the shield — the shield sat at 1.21.0 for
 * thirteen releases and nothing caught it until v1.34.0 added the check.
 */
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
  version: "1.34.0",
  skills: 4,
  commands: 65,
  referenceDocs: 117,
  auditAgents: 15,
  /** tools/data/inspect-rules.csv */
  inspectRules: 71,
  /** tools/data/laws.csv — the numeric laws with stable ids */
  laws: 16,
  licence: "Apache 2.0",
  /** Commands declared in each skill's own SKILL.md table. Sums to `commands`. */
  perSkill: { siteasy: 33, seo: 19, audit: 10, inspect: 3 },
} as const;

/** "4 skills · 65 commands · 116 docs · Apache 2.0" — the one-line spec strip. */
export const SPEC_LINE = `${PLUGIN.skills} skills · ${PLUGIN.commands} commands · ${PLUGIN.referenceDocs} docs · ${PLUGIN.licence}`;
