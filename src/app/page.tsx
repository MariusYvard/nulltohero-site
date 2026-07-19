import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { HeroScrolly } from "@/components/HeroScrolly";
import { NumberTicker } from "@/components/ui/number-ticker";
import { InstallHowToLd, SoftwareLd, WebSiteLd } from "@/components/JsonLd";
import { PLUGIN } from "@/lib/facts";
import { DOORS } from "@/lib/doors";

const INSTALL_1 = "/plugin marketplace add MariusYvard/NullToHero";
const INSTALL_2 = "/plugin install null-to-hero@null-to-hero-marketplace";

/* The mechanics, which this page never stated. It opened on seven acts of a wordmark
   and closed on an install block, and the one sentence naming the prerequisite ("Works
   in Claude Code and Claude Cowork") sat in 14px grey under the second code block. A
   visitor who does not already know what a Claude plugin is learned nothing here: the
   whole explanation was one click away on /journey, which most of them never take.
   Four steps, each one a thing you actually type.

   No sample output is shown, and that is a decision, not an omission. The plugin's own
   doctrine is that an audit which invents failures is worse than one that misses them,
   because it gets believed. A fabricated terminal on the page that sells the detector
   would be the same lie, one floor up. Every claim below is traceable: the counts to
   facts.ts, the command descriptions to data/commands.json, which sync-commands.mjs
   generates from the plugin's own SKILL.md tables. */
const STEPS = [
  {
    n: "01",
    title: "Install it once",
    body: "Two lines, typed into Claude Code or Claude Cowork. It is a plugin: it lives inside Claude and adds commands to it, so there is nothing to host, no account and no dashboard. The marketplace keeps it current on its own.",
    code: INSTALL_2,
  },
  {
    n: "02",
    title: "Point it at your project",
    body: "Open the site you are working on and run setup. It reads what is already there and writes two documents: what the product is, and what the design has committed to. Every later command reads them, which is what stops the model reaching for the average.",
    code: "/siteasy setup",
  },
  {
    n: "03",
    title: "Ask for the work",
    body: `Say the goal, not a command name. Since v2.0.0 ten doors cover the journey (build, improve, check, fix, ship) and the other ${PLUGIN.commands - DOORS.length} specialists stay one level down, addressable by name. Retired names keep routing through a versioned alias table.`,
    code: "/siteasy build pricing page",
  },
  {
    n: "04",
    title: "Get a verdict, not a vibe",
    body: `What comes back has a rule id, a measured value and a severity you can argue with. The detector carries ${PLUGIN.inspectRules} named rules and opens a real Chromium at 375 and 1440; the audit reconciles ${PLUGIN.auditAgents} specialists into one score and a plan ordered by what actually blocks you.`,
    code: "/audit full",
  },
];

const FACTS: { n?: number; text?: string; label: string }[] = [
  { n: PLUGIN.skills, label: "skills" },
  { n: PLUGIN.commands, label: "commands" },
  { n: PLUGIN.referenceDocs, label: "reference docs" },
  { text: `v${PLUGIN.version}`, label: "current release" },
  { text: PLUGIN.licence, label: "free, forever" },
];

const SKILLS = [
  {
    cmd: "/siteasy",
    title: "Make it look designed",
    body: `${PLUGIN.perSkill.siteasy} commands that plan, build and refine interfaces the way a studio would: committed art direction before code, typography with intent, motion with a budget.`,
  },
  {
    cmd: "/seo",
    title: "Make it findable",
    body: `${PLUGIN.perSkill.seo} commands for full-site audits, Schema.org, Core Web Vitals and GEO: optimization for Google AI Overviews, ChatGPT and Perplexity. Built for the era where machines read your site first.`,
  },
  {
    cmd: "/inspect",
    title: "Make it pass review",
    body: `A deterministic detector with ${PLUGIN.inspectRules} named anti-pattern rules, a real Chromium preview on desktop and mobile, and a design-engineering code review. Not vibes: named rules, measured values, verdicts.`,
  },
  {
    cmd: "/audit",
    title: "Score the whole thing",
    body: `${PLUGIN.auditAgents} specialist sub-agents run in parallel across search, front-end defects and design, then reconcile into one scored report with a prioritized action plan. One defect counted once.`,
  },
];

