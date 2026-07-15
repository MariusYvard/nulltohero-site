import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { HeroScrolly } from "@/components/HeroScrolly";
import { NumberTicker } from "@/components/ui/number-ticker";
import { PLUGIN } from "@/lib/facts";

const INSTALL_1 = "/plugin marketplace add MariusYvard/NullToHero";
const INSTALL_2 = "/plugin install null-to-hero@null-to-hero-marketplace";

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
