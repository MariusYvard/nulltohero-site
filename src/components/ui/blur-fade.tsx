"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type MotionProps,
  type UseInViewOptions,
  type Variants,
} from "motion/react";

type MarginType = UseInViewOptions["margin"];

interface BlurFadeProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inViewMargin?: MarginType;
  blur?: string;
}

/**
 * MagicUI BlurFade, with the two things the registry version leaves to you.
 *
 * 1. Reduced motion: renders the final state immediately. MagicUI ships no guard,
 *    and an entrance animation is exactly the kind of motion that has to have an
 *    off switch (L-MOTION-2's guard, and the vestibular rule in parallax.md).
 * 2. AnimatePresence removed. The registry wraps every instance in its own
 *    AnimatePresence with no exit ever firing: it costs a provider per element and
 *    buys nothing here, since these never unmount.
 *
 * This is an ENTRANCE, on a clock, and it is not the hero's act model: acts are
 * covered, never crossfaded. Content arriving on a page is a different act.
 */
export function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  inViewMargin = "-50px",
  blur = "6px",
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: inViewMargin });

  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const from = direction === "right" || direction === "down" ? -offset : offset;

  const variants: Variants = {
    hidden: { [axis]: from, opacity: 0, filter: `blur(${blur})` },
    visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" },
  };

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ delay: 0.04 + delay, duration, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