export default function Home() {
  return (
    <>
      <SoftwareLd />
      <WebSiteLd />
      {/* Fed the same STEPS the section renders, so the markup cannot describe an
          install flow the page does not show. */}
      <InstallHowToLd steps={STEPS} />

      {/* Hero: 7-act null→hero scrollytelling (white → black), R3F 3D wordmark */}
      <HeroScrolly />

      {/* Verdict strip */}
      <section className="border-b border-line bg-paper-high" aria-label="Plugin facts">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-6 px-6 py-10">
          {FACTS.map((f) => (
            <div key={f.label} className="border-l border-line pl-4">
              <div className="text-3xl font-black tracking-tight">
                {f.n !== undefined ? <NumberTicker value={f.n} className="font-black tracking-tight" /> : f.text}
              </div>
              <div className="text-sm text-ink-faint">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works. Sits before the skills grid on purpose: "what is in the box"
          is unreadable to someone who does not yet know what the box is. */}
      <section className="border-b border-line" aria-labelledby="how-title">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-sm uppercase tracking-widest text-red">How it works</p>
          <h2 id="how-title" className="mt-3 text-4xl font-black tracking-tight">
            You type. It answers with receipts.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            NullToHero is a plugin for Claude, not an app you log into. You install it once and
            it adds {PLUGIN.commands} commands to the Claude you already use.
          </p>

          <ol className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-2">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col bg-paper p-8">
                <p className="font-mono text-sm text-red">{s.n}</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-3 flex-1 text-ink-soft">{s.body}</p>
                <pre className="mt-6 overflow-x-auto rounded-md border border-line bg-paper-dim px-4 py-3 font-mono text-sm text-ink">
                  <code>{s.code}</code>
                </pre>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The doors. Rendered from lib/doors.ts, the same file the /commands badges
          read, so the two surfaces cannot disagree about what a door is. */}
      <section className="border-b border-line bg-paper-high" aria-labelledby="doors-title">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-sm uppercase tracking-widest text-red">Where you enter</p>
          <h2 id="doors-title" className="mt-3 text-4xl font-black tracking-tight">
            Ten doors. Say the goal.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            The surface is organized by intention: these ten cover the whole journey, and the
            other {PLUGIN.commands - DOORS.length} commands stay one level down for when you want
            the specialist by name.
          </p>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {DOORS.map((d) => (
              <li key={d.key} className="flex flex-col bg-paper p-6">
                <h3 className="font-bold tracking-tight">{d.goal}</h3>
                <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-paper-dim px-3 py-2 font-mono text-sm text-ink">
                  <code>{d.command}</code>
                </pre>
                <p className="mt-2 text-sm text-ink-soft">{d.returns}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The skills. Count comes from SKILLS.length so the heading cannot drift from
          the grid the way "Three skills" did once /audit shipped. */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono text-sm uppercase tracking-widest text-red">What it does</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight">
          {["Zero", "One", "Two", "Three", "Four", "Five"][SKILLS.length] ?? SKILLS.length} skills. One standard.
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((s) => (
            <article key={s.cmd} className="bg-paper p-7">
              <p className="font-mono text-sm font-bold text-red">{s.cmd}</p>
              <h3 className="mt-3 text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-ink-soft">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* The condensed pipeline that stood here is gone: the hero's seven acts now carry
          the six phases themselves, so a strip repeating them one screen later was the
          same list said twice. /journey is still where the phases are explained at
          length, and the hero links to it. */}

      {/* Install */}
      <section id="install" className="border-t border-line bg-paper-dim">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <p className="font-mono text-sm uppercase tracking-widest text-red">Two lines. That&apos;s the pitch.</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Install NullToHero</h2>
          <div className="mt-8 space-y-5">
            <div>
              <p className="mb-2 font-mono text-sm text-paper-faint">1 · add the marketplace</p>
              <div className="flex overflow-hidden rounded-md border border-line">
                <pre className="flex-1 overflow-x-auto bg-white/5 px-4 py-3 font-mono text-sm">
                  <code>{INSTALL_1}</code>
                </pre>
                <CopyButton text={INSTALL_1} />
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-sm text-paper-faint">2 · install the plugin</p>
              <div className="flex overflow-hidden rounded-md border border-line">
                <pre className="flex-1 overflow-x-auto bg-white/5 px-4 py-3 font-mono text-sm">
                  <code>{INSTALL_2}</code>
                </pre>
                <CopyButton text={INSTALL_2} />
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-ink-faint">Works in Claude Code and Claude Cowork. Free, Apache 2.0, auto-updates through the marketplace.</p>
          <div className="mt-8">
            <Link href="/journey" className="inline-flex min-h-11 items-center rounded-md border border-line px-6 font-bold text-ink hover:bg-paper-high">
              See the full pipeline →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
