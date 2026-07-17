"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

/**
 * Act 6's extruded wordmark, and the only thing on this site that needs WebGL.
 *
 * It lives in its own module so three.js can live in its own chunk. It used to sit
 * inside HeroScrolly, which the home page imports statically, so the bundler put
 * three.js + @react-three/fiber in a chunk the page pulled with a plain <script>: 857 KB
 * raw on every single home page load. `show3d` already gated the canvas, but gating a
 * MOUNT does nothing about a DOWNLOAD — the import graph is decided at build time, not
 * by a useState. The 3D word is act 6 of a ~940vh track. Most visitors never reach it,
 * and all of them paid for it.
 *
 * Imported via next/dynamic({ ssr: false }) from HeroScrolly, so the chunk is fetched
 * when show3d flips, not before. ssr:false is not optional: it touches document and
 * WebGL, neither of which exists during a static export.
 */

/* The z-stack that reads as extrusion: 20 textured planes, the front one white, the
   next three the correction red, the rest fading back into the dark. */
function WordMesh({ active, progress }: { active: boolean; progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let alive = true;
    const make = () => {
      if (!alive) return;
      const w = 1024, h = 300;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.font = '900 150px Satoshi, system-ui, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("NullToHero", w / 2, h / 2 + 6);
      const t = new THREE.CanvasTexture(c);
      t.minFilter = THREE.LinearFilter;
      t.anisotropy = 4;
      setTexture(t);
    };
    // Wait for Satoshi or the texture bakes the fallback face into the 3D word.
    if (document.fonts?.load) document.fonts.load("900 150px Satoshi").then(make, make);
    else make();
    return () => { alive = false; };
  }, []);

  const layers = useMemo(() => {
    const light = new THREE.Color(0.98, 0.97, 0.95);
    const red = new THREE.Color(0.8, 0.22, 0.13);
    return Array.from({ length: 20 }, (_, i) => {
      const f = i / 19;
      let col: THREE.Color;
      if (i === 0) col = light;
      else if (i < 4) col = red;
      else col = red.clone().multiplyScalar(1 - f * 0.85);
      return { color: col, base: i === 0 ? 1 : 0.97 };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const ex = Math.min(1, Math.max(0, progress.get()));
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.4) * 0.26 * ex + (active ? 0 : -0.4);
      group.current.rotation.x = Math.cos(t * 0.33) * 0.05 * ex;
      group.current.position.y = 0.72 + Math.sin(t * 0.6) * 0.04 * ex;
    }
    for (let i = 0; i < meshes.current.length; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      m.position.z = -(i / 19) * 1.2 * ex;
      (m.material as THREE.MeshBasicMaterial).opacity = i === 0 ? 1 : 0.97 * (0.25 + 0.75 * ex);
    }
  });

  if (!texture) return null;
  return (
    <group ref={group}>
      {layers.map((l, i) => (
        <mesh key={i} ref={(el) => { meshes.current[i] = el; }} position={[0, 0, 0]}>
          <planeGeometry args={[4.6, 1.35]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={l.base} color={l.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export default function Wordmark3D({ active, progress }: { active: boolean; progress: MotionValue<number> }) {
  return (
    /* The word gets the top half of a phone, the copy gets the bottom. Full frame from
       sm up, unchanged. On a phone the h1 wraps and the word is centred, so they
       occupied the same pixels: white extruded type under white display type, and
       neither could be read. Boxing the canvas moves the word; the camera stays where
       it was measured. */
    <div className="absolute inset-x-0 top-0 h-[46%] sm:inset-0 sm:h-full" aria-hidden="true">
      <Canvas
        className="!absolute inset-0"
        camera={{ position: [0, 0, 7], fov: 28 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          // Dev HMR piles up contexts until the browser kills one. A lost context
          // should not take the act down with it.
          gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
        }}
      >
        <WordMesh active={active} progress={progress} />
      </Canvas>
    </div>
  );
}
