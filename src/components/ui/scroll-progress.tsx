"use client";

import { motion, useScroll, useSpring, type MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

interface ScrollProgressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * MagicUI ScrollProgress, rewired to our tokens.
 *
 * Two changes from the registry version. The pastel purple-pink-peach gradient is
 * gone: this site has one accent, and the correction red is the whole point.
 * And the raw scrollYProgress is run through a spring — this bar is NOT a scrubbed
 * animation the reader is piloting, it is a readout of where they are, so a little
 * lag reads as smooth rather than as lag. (A scrubbed tween would stay linear per
 * L-MOTION-3; the distinction is whether the motion IS the content.)
 *
 * Used on /journey only, where "how far along am I" is the page's actual subject.
 */
export function ScrollProgress({ className, ref, ...props }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={cn("fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-red", className)}
      style={{ scaleX }}
      {...props}
    />
  );
}
