import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

type ColorKey =
  | "pink" | "blue" | "yellow" | "purple" | "orange"
  | "red"  | "cyan" | "green" | "magenta" | "gold";

const COLORS: { key: ColorKey; label: string; hex: string; wing: string }[] = [
  { key: "pink",    label: "Pink",    hex: "#ec4899", wing: "#f9a8d4" },
  { key: "blue",    label: "Blue",    hex: "#3b82f6", wing: "#93c5fd" },
  { key: "yellow",  label: "Yellow",  hex: "#eab308", wing: "#fde68a" },
  { key: "purple",  label: "Purple",  hex: "#8b5cf6", wing: "#c4b5fd" },
  { key: "orange",  label: "Orange",  hex: "#f97316", wing: "#fdba74" },
  { key: "red",     label: "Red",     hex: "#ef4444", wing: "#fca5a5" },
  { key: "cyan",    label: "Cyan",    hex: "#06b6d4", wing: "#a5f3fc" },
  { key: "green",   label: "Green",   hex: "#22c55e", wing: "#86efac" },
  { key: "magenta", label: "Magenta", hex: "#d946ef", wing: "#f0abfc" },
  { key: "gold",    label: "Gold",    hex: "#d4a017", wing: "#fcd34d" },
];

const HINTS_HI: Record<ColorKey, string> = {
  pink:    "Pyaari pink titli pakdo 💕",
  blue:    "Aasmani blue titli pakdo 💙",
  yellow:  "Dhoop jaisi yellow titli pakdo 💛",
  purple:  "Purple wali titli pakdo 💜",
  orange:  "Orange titli ko pakdo 🧡",
  red:     "Laal red titli pakdo ❤️",
  cyan:    "Thandi cyan titli pakdo 🩵",
  green:   "Hari green titli pakdo 💚",
  magenta: "Magenta titli pakdo 🩷",
  gold:    "Sunehri gold titli pakdo 💛✨",
};

interface Butterfly {
  id: number;
  color: typeof COLORS[number];
  x: number; y: number;
  vx: number; vy: number;
  heading: number;
  wingPhase: number;
  wingSpeed: number;
  scale: number;
  caught: boolean;
  caughtAt?: number;
  escapeUntil?: number;
  restUntil?: number;
  waypoint?: { x: number; y: number };
  waypointAt: number;
}

const TOTAL = 10;
const BUTTERFLY_COUNT = 7;

let _id = 1;
const nextId = () => _id++;

function rand(min: number, max: number) { return min + Math.random() * (max - min); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function chime(freq: number, type: OscillatorType = "sine", duration = 0.18, gain = 0.12) {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ac.currentTime);
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + duration + 0.02);
  } catch {}
}

