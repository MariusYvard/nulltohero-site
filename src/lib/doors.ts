/**
 * The ten doors, told once.
 *
 * Since plugin v2.0.0 the command surface is organized by intention: ten doors
 * cover the whole journey (start, build, improve, check, fix, rework, ship, be
 * found, report, preview) and the other fifty commands stay one level down,
 * addressable by name when you want the specialist directly. Retired names keep
 * routing through the plugin's versioned alias table (tools/data/intents.csv).
 *
 * Same rule as facts.ts and pipeline.ts: one source, two renderers. The home
 * section and the /commands door badges both read this file; a door listed here
 * that the plugin does not ship is caught by the badge join against
 * commands.json (an unknown door simply never renders a badge, and the home
 * section is reviewed against the plugin README's "Pick your goal" table, which
 * the plugin's own check 38 keeps honest).
 */
export type Door = {
  goal: string;
  command: string;
  /** skill + table command name, for the /commands badge join */
  key: string;
  returns: string;
};

export const DOORS: Door[] = [
  { goal: "Start from nothing", command: '/siteasy express "a coffee shop site"', key: "siteasy express", returns: "Brief to styled landing page: concept, tokens, build, checks" },
  { goal: "Build a page or component", command: "/siteasy build", key: "siteasy build", returns: "Production-ready front-end that matches your brand file" },
  { goal: "Make it better (bland, busy, static)", command: "/siteasy improve index.html", key: "siteasy improve", returns: "The right axis picked from your complaint and applied" },
  { goal: "Check the whole site", command: "/audit yoursite.com", key: "audit full", returns: "One site health score and one merged action plan" },
  { goal: "Fix what the audit found", command: "/siteasy fix", key: "siteasy fix", returns: "Findings executed batch by batch through the remediation map" },
  { goal: "Rework an existing site", command: "/siteasy overhaul yoursite.com", key: "siteasy overhaul", returns: "Baseline, fixes, before/after proof the score moved" },
  { goal: "Finish and ship", command: "/siteasy ship", key: "siteasy ship", returns: "Polish, defect scan, deterministic audit and hardening, in order" },
  { goal: "Be found on Google and in AI answers", command: "/seo yoursite.com", key: "seo audit", returns: "A scored report and a prioritized action plan" },
  { goal: "Get a client-ready report", command: "/audit report", key: "audit report", returns: "Deliverable Markdown, self-contained HTML page, or PDF" },
  { goal: "See it the way a real browser does", command: "/inspect preview index.html", key: "inspect preview", returns: "Desktop and mobile screenshots, bugs fixed in a loop" },
];

export const DOOR_KEYS = new Set(DOORS.map((d) => d.key));
