import { cn } from "@/lib/utils";

/**
 * The wordmark tells the site's own story in three words.
 *
 *   Null  — Black Monster, the marker that writes act 0 on the blank sheet
 *   To    — Satoshi, plain: the state with no taste yet (act 2)
 *   Hero  — Satoshi with a red extrusion, the 3D wordmark act 6 lands on
 *
 * Null to hero, in one line. It is the hero compressed to 130px, which is the
 * only reason to have a logo at all: the same argument, at a glance.
 *
 * The "3D" is stacked text-shadows, not WebGL. Act 6 extrudes 20 textured planes
 * in Z for its one signature moment; a nav logo that spun up a GL context on every
 * page would violate L-WEBGL-1 (gate it) and pay a context for 130 pixels. The
 * shadow reproduces the same read — light front face, red body trailing back —
 * for zero runtime.
 *
 * Colours come from tokens, so the mark re-themes with the nav over the white acts
 * (see html[data-hero-light] in globals.css).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex select-none items-baseline", className)} aria-hidden="true">
      {/* 1.042em is measured, not chosen: at the same font-size Black Monster's cap
          height is 71 to Satoshi's 74 (canvas actualBoundingBoxAscent at 100px), so
          74/71 = 1.042 makes the caps exactly equal. It was 1.3 — caps 25% too tall,
          towering over the other two words, with a hand-tuned `top` nudge papering
          over it. Two fonts only look aligned when their cap heights match; flex
          `items-baseline` then does the rest, since both sit on the same baseline.
          Re-measure this ratio if either face ever changes. */}
      <span
        className="mr-[0.1em] text-[1.042em] leading-none text-ink"
        style={{ fontFamily: '"Black Monster", cursive' }}
      >
        Null
      </span>

      <span className="font-black tracking-tight text-red">To</span>

      {/* The extrusion trails down-right in the correction red, front face in ink:
          the same light-face / red-body relationship as the act-6 z-stack.
          Steps are in em, not px. In px the body was a fixed 5px — ~28% of the glyph
          at 18px, which buried "Hero" under its own shadow and got worse at every
          smaller size. In em it holds the same proportion wherever the mark is set,
          and three steps is a body rather than three stacked drop shadows. */}
      <span
        className="ml-[0.06em] font-black tracking-tight text-ink"
        style={{
          textShadow: [
            "0.035em 0.035em 0 var(--red)",
            "0.07em 0.07em 0 color-mix(in oklab, var(--red) 80%, black)",
            "0.105em 0.105em 0 color-mix(in oklab, var(--red) 55%, black)",
          ].join(", "),
        }}
      >
        Hero
      </span>
    </span>
  );
}