const ButterflyCatchGame = ({ onComplete }: { onComplete?: () => void }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const butterfliesRef = useRef<Butterfly[]>([]);
  const [, force] = useState(0);
  const [targetIdx, setTargetIdx] = useState(0); // 0..9
  const [caught, setCaught] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [done, setDone] = useState(false);

  const target = COLORS[targetIdx];

  // Spawn / respawn butterflies
  const spawnButterfly = useCallback((targetColor?: typeof COLORS[number]): Butterfly => {
    const { w, h } = sizeRef.current;
    // 40% chance to spawn a target-color butterfly so the right one always exists
    const color = targetColor && Math.random() < 0.4 ? targetColor : pick(COLORS);
    const fromSide = Math.floor(Math.random() * 4);
    let x = rand(80, Math.max(80, w - 80));
    let y = rand(80, Math.max(80, h - 120));
    if (fromSide === 0) x = -40;
    if (fromSide === 1) x = w + 40;
    if (fromSide === 2) y = -40;
    if (fromSide === 3) y = h + 40;
    const heading = rand(0, Math.PI * 2);
    return {
      id: nextId(),
      color,
      x, y,
      vx: Math.cos(heading) * rand(40, 90),
      vy: Math.sin(heading) * rand(40, 90),
      heading,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: rand(22, 32),
      scale: rand(0.85, 1.15),
      caught: false,
      waypoint: { x: rand(60, Math.max(60, w - 60)), y: rand(60, Math.max(60, h - 100)) },
      waypointAt: performance.now(),
    };
  }, []);

  // Init size + butterflies
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const r = wrap.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
    };
    measure();
    window.addEventListener("resize", measure);

    butterfliesRef.current = [];
    for (let i = 0; i < BUTTERFLY_COUNT; i++) {
      butterfliesRef.current.push(spawnButterfly(COLORS[0]));
    }
    force((n) => n + 1);

    return () => window.removeEventListener("resize", measure);
  }, [spawnButterfly]);

  // Make sure at least one butterfly matches current target
  useEffect(() => {
    if (done) return;
    const has = butterfliesRef.current.some(
      (b) => !b.caught && b.color.key === target.key
    );
    if (!has) {
      // Replace a random non-target one
      const list = butterfliesRef.current.filter((b) => !b.caught);
      if (list.length > 0) {
        const victim = pick(list);
        const idx = butterfliesRef.current.indexOf(victim);
        butterfliesRef.current[idx] = spawnButterfly(target);
      }
    }
  }, [target, done, spawnButterfly]);

  // Animation loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const { w, h } = sizeRef.current;
      const list = butterfliesRef.current;
      for (const b of list) {
        if (b.caught) continue;
        // Wing flap
        const flapSpeed = b.restUntil && t < b.restUntil ? 6 : b.wingSpeed;
        b.wingPhase += dt * flapSpeed;

        // Resting on a flower
        if (b.restUntil && t < b.restUntil) {
          b.vx *= 0.9; b.vy *= 0.9;
        } else {
          b.restUntil = undefined;

          // Pick new waypoint occasionally
          if (!b.waypoint || t - b.waypointAt > 1800 + Math.random() * 1500 ||
              Math.hypot(b.x - b.waypoint.x, b.y - b.waypoint.y) < 30) {
            b.waypoint = {
              x: rand(60, Math.max(60, w - 60)),
              y: rand(60, Math.max(60, h - 100)),
            };
            b.waypointAt = t;
          }

          // Steer toward waypoint
          const dx = b.waypoint.x - b.x;
          const dy = b.waypoint.y - b.y;
          const desiredHeading = Math.atan2(dy, dx);
          // Smooth heading + jitter for zigzag
          let dh = desiredHeading - b.heading;
          while (dh > Math.PI) dh -= Math.PI * 2;
          while (dh < -Math.PI) dh += Math.PI * 2;
          b.heading += dh * dt * 1.6 + (Math.random() - 0.5) * dt * 4;

          const speed = b.escapeUntil && t < b.escapeUntil ? 280 : 90;
          const tvx = Math.cos(b.heading) * speed;
          const tvy = Math.sin(b.heading) * speed;
          b.vx += (tvx - b.vx) * Math.min(1, dt * 3);
          b.vy += (tvy - b.vy) * Math.min(1, dt * 3);

          if (b.escapeUntil && t >= b.escapeUntil) b.escapeUntil = undefined;

          // Occasional rest
          if (!b.escapeUntil && Math.random() < dt * 0.15) {
            b.restUntil = t + 700 + Math.random() * 900;
          }
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Soft wrap at edges (turn around)
        if (b.x < 20) { b.x = 20; b.vx = Math.abs(b.vx); b.heading = Math.atan2(b.vy, b.vx); }
        if (b.x > w - 20) { b.x = w - 20; b.vx = -Math.abs(b.vx); b.heading = Math.atan2(b.vy, b.vx); }
        if (b.y < 20) { b.y = 20; b.vy = Math.abs(b.vy); b.heading = Math.atan2(b.vy, b.vx); }
        if (b.y > h - 20) { b.y = h - 20; b.vy = -Math.abs(b.vy); b.heading = Math.atan2(b.vy, b.vx); }
      }
      force((n) => (n + 1) % 1000000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleTap = (b: Butterfly, e: React.PointerEvent) => {
    if (done || b.caught) return;
    if (b.color.key === target.key) {
      b.caught = true;
      b.caughtAt = performance.now();
      chime(880, "sine", 0.22, 0.16);
      setTimeout(() => chime(1320, "sine", 0.18, 0.12), 70);
      setFlash("good");
      setTimeout(() => setFlash(null), 220);
      const newCount = caught + 1;
      setCaught(newCount);
      if (newCount >= TOTAL) {
        setDone(true);
        confetti({
          particleCount: 200, spread: 100, origin: { y: 0.5 },
          colors: COLORS.map((c) => c.hex),
        });
        chime(660, "triangle", 0.25, 0.15);
        setTimeout(() => chime(990, "triangle", 0.3, 0.13), 120);
        setTimeout(() => chime(1320, "triangle", 0.35, 0.13), 260);
      } else {
        setTargetIdx((i) => i + 1);
        // Replace caught butterfly with fresh one after a delay
        setTimeout(() => {
          const idx = butterfliesRef.current.indexOf(b);
          if (idx >= 0) butterfliesRef.current[idx] = spawnButterfly();
        }, 700);
      }
      if (navigator.vibrate) navigator.vibrate(25);
    } else {
      // Wrong: escape dodge
      const rect = wrapRef.current!.getBoundingClientRect();
      const tx = e.clientX - rect.left;
      const ty = e.clientY - rect.top;
      const ang = Math.atan2(b.y - ty, b.x - tx);
      b.vx = Math.cos(ang) * 320;
      b.vy = Math.sin(ang) * 320;
      b.heading = ang;
      b.escapeUntil = performance.now() + 700;
      chime(220, "sawtooth", 0.12, 0.07);
      setFlash("bad");
      setTimeout(() => setFlash(null), 220);
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-accent/20 via-background to-primary/10">
      {/* Drifting flower silhouettes (parallax) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-20 select-none"
            style={{ left: `${(i * 83) % 100}%`, top: `${(i * 47) % 100}%` }}
            animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: "easeInOut" }}
          >
            {i % 3 === 0 ? "🌸" : i % 3 === 1 ? "🌼" : "🌷"}
          </motion.div>
        ))}
      </div>

      {/* HUD */}
      <div className="relative z-20 pt-4 px-4 flex flex-col items-center gap-2 pointer-events-none">
        <div className="bg-card/90 backdrop-blur border border-border rounded-2xl shadow-lg px-4 py-2 flex items-center gap-3">
          <span
            className="w-5 h-5 rounded-full shadow-inner"
            style={{ background: target.hex, boxShadow: `0 0 14px ${target.hex}` }}
          />
          <span className="font-display font-semibold text-foreground text-sm sm:text-base">
            {done ? "10 / 10 titliyan pakdi! 🦋✨" : HINTS_HI[target.key]}
          </span>
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {caught}/{TOTAL}
          </span>
        </div>
        <div className="w-56 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${(caught / TOTAL) * 100}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      {/* Edge flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash}
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              boxShadow: `inset 0 0 80px 20px ${flash === "good" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Play field */}
      <div ref={wrapRef} className="absolute inset-0 z-[5] touch-none select-none">
        {butterfliesRef.current.map((b) => (
          <ButterflySprite key={b.id} b={b} onTap={handleTap} />
        ))}
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {done && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-background/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm text-center"
            >
              <div className="text-5xl mb-3">🦋✨</div>
              <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                Saari titliyan pakdi!
              </h2>
              <p className="text-muted-foreground text-sm mb-5">
                10 / 10 rangin titliyan — wah Khushi, tu toh expert nikli! 💖
              </p>
              <button
                onClick={() => onComplete?.()}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:scale-105 transition-transform"
              >
                Continue →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ButterflySprite = ({
  b, onTap,
}: { b: Butterfly; onTap: (b: Butterfly, e: React.PointerEvent) => void }) => {
  const wingOpen = (Math.sin(b.wingPhase) + 1) / 2; // 0..1
  const wingScaleX = 0.25 + wingOpen * 0.85;
  const tilt = (b.heading * 180) / Math.PI + 90;

  if (b.caught) {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: b.x, top: b.y, translateX: "-50%", translateY: "-50%" }}
        initial={{ scale: b.scale, opacity: 1 }}
        animate={{ scale: b.scale * 1.6, opacity: 0, y: b.y - 60 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div
          className="w-10 h-10 rounded-full"
          style={{
            background: `radial-gradient(circle, ${b.color.wing} 0%, ${b.color.hex} 60%, transparent 80%)`,
            filter: "blur(2px)",
          }}
        />
      </motion.div>
    );
  }

  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: b.x,
        top: b.y,
        transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${b.scale})`,
        touchAction: "none",
        willChange: "transform, left, top",
      }}
      onPointerDown={(e) => onTap(b, e)}
    >
      {/* Tap hit area */}
      <div className="absolute -inset-3 rounded-full" />
      <svg width="56" height="44" viewBox="-28 -22 56 44" style={{ overflow: "visible" }}>
        {/* Left wing */}
        <g style={{ transform: `scaleX(${wingScaleX})`, transformOrigin: "center" }}>
          <path
            d="M 0 -2 C -22 -22 -28 -10 -22 4 C -16 16 -6 14 0 6 Z"
            fill={b.color.wing}
            stroke={b.color.hex}
            strokeWidth="1.2"
          />
          <circle cx="-14" cy="-6" r="2.6" fill={b.color.hex} opacity="0.7" />
          <circle cx="-10" cy="6" r="1.8" fill={b.color.hex} opacity="0.5" />
        </g>
        {/* Right wing (mirror) */}
        <g style={{ transform: `scaleX(${-wingScaleX})`, transformOrigin: "center" }}>
          <path
            d="M 0 -2 C -22 -22 -28 -10 -22 4 C -16 16 -6 14 0 6 Z"
            fill={b.color.wing}
            stroke={b.color.hex}
            strokeWidth="1.2"
          />
          <circle cx="-14" cy="-6" r="2.6" fill={b.color.hex} opacity="0.7" />
          <circle cx="-10" cy="6" r="1.8" fill={b.color.hex} opacity="0.5" />
        </g>
        {/* Body */}
        <ellipse cx="0" cy="0" rx="1.6" ry="9" fill="#3b2f2f" />
        <circle cx="0" cy="-9" r="2.2" fill="#3b2f2f" />
        {/* Antennae */}
        <path d="M -0.6 -10 C -3 -14 -5 -16 -6 -18" stroke="#3b2f2f" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M 0.6 -10 C 3 -14 5 -16 6 -18" stroke="#3b2f2f" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default ButterflyCatchGame;