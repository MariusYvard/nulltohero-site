/**
 * The six corrections, told once.
 *
 * This lived inside journey/page.tsx, which meant the home page had no way to say
 * what the plugin actually does without restating it. It restated nothing instead:
 * the home shipped a hero, five numbers, four abstract cards and an install block,
 * and delegated every word of explanation to a link most visitors never click. The
 * fix is not more copy on the home, it is one source both pages read.
 *
 * Same rule as facts.ts: a sentence a human retypes in two places is a sentence that
 * will disagree with itself. `caption` and `title` are the short form the home uses;
 * `body` is the long form only /journey renders.
 *
 * Six phases, not five: /audit shipped in 1.32.0 and it is where the pipeline
 * actually ends now. The captions echo the hero's narration, deliberately: the
 * journey page is the same story told slowly.
 */
import { PLUGIN } from "@/lib/facts";

export type Phase = {
  n: string;
  caption: string;
  title: string;
  body: string;
  commands: string[];
  verdict: { tag: "NULL" | "FAIL" | "WARN" | "PASS"; text: string };
};

export const PHASES: Phase[] = [
  {
    n: "01",
    caption: "before the first pixel",
    title: "Research before pixels",
    body: "Most sites are wrong before a single line of CSS, because nobody wrote down who the page is for or what it must do. This phase produces the two documents every later command reads: what the product is, and what the design has committed to. Skipping it is why AI-built pages look like every other AI-built page: with no declared intent, the model reaches for the average.",
    commands: ["/siteasy setup", "/siteasy research", "/siteasy concept"],
    verdict: { tag: "NULL", text: "no intent declared, so anything goes" },
  },
  {
    n: "02",
    caption: "a page exists. it has no taste.",
    title: "Structure, then rhythm",
    body: "Information architecture first, then the typographic scale and the spacing system that carry it. A page with the right structure and no styling is readable. A page with beautiful styling over the wrong structure is a poster nobody can use. The scale is a decision, not a default: pick the steps, then hold them everywhere.",
    commands: ["/siteasy plan", "/siteasy layout", "/siteasy typeset"],
    verdict: { tag: "FAIL", text: "body set at 13px, the floor is 16px" },
  },
  {
    n: "03",
    caption: "effects are not design",
    title: "Commit to a voice",
    body: "This is where most pages reach for a gradient and a glow and call it a direction. A voice is a set of refusals: one accent, one signature moment, an anti-reference you name out loud. Effects are what you add when you have not decided anything. The plugin will ask you what you are refusing before it lets you add a beam.",
    commands: ["/siteasy craft", "/siteasy colorize", "/siteasy animate"],
    verdict: { tag: "WARN", text: "three identical cards: a template, not a decision" },
  },
  {
    n: "04",
    caption: "the detector names every crime",
    title: "Face the detector",
    body: `${PLUGIN.inspectRules} named rules with a severity, a good example and a bad one, run against your markup and your CSS. Not an opinion: a rule id, a measured value and a verdict you can argue with. It reads contrast in the colour space you actually wrote, opens a real Chromium at 375 and 1440, and tells you which of your beams is an infinite loop with no reduced-motion guard.`,
    commands: ["/inspect detect", "/inspect preview", "/inspect review"],
    verdict: { tag: "FAIL", text: "no visible focus ring on the only CTA" },
  },
  {
    n: "05",
    caption: "findable, fast, final",
    title: "Machines read it first",
    body: "Your first visitor is a crawler, and increasingly it is an answer engine that will quote you without sending anyone. Schema so the page can be understood, Core Web Vitals so it can be reached, llms.txt and citable passages so it can be quoted correctly. Written for the era where being indexed and being cited are two different jobs.",
    commands: ["/seo audit", "/seo schema", "/seo geo"],
    verdict: { tag: "WARN", text: "no VideoObject: invisible to video search" },
  },
  {
    n: "06",
    caption: "null to hero",
    title: "Score the whole thing",
    body: `${PLUGIN.auditAgents} specialists run in parallel across search visibility, front-end defects and design quality, then reconcile: one defect counted once, conflicts recorded rather than averaged away. You get a score you can recompute by hand from the verdicts, and a plan ordered by what actually blocks you. That is the difference between a review and a feeling.`,
    commands: ["/audit full", "/audit learnings", "/audit export"],
    verdict: { tag: "PASS", text: "corrected. committed. calm." },
  },
];

/** Shared by the home's condensed strip and /journey's stamps. */
export const TAG_STYLE: Record<Phase["verdict"]["tag"], string> = {
  NULL: "bg-paper-faint text-paper-dim",
  FAIL: "bg-red-solid text-white",
  WARN: "bg-amber text-paper-dim",
  PASS: "bg-green text-paper-dim",
};
