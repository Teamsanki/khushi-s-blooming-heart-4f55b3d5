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
        setShowComplete(true);
        // Cake fully built — clear saved progress so next visit starts fresh
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        setTimeout(onComplete, 2000);
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Confetti */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${Math.random() * 100}vw`, opacity: 1 }}
            animate={{ y: "110vh", rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
            transition={{ duration: 2 + Math.random() * 2, ease: "linear" }}
            className="absolute text-2xl"
          >
            {["🎉", "✨", "💖", "🎀", "⭐"][i % 5]}
          </motion.div>
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-center relative z-10"
        >
          <div className="text-7xl mb-4">🎂</div>
          <h2 className="text-3xl font-display font-bold text-foreground">
            Happy Birthday Khushi!
          </h2>
          <p className="text-muted-foreground mt-2">Surprise khul raha hai...</p>
        </motion.div>
      </div>
    );
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