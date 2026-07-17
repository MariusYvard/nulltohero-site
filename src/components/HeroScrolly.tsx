"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  cubicBezier,
  backOut,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import dynamic from "next/dynamic";
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal";
import { ScrollHint } from "@/components/ScrollHint";
import { PHASES, type Phase } from "@/lib/pipeline";
import { PLUGIN, SPEC_LINE } from "@/lib/facts";

/* three.js and @react-three/fiber, in their own chunk, fetched when show3d flips.
   Statically imported they landed in the home page's own <script>: 857 KB raw, on every
   load, for act 6 of a ~940vh track. show3d already deferred the mount, but the import
   graph is fixed at build time and a useState cannot unspend a download.
   ssr:false is required, not stylistic: this touches document and WebGL, and the site
   is a static export. */
const Wordmark3D = dynamic(() => import("@/components/Wordmark3D"), { ssr: false });

/* The hand for act 0: [glyph, start s, duration s].
   Deliberately not metronomic. Capitals carry three strokes and take roughly twice
   as long as a lowercase; the small gap after each one is where a real hand lifts.
   That unevenness is the whole reason it reads as written rather than wiped. */
const PEN: [string, number, number][] = [
  ["N", 0.15, 0.30], ["u", 0.42, 0.17], ["l", 0.55, 0.13], ["l", 0.65, 0.13],
  ["T", 0.79, 0.28], ["o", 1.03, 0.17], ["H", 1.17, 0.30], ["e", 1.44, 0.17],
  ["r", 1.57, 0.15], ["o", 1.69, 0.18],
];

/**
 * The narration, one entry per act.
 *
 * This used to be seven strings rendered as a single 14px mono line in the bottom-left
 * corner, and it was the ONLY prose on screen for six of the seven acts: the h1, the
 * lede and the CTAs live in act 6, so a reader who had not reached the end had been
 * shown a wordmark rendered seven ways and told nothing. The form was never the
 * problem. The page simply had no words in it.
 *
 * The acts and /journey's six phases were already the same six beats — NOTES.md says
 * the captions echo the hero deliberately — but the two never met, so the hero showed
 * a story that only the journey page explained. Now each act reads its own phase out
 * of @/lib/pipeline: same source, one told fast, one told slow.
 *
 * Two irregularities the mapping exposed, both real, both fixed here:
 *
 *  - Act 1 (the terminal) answers to no phase. It is not a step of the work, it is the
 *    mechanics: what this thing is and where you type it. That was the single biggest
 *    hole on the page, so act 1 now carries it instead of a punchline.
 *  - Act 5 was captioned "corrected. committed. calm.", which is phase 06's PASS
 *    verdict, not a phase. Phase 05 (/seo, 19 commands) therefore appeared NOWHERE in
 *    the hero: the story ran design → detector → 3D and quietly dropped the second
 *    largest skill in the plugin. Act 5 now carries phase 05, and the verdict line
 *    drops to act 6 where it is earned.
 */
const MECHANICS = {
  caption: "it starts as a command",
  title: "It lives inside Claude",
  short:
    "Not an app you log into. A plugin: two lines to install, then it answers to slash commands in the Claude you already use.",
  /* The four it adds, not the install line.
     A chip is an unbreakable token — flex-wrap breaks BETWEEN chips, never inside one —
     so "/plugin install null-to-hero@null-to-hero-marketplace" measured 396px in the real
     JetBrains Mono against a 360px content box on desktop and 290px at 375px, and simply
     hung out of the card. Truncating it would have been worse: a half-command on the page
     that sells exactness. The install line has its own block below, with a copy button and
     no width limit; what act 1 owes the reader is what Claude gains, which is these. */
  commands: ["/siteasy", "/seo", "/inspect", "/audit"],
};

type Narration = { n: string; caption: string; title?: string; short?: string; commands?: string[] };

/* Written out rather than spread from PHASES. The hero numbers its acts 00-06 and the
   phases number themselves 01-06, and act 0 keeps its own caption ("a blank page and a
   marker" is the sheet you are looking at, not the phase's "before the first pixel"),
   so a spread would silently overwrite both n and caption with the phase's. Only
   title, short and commands are borrowed.

   Act 6 is caption-only: its prose is the h1 and lede rendered inside the act itself,
   and a narration card beside them would be the same voice speaking twice. */
const fromPhase = (n: string, caption: string, p: Phase): Narration => ({
  n,
  caption,
  title: p.title,
  short: p.short,
  commands: p.commands,
});

const NARRATION: Narration[] = [
  fromPhase("00", "null. a blank page and a marker.", PHASES[0]),
  { n: "01", ...MECHANICS },
  fromPhase("02", PHASES[1].caption, PHASES[1]),
  fromPhase("03", PHASES[2].caption, PHASES[2]),
  fromPhase("04", PHASES[3].caption, PHASES[3]),
  fromPhase("05", PHASES[4].caption, PHASES[4]),
  { n: "06", caption: "null to hero." },
];

