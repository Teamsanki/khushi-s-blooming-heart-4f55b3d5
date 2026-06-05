import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface CakeBanaoGameProps {
  onComplete: () => void;
}

type StageKey = "base" | "cream" | "cherry" | "candle";

interface StageDef {
  key: StageKey;
  emoji: string;
  label: string;
  count: number;
  hint: string;
}

const STAGES: StageDef[] = [
  { key: "base", emoji: "🟫", label: "Sponge", count: 1, hint: "Step 1: Plate pe chocolate sponge base drag karo 🍫" },
  { key: "cream", emoji: "🍦", label: "Cream", count: 1, hint: "Step 2: Sponge ke upar soft pink cream layer 🍦" },
  { key: "cherry", emoji: "🍒", label: "Cherries", count: 3, hint: "Step 3: 3 cherries cake ke top pe sajao 🍒🍒🍒" },
  { key: "candle", emoji: "🕯️", label: "Candle", count: 1, hint: "Step 4: Birthday candle laga do — almost done! 🕯️" },
];

const STORAGE_KEY = "cakeBanaoProgress_v1";

interface SavedProgress {
  stageIdx: number;
  stageProgress: number;
  placed: { stage: StageKey; x?: number }[];
}

const CakeBanaoGame = ({ onComplete }: CakeBanaoGameProps) => {
  // Load saved progress synchronously on first render
  const initial: SavedProgress = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedProgress;
        if (
          typeof parsed.stageIdx === "number" &&
          parsed.stageIdx >= 0 &&
          parsed.stageIdx < STAGES.length &&
          Array.isArray(parsed.placed)
        ) {
          return parsed;
        }
      }
    } catch {}
    return { stageIdx: 0, stageProgress: 0, placed: [] };
  })();

  const [stageIdx, setStageIdx] = useState(initial.stageIdx);
  const [stageProgress, setStageProgress] = useState(initial.stageProgress);
  const [placed, setPlaced] = useState<{ stage: StageKey; x?: number }[]>(initial.placed);
  const [hoverDrop, setHoverDrop] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [stageBurst, setStageBurst] = useState(0);
  const [bakePhase, setBakePhase] = useState<"idle" | "rotate" | "oven" | "finale">("idle");
  const dropRef = useRef<HTMLDivElement>(null);

  // Persist progress after every change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stageIdx, stageProgress, placed })
      );
    } catch {}
  }, [stageIdx, stageProgress, placed]);

  const stage = STAGES[stageIdx];
  const totalSteps = STAGES.reduce((a, s) => a + s.count, 0);
  const doneSteps = placed.length;

  const handleDragEnd = (_e: any, info: PanInfo) => {
    setHoverDrop(false);
    if (!dropRef.current) return;
    const rect = dropRef.current.getBoundingClientRect();
    const { x, y } = info.point;
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (!inside) {
      setWrong(true);
      setTimeout(() => setWrong(false), 500);
      return;
    }
    // For cherries, record relative x to scatter them
    const relX = stage.key === "cherry" ? ((x - rect.left) / rect.width) * 100 : undefined;
    const next = [...placed, { stage: stage.key, x: relX }];
    setPlaced(next);
    const newProg = stageProgress + 1;
    setStageBurst((b) => b + 1);
    setTimeout(() => setStageBurst((b) => Math.max(0, b - 1)), 800);
    if (newProg >= stage.count) {
      if (stageIdx + 1 >= STAGES.length) {
        // Cake fully built — clear saved progress so next visit starts fresh
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        // Start cinematic bake sequence: rotate → oven → finale
        setTimeout(() => setBakePhase("rotate"), 500);
        setTimeout(() => setBakePhase("oven"), 3000);
        setTimeout(() => {
          setBakePhase("finale");
          setShowComplete(true);
        }, 6500);
        setTimeout(onComplete, 12000);
      } else {
        setTimeout(() => {
          setStageIdx(stageIdx + 1);
          setStageProgress(0);
        }, 400);
      }
    } else {
      setStageProgress(newProg);
    }
  };

  const hasBase = placed.some((p) => p.stage === "base");
  const hasCream = placed.some((p) => p.stage === "cream");
  const cherries = placed.filter((p) => p.stage === "cherry");
  const hasCandle = placed.some((p) => p.stage === "candle");

  if (showComplete) {
    return (
      <FinaleScreen />
    );
  }

  // Cinematic bake overlay (rotate + oven)
  if (bakePhase === "rotate" || bakePhase === "oven") {
    return <BakeScene phase={bakePhase} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, hsl(var(--primary)/0.15), transparent 55%), radial-gradient(ellipse at 70% 80%, hsl(var(--accent)/0.12), transparent 55%)",
        }}
      />
      <motion.div
        animate={wrong ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
      >
        <div className="bg-primary p-5 text-center">
          <h2 className="text-lg font-display font-bold text-primary-foreground">
            🎂 Cake Banao Khushi Ke Liye
          </h2>
          <p className="text-primary-foreground/70 text-xs mt-2">{stage.hint}</p>
          <div className="flex gap-1.5 justify-center mt-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 max-w-8 rounded-full transition-all duration-300 ${
                  i < doneSteps ? "bg-accent" : "bg-primary-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Drop area */}
        <div
          ref={dropRef}
          className={`relative h-80 mx-4 mt-4 rounded-xl border-2 border-dashed transition-colors flex items-end justify-center pb-6 overflow-hidden ${
            hoverDrop ? "border-primary bg-primary/5" : "border-border bg-muted/30"
          }`}
        >
          {/* Soft table backdrop */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--muted)/0.2) 0%, hsl(var(--muted)/0.5) 100%)",
            }}
          />
          {!hasBase && (
            <p className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-sm">
              ⬇️ Tray se ingredient yahan drop karo
            </p>
          )}

          {/* Per-step sparkle burst */}
          <AnimatePresence>
            {stageBurst > 0 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  return (
                    <motion.span
                      key={`${stageIdx}-${stageProgress}-${i}`}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                      animate={{
                        x: Math.cos(angle) * 80,
                        y: Math.sin(angle) * 80 - 30,
                        opacity: 0,
                        scale: 1.2,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute text-lg"
                    >
                      {["✨", "💖", "⭐", "🌸"][i % 4]}
                    </motion.span>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Realistic cake */}
          {hasBase && (
            <motion.svg
              viewBox="0 0 300 260"
              className="w-72 h-72 drop-shadow-xl"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <defs>
                <linearGradient id="sponge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b3a1f" />
                  <stop offset="50%" stopColor="#5a2e18" />
                  <stop offset="100%" stopColor="#3d1d10" />
                </linearGradient>
                <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff5f8" />
                  <stop offset="50%" stopColor="#ffd1dc" />
                  <stop offset="100%" stopColor="#ff9fb8" />
                </linearGradient>
                <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5f5f5" />
                  <stop offset="100%" stopColor="#c8c8c8" />
                </linearGradient>
                <radialGradient id="flame" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#fff7c2" />
                  <stop offset="50%" stopColor="#ffb347" />
                  <stop offset="100%" stopColor="#ff5722" />
                </radialGradient>
              </defs>

              {/* Plate */}
              <ellipse cx="150" cy="240" rx="120" ry="14" fill="url(#plate)" />
              <ellipse cx="150" cy="236" rx="105" ry="9" fill="#ffffff" opacity="0.4" />

              {/* Sponge — 2 tiers for realism */}
              <g>
                {/* Bottom tier */}
                <rect x="40" y="170" width="220" height="65" rx="6" fill="url(#sponge)" />
                {/* Crumb dots */}
                {[55, 95, 135, 175, 215, 245].map((cx, i) => (
                  <circle key={i} cx={cx} cy={195 + (i % 2) * 18} r="2" fill="#fff" opacity="0.15" />
                ))}
                {/* Top tier */}
                <rect x="70" y="118" width="160" height="58" rx="6" fill="url(#sponge)" />
                {[85, 120, 155, 190, 220].map((cx, i) => (
                  <circle key={i} cx={cx} cy={138 + (i % 2) * 16} r="2" fill="#fff" opacity="0.15" />
                ))}
              </g>

              {/* Cream layers + drips */}
              {hasCream && (
                <g>
                  {/* Bottom tier cream top */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                    d="M40 170 Q60 158 90 168 T150 165 T210 168 T260 170 L260 178 L40 178 Z"
                    fill="url(#cream)"
                  />
                  {/* Drips bottom tier */}
                  {[60, 110, 165, 215].map((x, i) => (
                    <motion.ellipse
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3 + i * 0.05, type: "spring" }}
                      style={{ transformOrigin: `${x}px 178px` }}
                      cx={x}
                      cy={183 + (i % 2) * 4}
                      rx="6"
                      ry={8 + (i % 2) * 3}
                      fill="#ffb6c1"
                    />
                  ))}
                  {/* Top tier cream */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    d="M70 118 Q90 108 120 115 T180 113 T230 118 L230 125 L70 125 Z"
                    fill="url(#cream)"
                  />
                  {[88, 135, 175, 215].map((x, i) => (
                    <motion.ellipse
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.4 + i * 0.05, type: "spring" }}
                      style={{ transformOrigin: `${x}px 125px` }}
                      cx={x}
                      cy={130 + (i % 2) * 3}
                      rx="5"
                      ry={7 + (i % 2) * 2}
                      fill="#ffb6c1"
                    />
                  ))}
                  {/* Top swirl */}
                  <ellipse cx="150" cy="115" rx="60" ry="6" fill="#fff5f8" opacity="0.7" />
                </g>
              )}

              {/* Cherries on top tier rim */}
              {cherries.map((c, i) => {
                // map relative x to top-tier band (70-230)
                const px = 90 + ((c.x ?? 20 + i * 30) / 100) * 120;
                return (
                  <motion.g
                    key={i}
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                  >
                    <circle cx={px} cy={108} r="9" fill="#c41e3a" />
                    <circle cx={px - 2} cy={105} r="3" fill="#ff6b8a" opacity="0.7" />
                    <path d={`M${px} 100 Q${px + 4} 92 ${px + 8} 90`} stroke="#3a5f1f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <ellipse cx={px + 9} cy={89} rx="3" ry="1.5" fill="#5a8a3f" transform={`rotate(30 ${px + 9} 89)`} />
                  </motion.g>
                );
              })}

              {/* Candle */}
              {hasCandle && (
                <motion.g
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  {/* Candle body — pink/white stripes */}
                  <rect x="143" y="68" width="14" height="44" rx="2" fill="#ffffff" />
                  <rect x="143" y="72" width="14" height="6" fill="#ff6b8a" />
                  <rect x="143" y="86" width="14" height="6" fill="#ff6b8a" />
                  <rect x="143" y="100" width="14" height="6" fill="#ff6b8a" />
                  {/* Wick */}
                  <rect x="149" y="62" width="2" height="8" fill="#3a2218" />
                  {/* Flame */}
                  <motion.ellipse
                    cx="150"
                    cy="58"
                    rx="6"
                    ry="10"
                    fill="url(#flame)"
                    animate={{ scaleY: [1, 1.15, 0.92, 1.08, 1], scaleX: [1, 0.92, 1.05, 0.95, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ transformOrigin: "150px 60px", filter: "drop-shadow(0 0 6px #ffb347)" }}
                  />
                  <ellipse cx="150" cy="60" rx="2.5" ry="5" fill="#fff7c2" opacity="0.9" />
                </motion.g>
              )}
            </motion.svg>
          )}
        </div>

        {/* Tray */}
        <div className="p-4 mt-3">
          <p className="text-xs text-muted-foreground mb-2 text-center font-medium">
            Step {stageIdx + 1}/{STAGES.length}: <span className="text-foreground">{stage.label}</span>
            {stage.count > 1 && ` (${stageProgress}/${stage.count})`}
          </p>
          <div className="flex justify-center gap-3">
            {STAGES.map((s, i) => {
              const isCurrent = i === stageIdx;
              const isDone = i < stageIdx;
              return (
                <div
                  key={s.key}
                  className={`relative rounded-xl border-2 transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : isDone
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-muted/30 opacity-40"
                  }`}
                  style={{ width: 56, height: 56 }}
                >
                  {isCurrent ? (
                    <motion.div
                      key={`${s.key}-${stageProgress}`}
                      drag
                      dragSnapToOrigin
                      onDragStart={() => setHoverDrop(true)}
                      onDragEnd={handleDragEnd}
                      whileDrag={{ scale: 1.3, zIndex: 50 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ scale: { duration: 1.2, repeat: Infinity } }}
                      className="absolute inset-0 flex items-center justify-center text-3xl cursor-grab active:cursor-grabbing"
                    >
                      {s.emoji}
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      {isDone ? "✓" : s.emoji}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {wrong && (
            <p className="text-center text-xs text-destructive mt-2 font-medium">
              Cake pe drop karo!
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CakeBanaoGame;

// ============= Bake Scene (rotate + oven) =============
const BakeScene = ({ phase }: { phase: "rotate" | "oven" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-900 via-orange-950 to-black p-4 relative overflow-hidden">
      {/* Heat shimmer */}
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 50% 60%, #ff8c42 0%, transparent 60%)" }} />
      <div className="text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/90 font-display text-xl mb-6"
        >
          {phase === "rotate" ? "Cake spin ho raha hai... ✨" : "Oven me pak raha hai... 🔥"}
        </motion.p>

        {phase === "oven" && (
          <div className="relative mx-auto" style={{ width: 320, height: 280 }}>
            {/* Oven frame */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-zinc-700 to-zinc-900 border-4 border-zinc-600 shadow-2xl" />
            {/* Oven glass */}
            <div className="absolute inset-4 rounded-xl overflow-hidden border-2 border-amber-700"
              style={{ background: "radial-gradient(ellipse at center, #ff7a18 0%, #c2410c 50%, #4a1d05 100%)" }}>
              {/* Heat glow flicker */}
              <motion.div className="absolute inset-0"
                animate={{ opacity: [0.6, 1, 0.7, 0.95, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ background: "radial-gradient(circle at 50% 80%, #ffd700 0%, transparent 60%)" }}
              />
              {/* Rotating cake inside oven */}
              <motion.div
                className="absolute left-1/2 top-1/2 text-6xl"
                style={{ translateX: "-50%", translateY: "-50%" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                🎂
              </motion.div>
              {/* Sparks */}
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.span key={i} className="absolute text-xs"
                  initial={{ x: `${20 + Math.random() * 60}%`, y: "100%", opacity: 0 }}
                  animate={{ y: "-20%", opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                >✨</motion.span>
              ))}
            </div>
            {/* Oven knobs */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 rounded-full bg-zinc-400 border border-zinc-700" />
            <div className="absolute -bottom-2 right-6 w-4 h-4 rounded-full bg-zinc-400 border border-zinc-700" />
          </div>
        )}

        {phase === "rotate" && (
          <motion.div
            className="text-8xl mx-auto"
            animate={{ rotateY: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            🎂
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ============= Finale Screen (sky + fireworks + crackers + text) =============
const FinaleScreen = () => {
  const fireworks = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    cx: 10 + Math.random() * 80,
    cy: 15 + Math.random() * 35,
    delay: i * 0.4,
    hue: Math.floor(Math.random() * 360),
  }));

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 35%, #4a1d5e 70%, #7a2d3e 100%)",
      }}
    >
      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* Moon */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute right-10 top-10 w-20 h-20 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, #fff8e1, #ffd54f 70%, #ffb300)",
          boxShadow: "0 0 60px rgba(255, 213, 79, 0.6)",
        }}
      />

      {/* Fireworks bursts */}
      {fireworks.map((fw) => (
        <motion.div
          key={fw.id}
          className="absolute"
          style={{ left: `${fw.cx}%`, top: `${fw.cy}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: fw.delay, repeatDelay: 1.5 }}
        >
          {Array.from({ length: 18 }).map((_, j) => {
            const angle = (j / 18) * Math.PI * 2;
            return (
              <motion.span
                key={j}
                className="absolute block w-1.5 h-1.5 rounded-full"
                style={{
                  background: `hsl(${(fw.hue + j * 10) % 360}, 90%, 65%)`,
                  boxShadow: `0 0 8px hsl(${fw.hue}, 90%, 70%)`,
                }}
                animate={{
                  x: Math.cos(angle) * 90,
                  y: Math.sin(angle) * 90,
                  opacity: [1, 1, 0],
                  scale: [1, 1, 0.3],
                }}
                transition={{ duration: 1.6, repeat: Infinity, delay: fw.delay, repeatDelay: 1.5, ease: "easeOut" }}
              />
            );
          })}
        </motion.div>
      ))}

      {/* Ground crackers (fountain sparks) */}
      {[15, 50, 85].map((left, i) => (
        <div key={`crk-${i}`} className="absolute" style={{ left: `${left}%`, bottom: "8%" }}>
          {Array.from({ length: 24 }).map((_, j) => {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
            const dist = 80 + Math.random() * 100;
            return (
              <motion.span
                key={j}
                className="absolute block w-1 h-1 rounded-full"
                style={{
                  background: ["#ffd54f", "#ff8a65", "#ff5252", "#fff176"][j % 4],
                  boxShadow: "0 0 6px #ffd54f",
                }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist + 30,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.2 + Math.random() * 0.6,
                  repeat: Infinity,
                  delay: i * 0.2 + Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Confetti rain */}
      {Array.from({ length: 35 }).map((_, i) => (
        <motion.div
          key={`conf-${i}`}
          className="absolute"
          initial={{ y: -30, x: `${Math.random() * 100}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", rotate: 720 * (Math.random() > 0.5 ? 1 : -1) }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: "linear" }}
        >
          <span className="text-xl">{["🎉", "🎊", "✨", "💖", "🎀", "⭐", "🌸"][i % 7]}</span>
        </motion.div>
      ))}

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
          className="text-8xl mb-6 drop-shadow-2xl"
        >
          🎂
        </motion.div>
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-display font-bold text-4xl md:text-6xl text-white sparkle-text leading-tight"
        >
          Happy Birthday
        </motion.h1>
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="font-cursive text-6xl md:text-8xl mt-2 sparkle-text"
          style={{ color: "#ffd1dc" }}
        >
          Khushi
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-white/80 mt-6 text-sm md:text-base"
        >
          Tera surprise khul raha hai...
        </motion.p>
      </div>
    </div>
  );
};