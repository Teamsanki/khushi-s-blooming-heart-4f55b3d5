import { useState, useRef } from "react";
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
  { key: "base", emoji: "🍰", label: "Sponge Base", count: 1, hint: "Plate pe sponge base rakho" },
  { key: "cream", emoji: "🍦", label: "Cream", count: 1, hint: "Base pe cream layer drag karo" },
  { key: "cherry", emoji: "🍒", label: "Cherries", count: 3, hint: "3 cherries top pe rakho" },
  { key: "candle", emoji: "🕯️", label: "Candle", count: 1, hint: "Last me candle laga do" },
];

const CakeBanaoGame = ({ onComplete }: CakeBanaoGameProps) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [stageProgress, setStageProgress] = useState(0); // how many of current stage placed
  const [placed, setPlaced] = useState<{ stage: StageKey; x?: number }[]>([]);
  const [hoverDrop, setHoverDrop] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [wrong, setWrong] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

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
    if (newProg >= stage.count) {
      if (stageIdx + 1 >= STAGES.length) {
        setShowComplete(true);
        setTimeout(onComplete, 2000);
      } else {
        setStageIdx(stageIdx + 1);
        setStageProgress(0);
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
          className={`relative h-72 mx-4 mt-4 rounded-xl border-2 border-dashed transition-colors flex items-end justify-center pb-4 ${
            hoverDrop ? "border-primary bg-primary/5" : "border-border bg-muted/30"
          }`}
        >
          {!hasBase && (
            <p className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-sm">
              Yahan drop karo ⬇️
            </p>
          )}
          {/* Plate */}
          {hasBase && (
            <div className="relative flex flex-col items-center">
              {/* Candle (on top) */}
              {hasCandle && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="relative -mb-1 z-30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 0.95, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-3 h-4 rounded-full mx-auto"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 30%, #fff7c2, #ffb347 60%, #ff5722)",
                      boxShadow: "0 0 12px #ffb347",
                    }}
                  />
                  <div className="w-2 h-6 mx-auto rounded-sm bg-gradient-to-b from-pink-300 to-pink-500" />
                </motion.div>
              )}

              {/* Cherries */}
              {cherries.length > 0 && (
                <div className="relative w-56 h-6 z-20 -mb-2">
                  {cherries.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -20, opacity: 0, scale: 0.6 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                      className="absolute text-xl"
                      style={{
                        left: `${Math.min(85, Math.max(5, c.x ?? 20 + i * 30))}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      🍒
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Cream */}
              {hasCream && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="w-56 h-7 rounded-t-full -mb-1 z-10 relative"
                  style={{
                    background:
                      "linear-gradient(180deg, #ffe4ec 0%, #ffd1dc 60%, #ffb6c1 100%)",
                    boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Drips */}
                  <div className="absolute -bottom-1 left-3 w-3 h-3 rounded-b-full bg-pink-200" />
                  <div className="absolute -bottom-1 left-16 w-2 h-2 rounded-b-full bg-pink-200" />
                  <div className="absolute -bottom-1 right-6 w-3 h-3 rounded-b-full bg-pink-200" />
                  <div className="absolute -bottom-1 right-20 w-2 h-2 rounded-b-full bg-pink-200" />
                </motion.div>
              )}

              {/* Sponge base */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="w-56 h-20 rounded-md"
                style={{
                  background:
                    "linear-gradient(180deg, #f4c98c 0%, #e0a96d 50%, #c98b56 100%)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                }}
              />
              {/* Plate */}
              <div
                className="w-64 h-3 rounded-full -mt-1"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                }}
              />
            </div>
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