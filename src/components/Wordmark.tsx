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
/* Optical centring, measured on PAINTED ink — shadows included.
 *
 * Baseline alignment is wrong here and no nudge could save it: three words of three
 * different painted heights, sat on one baseline, cannot look level. And measuring
 * the glyphs while ignoring Hero's extrusion — 0.144em of visible red hanging below
 * its baseline — was measuring the wrong thing. Ink you can see is ink that counts.
 *
 * Hero is set at 0.95: its cap matches the others exactly at 1.0, but the extrusion
 * adds mass no cap height accounts for, so it read heavier than its neighbours.
 * Optical size is not measured size — this is the one number here chosen by eye,
 * and deliberately.
 *
 * Painted boxes at 100px, relative to the baseline (negative = above):
 *            top      bottom   height   centre
 *   Null    -74       +8       82       -33.00
 *   To      -74       +2       76       -36.00
 *   Hero    -70.3     +15.6    85.9     -27.36   (0.95 scale, +13.7 of extrusion)
 *
 * Common centre: -32.12 (the average, so the mark barely moves as a whole).
 * Each shift below is in ITS OWN span's em, hence the divisions.
 * Re-run all of it if the extrusion depth, the 0.95, or either face ever changes.
 */
const HERO_SCALE = 0.95;
const CENTRE = {
  null: 0.0088 / 1.042,
  to: 0.0388,
  hero: -0.0476 / HERO_SCALE,
} as const;

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
        style={{
          fontFamily: '"Black Monster", cursive',
          transform: `translateY(${CENTRE.null}em)`,
        }}
      >
        Null
      </span>

      {/* Both margins are measured, in the PARENT's em. They are the whole reason the
          three spans read as one word instead of a sentence.
          Raw ink gaps at 100px, before correction: Null>To = -9.6px (overlapping),
          To>Hero = +8.95px. Two causes, neither guessable by eye: Black Monster's
          italic L overhangs its own advance by 10.6px, and Satoshi's H carries a
          ~6.7px left side bearing at this scale. So To is pushed right and Hero is
          pulled LEFT — an earlier hand-set margin pushed Hero further right, the
          wrong direction, to fix a collision that could not happen.
          Target is a +8px ink gap at 100px on BOTH sides: enough white to breathe,
          per Marius, while staying tight enough to read as NullToHero. */}
      <span
        className="ml-[0.176em] font-black tracking-tight text-red"
        style={{ transform: `translateY(${CENTRE.to}em)` }}
      >
        To
      </span>

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
        className="ml-[-0.0095em] text-[0.95em] font-black tracking-tight text-ink"
        style={{
          transform: `translateY(${CENTRE.hero}em)`,
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