/* Acts do NOT get equal sevenths of the scroll. An act should last as long as it
   takes to read, and they don't take the same time: the terminal has to type itself
   out, the detector has to stamp five redlines, the 3D word has to extrude. The blank
   sheet and the plain page are read at a glance. Equal segments were why the terminal
   was gone before it finished talking. */
const WEIGHT = [1.2, 1.9, 1, 1.2, 1.6, 1.2, 1.4];
const TOTAL = WEIGHT.reduce((a, b) => a + b, 0);
/* B[i] = where act i starts, B[i+1] = where it ends. B[7] === 1. */
const B: number[] = WEIGHT.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w / TOTAL], [0]);

const WIPE = 0.05; // scroll a boundary costs — constant, so every cut has the same weight
const SETTLE = 0.01; // an act is fully on screen just past its mark

/* No act ever fades out. Each one is COVERED by the next, and every boundary
   uses its own mechanism and its own easing, so nothing repeats:
     0>1 a blind pulls down     1>2 the terminal grows into the page
     2>3 the effects iris open   3>4 hard cut (the detector freezes the frame)
     4>5 a correction sweeps by  5>6 the frame opens like a lens
   The outgoing act keeps moving underneath, so it never reads as a still. */
/* Wipes are SCRUBBED, so they need in-out curves, not expo-out. An expo-out wipe
   is ~90% done at the midpoint of its scroll window: it snaps shut and then waits,
   which is the opposite of tracking the reader's hand. Only the content drift
   below keeps expo-out, where a late settle is what you want. */
const E_SHADE = cubicBezier(0.7, 0, 0.3, 1); // weighted, a blind with mass
const E_EXPAND = cubicBezier(0.45, 0, 0.2, 1); // the window opens, still tracking
const E_IRIS = cubicBezier(0.5, 0, 0.3, 1);
const E_SWEEP = cubicBezier(0.85, 0, 0.15, 1); // slow-fast-slow: a hand swiping across
const E_BAND = cubicBezier(0.5, 0, 0.25, 1);
const E_DRIFT = cubicBezier(0.16, 1, 0.3, 1);

type Move = { x?: number; y?: number; scale?: number; rotate?: number };

/* [tag, text, left, top, mobile top].
   The left/top pair scatters the stamps across the specimen the way a marked-up print
   looks, and it was tuned at desktop width only. At 375px it fell apart twice: a stamp
   at left 58% starts at 217px and runs up to 280px wide, so it ended 122px outside the
   viewport, and the two lowest ones (72%, 86%) sat underneath the narration card. On a
   phone every stamp goes to a single left margin and takes the fifth column instead.

   The mobile tops are bounded at BOTH ends, and the first attempt only respected one:
   they ran 8% to 60%, and 8% of a 667px screen is 53px, which is under a nav that
   measures 73px — the top stamp lost its badge behind the header. The usable band is
   the nav (73px, 11%) to the card (485px, 73%). These five sit at 14% to 62%, so the
   first clears the nav by 20px and the last clears the card by 21px. */
const ANNOTS: [string, string, string, string, string][] = [
  ["FAIL", "gradient text on a heading that has to be read", "8%", "12%", "14%"],
  ["FAIL", "body set at 13px, the floor is 16px", "58%", "30%", "26%"],
  ["FAIL", "no visible focus ring on the only CTA", "10%", "58%", "38%"],
  ["WARN", "three identical cards: a template, not a decision", "56%", "72%", "50%"],
  ["FAIL", "font chosen by nobody, for no reason", "30%", "86%", "62%"],
];

/* A full-page act. `clip` wipes it in; `enter`/`under` drift its content so the
   incoming and the outgoing layer move against each other. Opacity is a step,
   never a fade: it only unmounts the act once it is completely hidden. */
