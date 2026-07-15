"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";

/**
 * Act 0 is a blank sheet with one word on it. Nothing on that page says "scroll",
 * and everything past it depends on scrolling: without an affordance the hero is a
 * dead end that looks intentional. This is the affordance.
 *
 * Drawn rather than iconified. A stock mouse-wheel or hand pictogram would be the
 * only thing on that sheet not made with a marker, and it would read as chrome
 * borrowed from another site. The same hand that wrote the wordmark draws the arrow:
 * same red, same round cap, same weight as the underline.
 *
 * It is a hint, so it leaves the moment it is obeyed: opacity is driven by scroll
 * progress and it is gone within the first few percent, never to return. A hint
 * that stays after you have understood it is decoration.
 *
 * Motion budget: this is the only infinite loop on act 0 (L-MOTION-2 allows two per
 * view). Under reduced motion the arrow holds still and the label stays — the
 * information survives, only the movement goes.
 */
export function ScrollHint({ sp }: { sp: MotionValue<number> }) {
  const reduce = useReducedMotion();

  // Gone almost immediately: the first flick of the wheel is the acknowledgement.
  const opacity = useTransform(sp, [0, 0.012], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-[6vh] z-10 flex justify-center"
      aria-hidden="true"
    >
      {/* Waits for the hand to finish. The wordmark writes itself over ~2.4s (see
          PEN in HeroScrolly); prompting someone to leave while the page is still
          being written in front of them is rushing them out of the one moment the
          hero was built for. The arrow arrives as the same hand's next stroke. */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#8a8780]">
          scroll
        </span>
        <motion.svg
          width="18"
          height="30"
          viewBox="0 0 18 30"
          fill="none"
          animate={reduce ? undefined : { y: [0, 5, 0] }}
          transition={
            reduce ? undefined : { duration: 1.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1], delay: 3.2 }
          }
        >
          {/* one marker stroke down, then the two of the head — the order a hand
              draws it, at the same 3.2 weight as the wordmark's underline */}
          <path d="M9 3 L9 22" stroke="#dd3f2a" strokeWidth="3.2" strokeLinecap="round" />
          <path
            d="M3.5 16.5 L9 23.5 L14.5 16.5"
            stroke="#dd3f2a"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
