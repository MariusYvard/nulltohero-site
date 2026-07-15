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
        className="text-[1.042em] leading-none text-ink"
        style={{ fontFamily: '"Black Monster", cursive' }}
      >
        Null
      </span>

      {/* Both margins are measured, in the PARENT's em, and they are what makes the
          three words read as one word rather than as a sentence.
          Ink gaps at 100px, before correction: Null>To = -9.6px, To>Hero = +9.3px.
          A 19px swing, which is exactly the "Null is glued to To while Hero floats
          off" that Marius saw. Two causes, neither guessable: Black Monster's italic
          L overhangs its own advance by 10.6px, and Satoshi's H carries a 7px left
          side bearing. So To is pushed right and Hero is pulled LEFT — my earlier
          hand-set margin pushed Hero further right, the wrong direction entirely.
          Target is a +2px ink gap at 100px: touching would be a ligature, and a
          normal letter gap is what makes it one word. */}
      <span className="ml-[0.116em] font-black tracking-tight text-red">To</span>

      {/* The extrusion trails down-right in the correction red, front face in ink:
          the same light-face / red-body relationship as the act-6 z-stack, which
          stacks 20 planes precisely so the body reads as solid.
          Steps are in em, never px: at a fixed 5px the body was ~28% of the glyph at
          18px and buried "Hero", and it got worse at every smaller size.
          EIGHT steps, not three. Three at 0.035em apart resolved as three separate
          ridges once the mark was seen large — a staircase, not a body. Eight at
          0.018em close the gaps while keeping the same 0.145em depth, and the red
          darkens along the run so the body turns away from the light instead of
          reading as one flat slab. */}
      <span
        className="ml-[-0.073em] font-black tracking-tight text-ink"
        style={{
          textShadow: Array.from({ length: 8 }, (_, i) => {
            const d = (i + 1) * 0.018;
            const mix = Math.round(100 - i * 8);
            return `${d}em ${d}em 0 color-mix(in oklab, var(--red) ${mix}%, black)`;
          }).join(", "),
        }}
      >
        Hero
      </span>
    </span>
  );
}
