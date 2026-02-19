"use client";

import React, { useEffect, useMemo, useRef } from "react";

type Vec2 = { x: number; y: number };

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rand(a = 0, b = 1) {
  return a + Math.random() * (b - a);
}

type Bubble = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  wob: number;
  alpha: number;
};

type Foam = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number; // 1..0
};

export default function DrinkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mouse position is tracked globally, but we smooth inside the animation loop.
  const mouseRef = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const clickedRef = useRef(false);
  const clickPosRef = useRef<Vec2 | null>(null);

  // Animation state refs (avoid rerenders)
  const tiltRef = useRef<Vec2>({ x: 0, y: 0 });
  const tiltVelRef = useRef<Vec2>({ x: 0, y: 0 });
  const foamEnergyRef = useRef(0);

  const bubblesRef = useRef<Bubble[]>([]);
  const foamPartsRef = useRef<Foam[]>([]);

  // Tuneables
  const settings = useMemo(
    () => ({
      // Motion feel
      springK: 14, // higher = snappier
      damping: 0.86, // 0..1 (lower = more damped)
      maxTilt: 0.85, // normalized max pseudo-tilt

      // Liquid
      baseFill: 0.72, // 0..1 (how "full" the scene is)
      surfaceWobble: 10, // px amplitude at max
      surfaceCurve: 0.8, // 0..1 curve strength

      // Bubbles
      bubbleCount: 180,
      bubbleMaxR: 7,
      bubbleMinR: 1.5,

      // Foam
      foamDecay: 0.92,
      foamBurst: 0.9,
      foamMaxParts: 140,
      foamBandMax: 26, // px
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const canvasEl: HTMLCanvasElement = canvas;
    const ctx2d: CanvasRenderingContext2D = ctx;

    let raf = 0;
    let lastT = performance.now();

    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvasEl.width = Math.floor(w * dpr);
      canvasEl.height = Math.floor(h * dpr);
      canvasEl.style.width = `${w}px`;
      canvasEl.style.height = `${h}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initBubbles() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const arr: Bubble[] = [];
      for (let i = 0; i < settings.bubbleCount; i++) {
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(settings.bubbleMinR, settings.bubbleMaxR),
          vy: rand(10, 45),
          vx: rand(-8, 8),
          wob: rand(0, Math.PI * 2),
          alpha: rand(0.08, 0.22),
        });
      }
      bubblesRef.current = arr;
    }

    function spawnFoamBurst(at: Vec2) {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Convert normalized click position (0..1) to pixels
      const px = at.x * w;
      const py = at.y * h;

      const parts = foamPartsRef.current;
      const toSpawn = 40 + Math.floor(rand(0, 25));

      for (let i = 0; i < toSpawn; i++) {
        if (parts.length >= settings.foamMaxParts) break;

        // Upward splash near surface
        const speed = rand(60, 220);
        const ang = rand(-Math.PI * 0.85, -Math.PI * 0.15); // mostly up
        parts.push({
          x: px + rand(-22, 22),
          y: py + rand(-12, 12),
          vx: Math.cos(ang) * speed + rand(-40, 40),
          vy: Math.sin(ang) * speed + rand(-20, 20),
          r: rand(1.5, 5.5),
          life: rand(0.75, 1.0),
        });
      }
    }

    function stepSpring(target: Vec2, dt: number) {
      // Simple spring dynamics: v = (v + (target - x)*k*dt) * damping; x += v*dt
      const k = settings.springK;
      const d = Math.pow(settings.damping, dt * 60);

      const x = tiltRef.current;
      const v = tiltVelRef.current;

      v.x = (v.x + (target.x - x.x) * k * dt) * d;
      v.y = (v.y + (target.y - x.y) * k * dt) * d;

      x.x += v.x * dt;
      x.y += v.y * dt;
    }

    function draw(t: number) {
      const now = t;
      const dt = clamp((now - lastT) / 1000, 0.001, 0.033);
      lastT = now;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // --- target tilt from mouse ---
      const m = mouseRef.current;
      const tx = clamp(
        (m.x * 2 - 1) * settings.maxTilt,
        -settings.maxTilt,
        settings.maxTilt,
      );
      const ty = clamp(
        (m.y * 2 - 1) * settings.maxTilt,
        -settings.maxTilt,
        settings.maxTilt,
      );

      // Invert Y a bit so moving mouse up makes liquid "rise" slightly
      const target: Vec2 = { x: tx, y: -ty };

      stepSpring(target, dt);

      const tilt = tiltRef.current;
      const tiltMag = Math.hypot(tilt.x, tilt.y);

      // Foam decay
      foamEnergyRef.current *= Math.pow(settings.foamDecay, dt * 60);
      const foamEnergy = clamp(foamEnergyRef.current, 0, 1);

      // Clear
      ctx2d.clearRect(0, 0, w, h);

      // Subtle background tint (helps it feel like a background layer)
      // No fixed style/colors requested, but we need some. Keep it neutral & soft.
      ctx2d.fillStyle = "rgba(10, 12, 16, 0.55)";
      ctx2d.fillRect(0, 0, w, h);

      // --- liquid geometry ---
      // Fill line is height from bottom.
      const fill = clamp(settings.baseFill + tilt.y * 0.05, 0.45, 0.9);
      const liquidTopY = h * (1 - fill);

      // Surface line endpoints (tilt.x controls slope)
      const slope = tilt.x * 0.18; // radians-ish scale
      const halfW = w * 0.55;

      const yLeft = liquidTopY + slope * halfW;
      const yRight = liquidTopY - slope * halfW;

      // Wobble depends on velocity and tilt magnitude
      const v = tiltVelRef.current;
      const velMag = Math.hypot(v.x, v.y);
      const wobble =
        settings.surfaceWobble * clamp(tiltMag * 0.9 + velMag * 0.015, 0, 1);

      const wobPhase = now * 0.0022 + tilt.x * 0.6;
      const midY =
        (yLeft + yRight) / 2 +
        Math.sin(wobPhase) * wobble +
        Math.sin(wobPhase * 1.7 + 1.2) * (wobble * 0.35);

      // Draw liquid (abstract gradient look)
      const grad = ctx2d.createLinearGradient(0, liquidTopY, 0, h);
      grad.addColorStop(0, "rgba(255, 198, 92, 0.55)");
      grad.addColorStop(0.55, "rgba(255, 170, 56, 0.42)");
      grad.addColorStop(1, "rgba(255, 125, 30, 0.28)");

      ctx2d.beginPath();
      // Surface curve
      ctx2d.moveTo(-50, yLeft);
      const curveStrength = settings.surfaceCurve;
      ctx2d.quadraticCurveTo(
        w * 0.5,
        lerp(liquidTopY, midY, curveStrength),
        w + 50,
        yRight,
      );
      // Down to bottom
      ctx2d.lineTo(w + 50, h + 60);
      ctx2d.lineTo(-50, h + 60);
      ctx2d.closePath();
      ctx2d.fillStyle = grad;
      ctx2d.fill();

      // Soft highlight near surface (adds depth)
      ctx2d.save();
      ctx2d.globalCompositeOperation = "screen";
      ctx2d.beginPath();
      ctx2d.moveTo(-50, yLeft);
      ctx2d.quadraticCurveTo(
        w * 0.5,
        lerp(liquidTopY, midY, curveStrength),
        w + 50,
        yRight,
      );
      ctx2d.lineTo(w + 50, yRight + 55);
      ctx2d.quadraticCurveTo(
        w * 0.5,
        lerp(liquidTopY, midY, curveStrength) + 48,
        -50,
        yLeft + 55,
      );
      ctx2d.closePath();
      ctx2d.fillStyle = "rgba(255,255,255,0.06)";
      ctx2d.fill();
      ctx2d.restore();

      // --- foam band (thickness driven by foamEnergy + a bit of tilt) ---
      const foamBand = clamp(
        8 + foamEnergy * settings.foamBandMax + tiltMag * 6,
        8,
        44,
      );

      // foam surface path (same as liquid surface, but a band above it)
      ctx2d.beginPath();
      ctx2d.moveTo(-50, yLeft - foamBand);
      ctx2d.quadraticCurveTo(
        w * 0.5,
        lerp(liquidTopY, midY, curveStrength) -
          foamBand +
          Math.sin(wobPhase * 2.4) * 2,
        w + 50,
        yRight - foamBand,
      );
      ctx2d.lineTo(w + 50, yRight + foamBand * 0.15);
      ctx2d.quadraticCurveTo(
        w * 0.5,
        lerp(liquidTopY, midY, curveStrength) +
          foamBand * 0.15 +
          Math.sin(wobPhase * 1.9 + 2) * 2,
        -50,
        yLeft + foamBand * 0.15,
      );
      ctx2d.closePath();

      const foamGrad = ctx2d.createLinearGradient(
        0,
        liquidTopY - foamBand,
        0,
        liquidTopY + foamBand,
      );
      foamGrad.addColorStop(0, "rgba(255,255,255,0.26)");
      foamGrad.addColorStop(1, "rgba(255,255,255,0.10)");
      ctx2d.fillStyle = foamGrad;
      ctx2d.fill();

      // --- bubbles ---
      const bubbles = bubblesRef.current;
      ctx2d.save();
      ctx2d.globalCompositeOperation = "screen";
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        // Update
        // Increase rise speed slightly with tilt
        const rise = b.vy * (1 + tiltMag * 0.35);
        b.y -= rise * dt;
        b.x += (b.vx + Math.sin(now * 0.0015 + b.wob) * 9) * dt;

        // Wrap
        if (b.y < -30) {
          b.y = h + rand(10, 120);
          b.x = rand(0, w);
          b.r = rand(settings.bubbleMinR, settings.bubbleMaxR);
          b.alpha = rand(0.07, 0.2);
          b.vy = rand(10, 45);
          b.vx = rand(-10, 10);
        }
        if (b.x < -40) b.x = w + 40;
        if (b.x > w + 40) b.x = -40;

        // Only draw bubbles that are inside liquid (below surface)
        // Approx surface y at x using linear interp between endpoints
        const fx = clamp(b.x / w, 0, 1);
        const surfY = lerp(yLeft, yRight, fx);
        if (b.y < surfY + 8) continue; // above surface

        ctx2d.beginPath();
        ctx2d.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(255,255,255,${b.alpha})`;
        ctx2d.fill();

        // Small specular
        ctx2d.beginPath();
        ctx2d.arc(
          b.x - b.r * 0.3,
          b.y - b.r * 0.3,
          Math.max(1, b.r * 0.28),
          0,
          Math.PI * 2,
        );
        ctx2d.fillStyle = `rgba(255,255,255,${b.alpha * 0.9})`;
        ctx2d.fill();
      }
      ctx2d.restore();

      // --- foam particles (click burst) ---
      const foamParts = foamPartsRef.current;
      if (foamParts.length) {
        ctx2d.save();
        ctx2d.globalCompositeOperation = "screen";
        for (let i = foamParts.length - 1; i >= 0; i--) {
          const p = foamParts[i];

          // Physics
          p.vy += 520 * dt; // gravity down
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Fade
          p.life -= dt * 0.9;
          const a = clamp(p.life, 0, 1);

          // Draw
          ctx2d.beginPath();
          ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx2d.fillStyle = `rgba(255,255,255,${0.28 * a})`;
          ctx2d.fill();

          // Remove when dead or offscreen
          if (p.life <= 0 || p.y > h + 80 || p.x < -80 || p.x > w + 80) {
            foamParts.splice(i, 1);
          }
        }
        ctx2d.restore();
      }

      // Handle click (one-shot) -> burst at the clicked screen position
      if (clickedRef.current) {
        clickedRef.current = false;
        const clickPos = clickPosRef.current ?? { x: 0.5, y: 0.5 };
        clickPosRef.current = null;
        spawnFoamBurst(clickPos);
      }

      raf = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseRef.current = { x: e.clientX / w, y: e.clientY / h };
    };

    const onClick = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const clickPos = {
        x: clamp(e.clientX / w, 0, 1),
        y: clamp(e.clientY / h, 0, 1),
      };

      clickedRef.current = true;
      clickPosRef.current = clickPos;
      mouseRef.current = clickPos;

      // Add a little “kick” so the surface responds immediately
      tiltVelRef.current.x += rand(-0.9, 0.9);
      tiltVelRef.current.y += rand(-0.6, 0.6);
    };

    resize();
    initBubbles();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click", onClick);

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
    };
  }, [settings]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
