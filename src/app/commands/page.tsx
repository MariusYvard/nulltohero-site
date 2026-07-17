import type { Metadata } from "next";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { CopyButton } from "@/components/CopyButton";
import { BreadcrumbLd } from "@/components/JsonLd";
import { PLUGIN } from "@/lib/facts";
import data from "@/data/commands.json";

export const metadata: Metadata = {
  title: `All ${PLUGIN.commands} commands for Claude, one line each`,
  description: `Every command in NullToHero: ${PLUGIN.perSkill.siteasy} for design, ${PLUGIN.perSkill.seo} for search, ${PLUGIN.perSkill.audit} for the scored audit, ${PLUGIN.perSkill.inspect} for the detector. One line each. Free, ${PLUGIN.licence}. Install in two lines.`,
  // Self-referencing. Without this the root layout's canonical:"/" is inherited
  // verbatim and this page declares the homepage as its canonical.
  alternates: { canonical: "/commands/" },
  openGraph: {
    title: `NullToHero: all ${PLUGIN.commands} commands`,
    description: "One line each. Design, search, quality and the scored audit.",
    url: "/commands/",
  },
};

const INSTALL = "/plugin install null-to-hero@null-to-hero-marketplace";

/* This page is generated: scripts/sync-commands.mjs reads the Commands table out
   of each SKILL.md in the plugin repo. Hand-writing 65 rows would rot exactly the
   way the hero's numbers rotted to v1.2.0 while the plugin shipped v1.33.0. */
export default function Commands() {
  return (
    <>
      <BreadcrumbLd name={`All ${PLUGIN.commands} commands`} path="/commands/" />

      <section className="mx-auto max-w-5xl px-6 pb-12 pt-32 sm:pt-40">
        <BlurFade>
          <p className="font-mono text-sm uppercase tracking-widest text-red">The vocabulary</p>
          <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
            {data.total} commands.
            <br />
            <span className="text-red">One line each.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            This list is generated from the plugin&apos;s own skill definitions at v{data.version},
            so it cannot drift from what you actually install. Every command is one line in
            Claude Code or Cowork.
          </p>
        </BlurFade>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {data.skills.map((skill, si) => (
          <BlurFade key={skill.id} delay={si === 0 ? 0 : 0.04} inViewMargin="-80px">
            <section className="border-t border-line py-14" aria-labelledby={`skill-${skill.id}`}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 id={`skill-${skill.id}`} className="font-mono text-2xl font-bold text-red">
                  /{skill.id}
                </h2>
                <p className="text-xl font-bold tracking-tight text-ink">{skill.title}</p>
                <span className="font-mono text-sm text-ink-faint">
                  {skill.commands.length} commands
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-ink-soft">{skill.blurb}</p>

              <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
                {skill.commands.map((c) => (
                  <li key={c.name} className="bg-paper p-4">
                    <p className="font-mono text-sm">
                      <span className="text-ink-faint">/{skill.id} </span>
                      <span className="font-bold text-ink">{c.name}</span>
                      {c.args ? <span className="text-ink-faint">{c.args}</span> : null}
                    </p>
                    <p className="mt-1.5 text-sm text-ink-soft">{c.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          </BlurFade>
        ))}

        <BlurFade inViewMargin="-80px">
          {/* The one border beam on the site. L-MOTION-2 budgets infinite loops at two
              per view; this page spends its whole budget on the single thing it wants
              you to do. Reduced motion drops it entirely. */}
          <div className="relative mt-16 overflow-hidden rounded-xl border border-line bg-paper-dim p-10 text-center">
            <BorderBeam />
            <h2 className="text-3xl font-black tracking-tight">Every one of them, one install away.</h2>
            <p className="mx-auto mt-4 max-w-md text-ink-soft">
              Works in Claude Code and Claude Cowork. Free, {PLUGIN.licence}, auto-updates through
              the marketplace.
            </p>
            <div className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-md border border-line text-left">
              <pre className="flex-1 overflow-x-auto bg-white/5 px-4 py-3 font-mono text-sm">
                <code>{INSTALL}</code>
              </pre>
              <CopyButton text={INSTALL} />
            </div>
            <div className="mt-8">
              <Link
                href="/journey"
                className="inline-flex min-h-12 items-center rounded-md border border-line px-6 font-bold text-ink hover:bg-paper-high"
              >
                See the pipeline →
              </Link>
            </div>
          </div>
        </BlurFade>
      </div>
    </>
  );
}
