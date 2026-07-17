import type { Metadata } from "next";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { BreadcrumbLd } from "@/components/JsonLd";
import { PLUGIN } from "@/lib/facts";
import { PHASES, TAG_STYLE } from "@/lib/pipeline";

export const metadata: Metadata = {
  // "The journey" alone said nothing to anyone who had not already met the brand: no
  // Claude, no plugin, no design. 24 characters of a 60-character budget, on a page
  // whose whole job is to explain the pipeline.
  title: "The journey: from a blank page to a scored site",
  // 160 chars or Google truncates it. The old copy ran to 187 and lost its own ending,
  // and no audit had noticed because they all read the home page. Interpolated, so it
  // moves with facts.ts: keep the tail short enough that PLUGIN.commands growing a
  // digit cannot push it back over.
  // This one gets NO call to action, unlike the home's and /commands'. It already sits
  // at 153 of the 160 available; the CTA was added here once and took it to 175, which
  // is the exact truncation this comment was written to prevent. The budget is spent.
  description: `From a blank page to a site that passes review, in six corrections: research, structure, voice, the detector, search, the score. ${PLUGIN.commands} commands, ${PLUGIN.licence}.`,
  // Self-referencing. Without this the root layout's canonical:"/" is inherited
  // verbatim and this page declares the homepage as its canonical.
  alternates: { canonical: "/journey/" },
  openGraph: {
    title: "Null to hero, in six corrections",
    description: "The pipeline, phase by phase: research before pixels, structure then rhythm, commit to a voice, face the detector, findable and fast, then score the whole thing.",
    url: "/journey/",
  },
};

/* PHASES and TAG_STYLE now live in @/lib/pipeline: the home page needed the same six
   phases to stop delegating every word of explanation to this link. */

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
                className="inline-flex min-h-12 items-center rounded-md bg-red-solid px-6 font-bold text-white hover:bg-red-deep"
              >
                Install in one line
              </Link>
              <Link
                href="/commands"
                className="inline-flex min-h-12 items-center rounded-md border border-line px-6 font-bold text-ink hover:bg-paper-high"
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
