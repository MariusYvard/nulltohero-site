import Link from "next/link";
import { PLUGIN } from "@/lib/facts";

/**
 * Our own 404, which exists for a markup reason before a design one.
 *
 * Next's built-in not-found ships its own <title> and <meta robots>, and the root
 * layout's `title.default` renders a <title> too, so every 404 in out/ went out with
 * TWO title elements back to back. Invalid markup, invisible in review, and only
 * harmless because the page is noindexed. Providing this file replaces the built-in
 * component, so exactly one title survives: the layout's.
 *
 * `not-found.tsx` cannot export `metadata` (it is not a page), so the noindex is
 * rendered here and hoisted into <head> by React. It is not optional: it was Next's
 * built-in that used to supply it, and that is the thing this file removes.
 *
 * Known and accepted: the canonical stays "/" here, inherited from the layout, because
 * there is no metadata export to override it. On a noindexed route nothing consumes it.
 */
export default function NotFound() {
  return (
    <>
      <meta name="robots" content="noindex" />
      <section className="mx-auto max-w-2xl px-6 pb-32 pt-40">
        <p className="font-mono text-sm uppercase tracking-widest text-red">404</p>
        <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          This page is null.
          <br />
          <span className="text-red">Nothing corrects that one.</span>
        </h1>
        <p className="mt-6 text-lg text-ink-soft">
          The address does not exist. The three that do are below.
        </p>
        <nav className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line" aria-label="Site">
          <Link href="/" className="bg-paper p-5 hover:bg-paper-high">
            <p className="font-bold text-ink">Home</p>
            <p className="mt-1 text-sm text-ink-soft">What the plugin is, and the two lines that install it.</p>
          </Link>
          <Link href="/journey" className="bg-paper p-5 hover:bg-paper-high">
            <p className="font-bold text-ink">The journey</p>
            <p className="mt-1 text-sm text-ink-soft">The pipeline, in six corrections.</p>
          </Link>
          <Link href="/commands" className="bg-paper p-5 hover:bg-paper-high">
            <p className="font-bold text-ink">All {PLUGIN.commands} commands</p>
            <p className="mt-1 text-sm text-ink-soft">Every command, grouped by skill, one line each.</p>
          </Link>
        </nav>
      </section>
    </>
  );
}
