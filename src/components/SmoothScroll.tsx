"use client";

import { useEffect } from "react";

/**
 * Lenis smooth scroll. It eases the native scroll position, so every
 * scroll-scrubbed animation (the hero acts) inherits organic momentum for free.
 * Guardrails: disabled entirely under prefers-reduced-motion, and never on touch
 * (syncTouch stays off so mobile keeps its native scroll).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: { raf: (t: number) => void; destroy: () => void } | undefined;
    let raf = 0;
    let cancelled = false;

    (async () => {
      const Lenis = (await import("lenis")).default;
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.05,
        // expo-out: fast pickup, long organic settle
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.6,
      });
      // Exposed so anchors / tooling can drive the scroll through Lenis
      // (a raw window.scrollTo would fight Lenis's rAF loop).
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
      delete (window as unknown as { __lenis?: unknown }).__lenis;
    };
  }, []);

  return null;
}
