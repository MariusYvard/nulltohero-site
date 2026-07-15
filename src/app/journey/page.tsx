import type { Metadata } from "next";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { BreadcrumbLd } from "@/components/JsonLd";
import { PLUGIN } from "@/lib/facts";

export const metadata: Metadata = {
  title: "The journey",
  // 160 chars or Google truncates it. The old copy ran to 187 and lost its own ending,
  // and no audit had noticed because they all read the home page. Interpolated, so it
  // moves with facts.ts: keep the tail short enough that PLUGIN.commands growing a
  // digit cannot push it back over.
  description: `From a blank page to a site that passes review, in six corrections: research, structure, voice, the detector, search, the score. ${PLUGIN.commands} commands, ${PLUGIN.licence}.`,
  openGraph: {
    title: "Null to hero, in six corrections",
    description: "The pipeline, phase by phase: research before pixels, structure then rhythm, commit to a voice, face the detector, findable and fast, then score the whole thing.",
    url: "/journey/",
  },
};

type Phase = {
  n: string;
  caption: string;
  title: string;
  body: string;
  commands: string[];
  verdict: { tag: "NULL" | "FAIL" | "WARN" | "PASS"; text: string };
};

/* Six phases, not five: /audit shipped in 1.32.0 and it is where the pipeline
   actually ends now. The captions echo the hero's narration, deliberately — this
   page is the same story told slowly. */
const PHASES: Phase[] = [
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

const TAG_STYLE: Record<Phase["verdict"]["tag"], string> = {
  NULL: "bg-paper-faint text-paper-dim",
  FAIL: "bg-red-solid text-white",
  WARN: "bg-amber text-paper-dim",
  PASS: "bg-green text-paper-dim",
};

export default function Journey() {
  return (
    <>
      <BreadcrumbLd name="The journey" path="/journey/" />

      {/* The one place a progress bar is honest: this page's subject IS progress. */}
      <ScrollProgress />

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-32 sm:pt-40">
        <BlurFade>
          <p className="font-mono text-sm uppercase tracking-widest text-red">The pipeline</p>
          <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
            Null to hero,
            <br />
            <span className="text-red">in six corrections.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            Every page starts null. Not bad, not good: undecided. Each phase below removes one
            way of being undecided, and each one ends in a verdict you can check rather than
            a feeling you have to trust.
          </p>
        </BlurFade>
      </section>

      <h2 id="phases-title" className="sr-only">
        The six phases
      </h2>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <ol className="border-t border-line">
          {PHASES.map((p, i) => (
            <li key={p.n}>
              <BlurFade delay={i === 0 ? 0 : 0.05} inViewMargin="-80px">
                <article className="border-b border-line py-14">
                  {/* the hero's narration line, verbatim in form: mono, lowercase, numbered */}
                  <p className="font-mono text-sm text-ink-faint">
                    {p.n} — {p.caption}
                  </p>
                  <h3 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{p.title}</h3>
                  <p className="mt-4 text-ink-soft">{p.body}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.commands.map((c) => (
                      <code
                        key={c}
                        className="rounded border border-line bg-paper-high px-2.5 py-1 font-mono text-sm text-ink-soft"
                      >
                        {c}
                      </code>
                    ))}
                  </div>

                  {/* the redline stamp from act 4, at rest */}
                  <p className="mt-6 flex max-w-md items-baseline gap-2 rounded border border-line bg-paper-high px-2.5 py-1.5 font-mono text-xs text-ink">
                    <b className={`rounded px-1.5 py-0.5 text-[0.66rem] font-bold ${TAG_STYLE[p.verdict.tag]}`}>
                      {p.verdict.tag}
                    </b>
                    <span>{p.verdict.text}</span>
                  </p>
                </article>
              </BlurFade>
            </li>
          ))}
        </ol>

        <BlurFade inViewMargin="-80px">
          <div className="py-16 text-center">
            <h2 className="text-3xl font-black tracking-tight">Run it on your own site.</h2>
            <p className="mx-auto mt-4 max-w-md text-ink-soft">
              The whole pipeline is {PLUGIN.commands} commands across {PLUGIN.skills} skills. Free,{" "}
              {PLUGIN.licence}, and it updates itself through the marketplace.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/#install"
                className="inline-flex min-h-11 items-center rounded-md bg-red-solid px-6 font-bold text-white hover:bg-red-deep"
              >
                Install in one line
              </Link>
              <Link
                href="/commands"
                className="inline-flex min-h-11 items-center rounded-md border border-line px-6 font-bold text-ink hover:bg-paper-high"
              >
                All {PLUGIN.commands} commands
              </Link>
            </div>
          </div>
        </BlurFade>
      </div>
    </>
  );
}