function Act({
  sp,
  i,
  clip,
  bgColor,
  enter = {},
  under = {},
  hardCut = false,
  children,
  className,
}: {
  sp: MotionValue<number>;
  i: number;
  clip?: MotionValue<string>;
  /** An animatable background, for an act whose surface arrives before its content. */
  bgColor?: MotionValue<string>;
  enter?: Move;
  under?: Move;
  hardCut?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const s = B[i];
  const e = B[i + 1];
  const last = i === 6;

  const on = hardCut ? s - 0.003 : s - WIPE - 0.03;
  const off = last ? 9 : e + 0.03;
  const vis = useTransform(sp, [on, on + (hardCut ? 0.003 : 0.001), off, off + 0.001], [0, 1, 1, 0]);
  /* opacity:0 does NOT stop an element receiving clicks. Every act is a full-screen
     absolute layer, so an invisible one still swallows every pointer event under it —
     act 4 especially, which has no clip at all (it's the hard cut) and therefore covers
     the viewport at z-index 4 for the whole scroll. Gate it on the same step. */
  const pe = useTransform(vis, (v) => (v > 0.5 ? "auto" : "none"));

  const range = [s - WIPE, s + SETTLE, e - WIPE, e + SETTLE];
  const x = useTransform(sp, range, [enter.x ?? 0, 0, 0, under.x ?? 0], { ease: E_DRIFT });
  const y = useTransform(sp, range, [enter.y ?? 0, 0, 0, under.y ?? 0], { ease: E_DRIFT });
  const scale = useTransform(sp, range, [enter.scale ?? 1, 1, 1, under.scale ?? 1], { ease: E_DRIFT });
  const rotate = useTransform(sp, range, [enter.rotate ?? 0, 0, 0, under.rotate ?? 0], { ease: E_DRIFT });

  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ clipPath: clip, backgroundColor: bgColor, opacity: vis, pointerEvents: pe, zIndex: i, willChange: "clip-path" }}
    >
      {/* On a phone the specimen is centred BETWEEN the nav and the card, not in the
          viewport. Nothing from sm up.
          Two obstacles, one at each end. The narration card owns the bottom 182px of a
          667px screen (24px of offset plus 158px at its tallest), and the nav is fixed and
          measures 73px. Centring in the full height put the card on the mock's own content
          (it covered "Feature two" on act 2); padding only the bottom then slid the mock
          straight up under the nav and sheared its heading off. pt-20 clears the nav by
          7px, pb-48 clears the card by 10px, and the act-2 mock measures ~321px on iOS
          against the 395px that leaves. Both ends, or neither.
          Desktop untouched: there the card is a 400px note in the margin of a 1536px
          viewport and nothing collides. */}
      <motion.div className="grid h-full w-full place-items-center pb-48 pt-20 sm:p-0" style={{ x, y, scale, rotate, willChange: "transform" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* One redline that slams in like a stamp (overshoot settle), staggered by index. */
function Annotation({ sp, k, tag, txt, l, t, mt }: { sp: MotionValue<number>; k: number; tag: string; txt: string; l: string; t: string; mt: string }) {
  const start = B[4] + 0.012 + k * 0.019;
  const opacity = useTransform(sp, [start, start + 0.014], [0, 1]);
  const scale = useTransform(sp, [start, start + 0.06], [1.9, 1], { ease: backOut });
  const rotate = useTransform(sp, [start, start + 0.06], [k % 2 ? 10 : -10, k % 2 ? 0.8 : -0.8], { ease: backOut });
  return (
    <motion.span
      /* left/top as custom properties, not as inline left/top: an inline style cannot
         carry a media query, and these two positions have to differ by breakpoint. */
      style={{ opacity, scale, rotate, transformOrigin: "center", ["--ax" as string]: l, ["--ay" as string]: t, ["--my" as string]: mt }}
      className="absolute left-4 top-[var(--my)] flex max-w-[min(280px,calc(100vw-2rem))] items-baseline gap-2 rounded border border-line bg-paper-high px-2.5 py-1.5 font-mono text-xs text-ink shadow-xl sm:left-[var(--ax)] sm:top-[var(--ay)] sm:max-w-[280px]"
    >
      {/* Staging, not chrome. These stamps depict an audit overlay landing on the slop
          page, so they are drawn the way such an overlay looks rather than the way this
          site's own buttons are built: white on --red is 3.68:1 and white on --amber is
          2.18:1, both under AA. Deliberate, and therefore declared: the exemption is
          machine-readable so the audit subtracts it from the count instead of a human
          waving it away every run. Scope is this element only. If these badges ever stop
          being a depiction and start being real UI, delete the attribute, do not widen it.
          See the exemption doctrine in NOTES.md. */}
      <b
        data-contrast-exempt="staging"
        data-contrast-exempt-reason="Depicts the audit overlay stamping the slop page (act 4). The badge's unreadability is the subject, not a defect in this site's own controls."
        className={`rounded px-1.5 py-0.5 text-[0.66rem] font-bold text-white ${tag === "FAIL" ? "bg-red" : "bg-amber"}`}
      >
        {tag}
      </b>
      <span>{txt}</span>
    </motion.span>
  );
}

/* The slop page. Rendered twice (act 3 live, act 4 frozen under the redlines),
   so the hard cut between them lands on identical pixels and reads as a freeze.

   aria-hidden, and that is not a detail. Every act ships in the initial HTML — only
   clip-path and opacity decide what a human sees — so in document order this parody
   ("Unleash the power of AI-driven synergy, instantly.") sat BEFORE the real h1, twice,
   unmarked. A snippet heuristic reading the first body text had a clean path to quoting
   the joke as the product's actual pitch, and a screen reader announced a fake nav bar
   as if it were this site's. It is a specimen the page is examining, not a claim the
   page is making: it belongs to the eye only. Act 0's decorative wordmark already did
   this; the mocks were the ones that got missed. */
function SlopPage({ orbY, orbScale }: { orbY: MotionValue<string>; orbScale?: MotionValue<number> }) {
  return (
    <div aria-hidden="true" className="contents">
      <motion.div
        style={{ y: orbY, scale: orbScale }}
        className="pointer-events-none absolute left-1/2 top-[6%] h-[62vw] max-h-[760px] w-[62vw] max-w-[760px] -translate-x-1/2 rounded-full [background:radial-gradient(circle,rgba(139,92,246,0.5),rgba(236,72,153,0.1)_70%)] blur-[64px]"
      />
      <div className="relative w-[min(86vw,640px)] text-center font-sans">
        <div className="mb-[7vh] flex justify-between text-[13px] text-[#b9b3d6]">
          <b className="text-white">NullToHero</b>
          <span>Features&ensp;Pricing&ensp;Blog</span>
        </div>
        <p className="mb-3.5 bg-gradient-to-r from-[#a78bfa] to-[#ec4899] bg-clip-text text-[clamp(2.6rem,8vw,4.8rem)] font-extrabold leading-[1.04] text-transparent">NullToHero</p>
        <p className="mb-[22px] text-[15px] text-[#9d97bd]">Unleash the power of AI-driven synergy, instantly.</p>
        <span className="inline-block rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-[30px] py-[11px] text-sm font-bold text-white">Get Started</span>
        <div className="mt-[7vh] flex gap-3.5">
          {[0, 1, 2].map((n) => <span key={n} className="h-[72px] flex-1 rounded-[10px] border border-white/10 bg-white/[0.06] backdrop-blur" />)}
        </div>
      </div>
    </div>
  );
}

export function HeroScrolly() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [show3d, setShow3d] = useState(false);
  /* Phone only: the narration card opens on demand. At 400px on a desktop it is a note
     in the margin and the specimen keeps the screen; at 88vw on a 375px phone it is a
     curtain — it covered the very redlines act 4 exists to show. Closed, it is a caption
     and a title. Deliberately NOT keyed to idx: someone who opens it at act 2 wants it
     open at act 3, and re-tapping at every wipe would be its own defect. */
  const [openCard, setOpenCard] = useState(false);

  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const sp = scrollYProgress;

  useEffect(() => {
    setMounted(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIdx(6);
      setShow3d(true);
    }
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let ni = 6;
    for (let k = 0; k < 7; k++) if (v < B[k + 1]) { ni = k; break; }
    setIdx(ni);
    // Warm the WebGL context two acts early. Mounting it at act 5 meant R3F was still
    // initialising (context + canvas texture) while the reader arrived on act 6, so the
    // word turned up late. Still gated: nothing WebGL exists on first paint.
    if (ni >= 4) setShow3d(true);
  });

  /* The terminal's screen, in viewport percentages, measured rather than assumed.
     Kept after act 1 unmounts: the box does not move, and the 1>2 growth runs past
     the point where idx leaves 1. Re-measured on resize because every edge here is
     viewport-relative. */
  const termRef = useRef<HTMLDivElement>(null);
  const [termBox, setTermBox] = useState<{ t: number; r: number; b: number; l: number } | null>(null);

  useEffect(() => {
    if (idx !== 1) return;
    const measure = () => {
      const el = termRef.current;
      if (!el) return;
      // The window itself, chrome included: it is the window that grows into the page.
      const r = el.getBoundingClientRect();
      const W = window.innerWidth;
      const H = window.innerHeight;
      if (r.width === 0 || r.height === 0) return;
      setTermBox({
        t: (r.top / H) * 100,
        r: ((W - r.right) / W) * 100,
        b: ((H - r.bottom) / H) * 100,
        l: (r.left / W) * 100,
      });
    };
    /* Measure only once the act has stopped drifting. Act 1 enters with y:40, and
       idx flips to 1 at the START of that drift, so an immediate read catches the
       terminal mid-flight and pins the paint a few px above where the screen ends
       up. rAF gets us past the current commit; the timeout gets us past the
       entrance. The box is static after that (the act holds still through the
       1>2 boundary by design — that is why `under` is empty on act 1). */
    const raf = requestAnimationFrame(measure);
    const settled = setTimeout(measure, 320);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settled);
      window.removeEventListener("resize", measure);
    };
  }, [idx]);

  // Acts 0 and 2 are white pages. Flag them so the nav inverts (see globals.css)
  // instead of sitting on the blank sheet as a dark slab.
  useEffect(() => {
    const el = document.documentElement;
    el.toggleAttribute("data-hero-light", idx === 0 || idx === 2);
    return () => el.removeAttribute("data-hero-light");
  }, [idx]);

  /* --- the six boundaries, one mechanism each --- */

  // 0>1 a blind pulls down over the sheet
  const p1 = useTransform(sp, [B[1] - WIPE, B[1] + SETTLE], [0, 1], { ease: E_SHADE });
  const b1 = useTransform(p1, [0, 1], [100, 0]);
  const clip1 = useMotionTemplate`inset(0% 0% ${b1}% 0%)`;

  /* 1>2 the terminal's output becomes the page, in two beats.
     Beat one (to 45%): the white paints DOWN inside the terminal's own box, the way
     a page paints, covering the command line by line. The window does not move yet,
     so you read it as this terminal producing this page.
     Beat two: the window then grows until it IS the page.
     Both beats in one inset(): the top/left/right insets hold at the terminal's box
     through beat one while the bottom inset travels 63>37 (the paint), then all four
     run to 0 (the growth).
     Before this the white background simply appeared at full size and full opacity,
     so the terminal blanked instantly and you watched an empty box grow — no cause,
     no effect, just a hard swap wearing a wipe's clothes. */
  /* 1>2 the terminal window grows until it IS the page.
     Geometry measured from the real terminal (min(86vw,660px), content height), not
     written in percentages that only ever matched one viewport. The clip starts on
     the window's own box and runs to full screen, keeping the rounded corner until
     the last moment so it reads as this window opening rather than a rectangle
     arriving.
     The white is faded IN over the first fifth rather than appearing at full opacity
     in one frame — which was the whole complaint: the terminal blanked instantly and
     you watched an empty box grow. This is a screen swapping its contents, contained
     inside one window, not two acts dissolving into each other; the act boundary
     itself is still a cover.
     I also tried painting the white down the screen line by line. It read as a white
     block, not as a page loading, because a terminal loading a web page is not a
     thing anyone has ever seen. Reverted. */
  const p2 = useTransform(sp, [B[2] - WIPE, B[2] + SETTLE], [0, 1], { ease: E_EXPAND });
  const box = termBox ?? { t: 35, r: 20, b: 35, l: 20 };
  const top2 = useTransform(p2, [0, 1], [box.t, 0]);
  const bot2 = useTransform(p2, [0, 1], [box.b, 0]);
  const l2 = useTransform(p2, [0, 1], [box.l, 0]);
  const r2 = useTransform(p2, [0, 1], [box.r, 0]);
  const rad2 = useTransform(p2, [0, 0.8, 1], [12, 12, 0]);
  const clip2 = useMotionTemplate`inset(${top2}% ${r2}% ${bot2}% ${l2}% round ${rad2}px)`;
  const white2 = useTransform(p2, [0, 0.2], [0, 1]);
  const bg2 = useMotionTemplate`rgba(255, 255, 255, ${white2})`;

  // 2>3 the effects iris open out of the page's centre
  const p3 = useTransform(sp, [B[3] - WIPE, B[3] + SETTLE], [0, 1], { ease: E_IRIS });
  const r3 = useTransform(p3, [0, 1], [0, 92]);
  const clip3 = useMotionTemplate`circle(${r3}% at 50% 42%)`;

  // 3>4 hard cut. The detector freezes the frame: the change is in the content, not a fade.
  const sat4 = useTransform(sp, [B[4], B[4] + 0.022], [1, 0.28]);
  const filter4 = useMotionTemplate`saturate(${sat4})`;

  // 4>5 a correction pass sweeps left to right, red edge first
  const p5 = useTransform(sp, [B[5] - WIPE, B[5] + SETTLE], [0, 1], { ease: E_SWEEP });
  const x5 = useTransform(p5, [0, 1], [100, 0]);
  const clip5 = useMotionTemplate`inset(0% ${x5}% 0% 0%)`;
  const barX = useTransform(p5, [0, 1], ["0%", "100%"]);
  const barOp = useTransform(p5, [0, 0.04, 0.94, 1], [0, 1, 1, 0]);

  // 5>6 the frame opens like a lens onto the black
  const p6 = useTransform(sp, [B[6] - WIPE, B[6] + SETTLE], [0, 1], { ease: E_BAND });
  const band = useTransform(p6, [0, 1], [50, 0]);
  const clip6 = useMotionTemplate`inset(${band}% 0% ${band}% 0%)`;

  /* --- content-level motion --- */
  const orbY = useTransform(sp, [B[3], B[5]], ["-6%", "12%"]);
  const bloom = useTransform(sp, [B[3] - 0.02, B[3] + 0.05], [0, 1], { ease: E_DRIFT });
  // starts the moment the lens cracks open, so the word is already extruding as it appears
  const extrude = useTransform(sp, [B[6] - WIPE * 0.5, 0.985], [0, 1], { ease: E_DRIFT });
  const renderH = useTransform(sp, [B[2] + 0.004, B[2] + 0.06], [100, 0], { ease: E_DRIFT });
  const renderClip = useMotionTemplate`inset(0 0 ${renderH}% 0)`;
  const copyY = useTransform(sp, [B[6] + 0.02, B[6] + 0.075], [48, 0], { ease: E_DRIFT });
  const copyOp = useTransform(sp, [B[6] + 0.02, B[6] + 0.06], [0, 1]);

  return (
    <section ref={trackRef} data-act={idx} className="relative h-[940vh]" aria-labelledby="hero-title">
      {/* 100dvh. The three viewport units each get this wrong in their own way on a phone.
          `vh` is the LARGE viewport, the size the page would be with the toolbar hidden,
          so the stage ran taller than the visible area and the card's chips sat under the
          browser chrome. `svh` is the small one, always visible, which fixed that and
          bought a worse thing: the moment Safari's toolbar retracts the visible area grows,
          the stage does not, and a black band of body opens under the act. `dvh` tracks
          the live viewport, so the act's background and the card follow the chrome down.
          The cost is real and accepted: dvh changes as the toolbar hides, so the stage
          re-centres its specimen once, early. A band of black under a full-bleed act is
          the more expensive of the two. Identical to vh on desktop. */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* 0 — NULL: a blank sheet, and the word writes itself onto it.
            The writing is time-based, NOT scroll-scrubbed: a hand has its own rhythm,
            and scrubbing would tie the pen's speed to the reader's wheel. Once written
            it just sits there until the blind comes down. */}
        <Act sp={sp} i={0} under={{ y: -44, scale: 0.97 }} className="bg-[#fbfaf7]">
          <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-40">
            <svg className="h-full w-full" aria-hidden="true">
              <filter id="paper-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#paper-grain)" opacity="0.4" />
            </svg>
          </div>
          <div className="relative -rotate-2 select-none" aria-hidden="true">
            <div
              className="flex items-baseline whitespace-nowrap text-[clamp(3.5rem,14.5vw,12.5rem)] leading-[1.15] text-[#dd3f2a]"
              style={{ fontFamily: '"Black Monster", cursive' }}
            >
              {PEN.map(([ch, delay, duration], i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  /* Ends overshoot so a brush glyph's overhang, which spills past its
                     own advance width, is never clipped off. The LEFT inset starts at 0
                     and only opens as the stroke passes: a brush ascender leans left of
                     its box, and a fixed -30% would leave red specks on the blank sheet
                     before the pen has touched it. */
                  initial={reduce ? false : { clipPath: "inset(-30% 100% -30% 0%)" }}
                  animate={{ clipPath: "inset(-30% -30% -30% -30%)" }}
                  transition={{ delay, duration, ease: [0.35, 0, 0.2, 1] }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
            <svg className="absolute left-[1%] top-[86%] w-[98%]" viewBox="0 0 600 20" fill="none" aria-hidden="true">
              <motion.path
                d="M5 12 C 160 4, 430 8, 595 10"
                stroke="#dd3f2a"
                strokeWidth={4}
                strokeLinecap="round"
                /* opacity snaps on with the stroke: a round cap on a zero-length path
                   paints a dot, which would sit on the blank sheet as a stray speck */
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { delay: 2.0, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                  opacity: { delay: 2.0, duration: 0.01 },
                }}
              />
            </svg>
          </div>

          {/* The sheet says nothing about scrolling, and everything past it needs a
              scroll. Leaves as soon as it is obeyed. */}
          <ScrollHint sp={sp} />
        </Act>

        {/* 1 — TERMINAL: the blind lands, the command types itself. */}
        <Act sp={sp} i={1} clip={clip1} enter={{ y: 40 }} under={{ scale: 1.06 }} className="bg-[oklch(19%_0.012_265)]">
          {/* Type sized to the box, not to the desktop.
              The box is w-[min(86vw,660px)] and the pre inside it has p-4, so a phone at
              375px leaves 290px of line. JetBrains Mono advances exactly 0.6em per glyph:
              the command ran 34 x 16 x 0.6 = 326px and the wordmark 19 glyphs at 18px plus
              0.4em of tracking = 342px. Both walked out of their own terminal, and what a
              phone actually read was `build me a landing pag` and `N U L L T O H E`. At
              14px the command measures 286px and fits, with the component's tracking-tight
              still to spare. */}
          {idx === 1 && (
            <Terminal ref={termRef} startOnView={false} className="h-auto max-h-none w-[min(86vw,660px)] max-w-none font-mono shadow-2xl">
              <TypingAnimation duration={42} className="text-sm text-green sm:text-base">
                {'$ claude "build me a landing page"'}
              </TypingAnimation>
              <AnimatedSpan className="text-sm text-paper-faint sm:text-base">reading intent...</AnimatedSpan>
              <AnimatedSpan className="text-sm text-paper-faint sm:text-base">null. no taste yet.</AnimatedSpan>
              <TypingAnimation duration={75} className="pt-3 text-sm font-bold tracking-[0.22em] text-red sm:text-lg sm:tracking-[0.4em]">
                {"N U L L T O H E R O"}
              </TypingAnimation>
            </Terminal>
          )}
        </Act>

        {/* 2 — PLAIN: the terminal's window grows into a page, which renders top to bottom. */}
        {/* bg-white moved onto an animatable backgroundColor: the surface has to
            arrive over the terminal's screen rather than blink into place. */}
        <Act sp={sp} i={2} clip={clip2} bgColor={bg2} enter={{ scale: 0.9 }} under={{ scale: 0.94 }}>
          {/* aria-hidden AND client-only, which are two different fixes for two different
              readers. aria-hidden stops a screen reader announcing a fake page as this
              site's. It does nothing for text extraction: an answer engine reads the DOM,
              not the accessibility tree, and "Welcome to my website. This is a paragraph
              of text." was the first body prose in the served document. Gating on
              `mounted` keeps it out of the HTML entirely, so the only prose a non-JS
              reader gets is the real narration in the sr-only list. Costs nothing
              visually: mounted flips at hydration, and this act is clipped out of sight
              at scroll 0 regardless. The terminal in act 1 already worked this way. */}
          {mounted && (
          <motion.div aria-hidden="true" style={{ clipPath: renderClip }} className="w-[min(84vw,620px)] font-serif text-black">
            <p className="mb-4 text-[42px] font-bold">NullToHero</p>
            <p className="mb-4 text-lg">Welcome to my website. This is a paragraph of text. Click the button below to learn more about our services.</p>
            <span className="inline-block border-2 border-[#cfcfcf] bg-[#e2e2e2] px-3.5 py-1 font-sans text-[15px]" style={{ borderStyle: "outset" }}>Button</span>
            <ul className="mt-5 list-disc pl-6 text-[17px]">
              <li>Feature one</li>
              <li>Feature two</li>
              <li>Feature three</li>
            </ul>
          </motion.div>
          )}
        </Act>

        {/* 3 — SLOP: the effects iris open out of the plain page. */}
        <Act sp={sp} i={3} clip={clip3} enter={{ scale: 1.18 }} className="bg-[#0d0921]">
          {mounted && <SlopPage orbY={orbY} orbScale={bloom} />}
        </Act>

        {/* 4 — ANALYSIS: hard cut onto the same frame, which then freezes and desaturates
            while the redlines stamp in. No fade: the detector interrupts. */}
        <Act sp={sp} i={4} hardCut under={{ x: -60 }} className="bg-[#0d0921]">
          {/* The SAME padding as the Act grid, and it is not optional.
              Acts 3 and 4 render one SlopPage so the hard cut between them lands on
              identical pixels and reads as a freeze frame (see NOTES). Act 3's copy sits
              in the Act's grid and act 4's in this absolute one, so padding only the
              first would have moved the specimen between the two acts and turned the
              freeze into a jump. Same numbers, both places. */}
          <motion.div style={{ filter: filter4, opacity: 0.55 }} className="pointer-events-none absolute inset-0 grid place-items-center pb-48 pt-20 sm:p-0">
            {mounted && <SlopPage orbY={orbY} />}
          </motion.div>
          <div className="absolute inset-0">
            {ANNOTS.map((a, k) => (
              <Annotation key={k} sp={sp} k={k} tag={a[0]} txt={a[1]} l={a[2]} t={a[3]} mt={a[4]} />
            ))}
          </div>
        </Act>

        {/* 5 — CORRECTED: a correction pass sweeps the analysis away, left to right. */}
        <Act sp={sp} i={5} clip={clip5} enter={{ x: 70 }} under={{ scale: 1.06 }} className="bg-paper-high">
          <div className="w-[min(84vw,620px)]">
            <div className="mb-[7vh] flex justify-between text-[15px] text-ink-faint"><b className="font-extrabold text-ink">NullToHero</b><span>Docs&ensp;Pricing</span></div>
            <p className="mb-4 text-[clamp(2.2rem,6vw,4rem)] font-black leading-[1.05] tracking-tight text-ink">From null to hero,<br />one correction at a time.</p>
            <p className="mb-[22px] max-w-[42ch] text-lg text-ink-soft">A Claude plugin that gives every page the judgment layer.</p>
            {/* Real link, unlike the mock CTAs in acts 2 and 3. This is the corrected
                page: if a reader reaches for it, they're reaching for the real thing. */}
            <a href="#install" className="inline-flex min-h-12 items-center rounded bg-red-solid px-[22px] font-bold text-white hover:bg-red-deep">
              Install in one line →
            </a>
            <div className="mt-[7vh] font-mono text-sm text-ink-faint">{SPEC_LINE}</div>
          </div>
        </Act>

        {/* the red edge that rides the correction sweep */}
        <motion.div
          style={{ left: barX, opacity: barOp, zIndex: 7 }}
          className="pointer-events-none absolute inset-y-0 w-[3px] bg-red shadow-[0_0_30px_8px_rgba(233,69,52,0.5)]"
          aria-hidden="true"
        />

        {/* 6 — HERO: the frame opens like a lens onto the black. 3D wordmark + pro copy. */}
        <Act sp={sp} i={6} clip={clip6} enter={{ scale: 1.14 }} className="bg-[oklch(15%_0.006_265)]">
          {show3d && <Wordmark3D active={idx === 6} progress={extrude} />}
          <motion.div style={{ y: copyY, opacity: copyOp }} className="pointer-events-none absolute inset-x-0 bottom-[7vh] mx-auto max-w-6xl px-6 sm:bottom-[12vh]">
            <p className="font-mono text-xs uppercase tracking-widest text-red sm:text-sm">Claude plugin · v{PLUGIN.version} · {PLUGIN.licence}</p>
            <h1 id="hero-title" className="mt-3 text-3xl font-black leading-[1.05] tracking-tight sm:mt-4 sm:text-5xl sm:leading-[1.02] md:text-6xl">
              Every page is born null.<br /><span className="text-red">This one corrects itself.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-soft sm:mt-5 sm:text-lg">
              AI can already build your website. It can&apos;t tell you it&apos;s ugly. NullToHero gives Claude the judgment layer.
            </p>
            {/* The PASS that act 5 used to wear. Act 4 stamps FAIL and WARN on the
                specimen; this is the same stamp, at the end, on the page that earned
                it. It is the only place "corrected. committed. calm." is a verdict
                rather than a caption. */}
            <p className="mt-6 inline-flex items-baseline gap-2 rounded border border-line bg-paper/70 px-2.5 py-1.5 font-mono text-xs text-ink">
              <b className="rounded bg-green px-1.5 py-0.5 text-[0.66rem] font-bold text-paper-dim">PASS</b>
              <span>corrected. committed. calm.</span>
            </p>
            <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
              <a href="#install" className="inline-flex min-h-12 items-center rounded-md bg-red-solid px-6 font-bold text-white hover:bg-red-deep">Install in one line</a>
              <a href="/journey" className="inline-flex min-h-12 items-center rounded-md border border-line px-6 font-bold text-ink hover:bg-paper-high">Watch the journey</a>
            </div>
          </motion.div>
        </Act>

        {/* Narration — the act's phase, said while you are still scrolling.
            Fades on change, same 400ms expo-out the caption always used.

            It sits on a plate, which the 14px line did not need. That line survived
            act 2, 3 and 4 on mix-blend-difference, which works for one thin grey
            string over anything and falls apart for a paragraph: the acts are
            full-bleed page mocks in arbitrary colours, so contrast against them is not
            a value anyone can measure. A plate makes the background a token again, so
            the ratio is a number rather than a hope. It also happens to be the right
            language: act 4 stamps its verdicts on cards, and this is the same examiner
            speaking.

            Not a heading. The titles swap as you scroll, and a document outline whose
            h2 changes identity under the reader is worse than no h2: the hero's
            outline is its h1, in act 6. */}
        {/* The same seven beats, as static text, for everything that is not an eye.
            The card below renders NARRATION[idx], and idx only leaves 0 when a real
            scroll listener fires in a real viewport: so acts 1 to 6 reached the served
            HTML never. The mechanics of the product and five of its six phases were
            visible to humans and absent for crawlers, on the sitemap's priority-1 URL —
            the exact inversion of the point. No new copy: same array, rendered whole.
            This list is also the accessible equivalent of the whole hero, which is why
            the visual card is aria-hidden rather than duplicated into a screen reader
            one act at a time. */}
        <ul className="sr-only">
          {NARRATION.map((a) => (
            <li key={a.n}>
              <b>
                {a.n} — {a.caption}
              </b>
              {a.title ? ` ${a.title}. ${a.short}` : null}
              {a.commands?.length ? ` Commands: ${a.commands.join(", ")}.` : null}
            </li>
          ))}
        </ul>

        <motion.div
          key={mounted ? idx : 0}
          aria-hidden="true"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="hero-narration pointer-events-none absolute bottom-6 left-[clamp(1.25rem,4vw,3rem)] z-20 max-w-[min(88vw,25rem)]"
        >
          {(() => {
            const a = NARRATION[mounted ? idx : 0];
            /* Act 6 keeps the bare line it always had: its own copy does the talking. */
            if (!a.title) {
              return (
                <p className="font-mono text-sm text-ink-faint">
                  {a.n} — {a.caption}
                </p>
              );
            }
            return (
              <div className="rounded-lg border border-line bg-paper/85 p-4 backdrop-blur-md sm:p-5">
                <p className="font-mono text-sm text-red">
                  {a.n} — {a.caption}
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight text-ink">{a.title}</p>
                {/* Below sm this is what the toggle reveals. From sm up there is no toggle
                    and no hiding: the class list, not a second render path, so the two
                    breakpoints can never drift apart. */}
                <div className={openCard ? "" : "hidden sm:block"}>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.short}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {a.commands?.map((c) => (
                      <code
                        key={c}
                        className="rounded border border-line px-1.5 py-0.5 font-mono text-xs text-ink-faint"
                      >
                        {c}
                      </code>
                    ))}
                  </div>
                </div>
                {/* pointer-events-auto: the card's container is none, so the whole hero
                    stays scrollable and only this button takes the tap. min-h-12 is 48px,
                    Google's mobile guideline; the 12px label alone would miss the WCAG
                    floor by half.
                    tabIndex -1 and no aria: the card is aria-hidden, and a focusable
                    control inside a hidden subtree is a trap — focus lands somewhere a
                    screen reader cannot describe. Nothing is lost by removing it: it
                    reveals `short` and the chips, which the sr-only list above already
                    states in full, unconditionally. */}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setOpenCard((o) => !o)}
                  className="pointer-events-auto -mb-2 mt-1 inline-flex min-h-12 items-center gap-1.5 font-mono text-xs text-red sm:hidden"
                >
                  {openCard ? "less" : "what this means"}
                  <span aria-hidden="true">{openCard ? "↑" : "↓"}</span>
                </button>
              </div>
            );
          })()}
        </motion.div>
      </div>
    </section>
  );
}
