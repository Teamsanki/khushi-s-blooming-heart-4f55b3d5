import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface CakeBanaoGameProps {
  onComplete: () => void;
}

type StepKey = "flavor" | "type" | "fruit" | "bake";

interface FlavorOpt {
  id: string;
  name: string;
  emoji: string;
  color: string; // hex for cream layer
  accent: string; // drip color
}

interface TypeOpt {
  id: "egg" | "eggless";
  name: string;
  emoji: string;
  desc: string;
}

interface FruitOpt {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const FLAVORS: FlavorOpt[] = [
  { id: "chocolate", name: "Chocolate", emoji: "🍫", color: "#5a2e18", accent: "#3d1d10" },
  { id: "vanilla", name: "Vanilla", emoji: "🍦", color: "#fff5d6", accent: "#f0d99b" },
  { id: "strawberry", name: "Strawberry", emoji: "🍓", color: "#ff9fb8", accent: "#e0738f" },
  { id: "butterscotch", name: "Butterscotch", emoji: "🍯", color: "#e6a64a", accent: "#b87b2a" },
  { id: "redvelvet", name: "Red Velvet", emoji: "❤️", color: "#c8324a", accent: "#8e1f33" },
  { id: "blueberry", name: "Blueberry", emoji: "🫐", color: "#7a8edb", accent: "#4f64b0" },
];

const TYPES: TypeOpt[] = [
  { id: "eggless", name: "Eggless", emoji: "🌿", desc: "Pure veg — soft & fluffy" },
  { id: "egg", name: "With Egg", emoji: "🥚", desc: "Classic rich texture" },
];

const FRUITS: FruitOpt[] = [
  { id: "cherry", name: "Cherry", emoji: "🍒", color: "#c41e3a" },
  { id: "strawberry", name: "Strawberry", emoji: "🍓", color: "#ff4d6d" },
  { id: "blueberry", name: "Blueberry", emoji: "🫐", color: "#4f64b0" },
  { id: "kiwi", name: "Kiwi", emoji: "🥝", color: "#8bc34a" },
  { id: "mango", name: "Mango", emoji: "🥭", color: "#ffb300" },
  { id: "grape", name: "Grapes", emoji: "🍇", color: "#7b3fa0" },
];

const STEP_HINTS: Record<StepKey, string> = {
  flavor: "Step 1: Cake ka flavour choose karo — drag karke base pe rakho 🎨",
  type: "Step 2: Egg ya Eggless — apni pasand select karo 🥚🌿",
  fruit: "Step 3: Topping ke liye fruit drag karo cake ke upar 🍓",
  bake: "Step 4: Ab oven me bake karo — Bake button dabao! 🔥",
};

const STEPS: StepKey[] = ["flavor", "type", "fruit", "bake"];
const STORAGE_KEY = "cakeBanaoProgress_v2";

interface SavedProgress {
  stepIdx: number;
  flavor: string | null;
  type: "egg" | "eggless" | null;
  fruits: { id: string; x: number }[];
}

const CakeBanaoGame = ({ onComplete }: CakeBanaoGameProps) => {
  const initial: SavedProgress = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as SavedProgress;
        if (typeof p.stepIdx === "number" && Array.isArray(p.fruits)) return p;
      }
    } catch {}
    return { stepIdx: 0, flavor: null, type: null, fruits: [] };
  })();

  const [stepIdx, setStepIdx] = useState(initial.stepIdx);
  const [flavor, setFlavor] = useState<string | null>(initial.flavor);
  const [type, setType] = useState<"egg" | "eggless" | null>(initial.type);
  const [fruits, setFruits] = useState<{ id: string; x: number }[]>(initial.fruits);
  const [hoverDrop, setHoverDrop] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [bakePhase, setBakePhase] = useState<"idle" | "rotate" | "oven" | "finale">("idle");
  const [showComplete, setShowComplete] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stepIdx, flavor, type, fruits }));
    } catch {}
  }, [stepIdx, flavor, type, fruits]);

  const currentStep = STEPS[stepIdx];
  const flavorObj = FLAVORS.find((f) => f.id === flavor) ?? null;

  const fireBurst = () => {
    setBurstKey((k) => k + 1);
  };

  const advance = () => {
    setTimeout(() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1)), 450);
  };

  // Drag-end handlers
  const handleFlavorDragEnd = (id: string) => (_e: any, info: PanInfo) => {
    setHoverDrop(false);
    if (!dropRef.current) return;
    const r = dropRef.current.getBoundingClientRect();
    const inside =
      info.point.x >= r.left && info.point.x <= r.right &&
      info.point.y >= r.top && info.point.y <= r.bottom;
    if (!inside) {
      setWrong(true); setTimeout(() => setWrong(false), 500); return;
    }
    setFlavor(id);
    fireBurst();
    advance();
  };

  const handleFruitDragEnd = (id: string) => (_e: any, info: PanInfo) => {
    setHoverDrop(false);
    if (!dropRef.current) return;
    const r = dropRef.current.getBoundingClientRect();
    const inside =
      info.point.x >= r.left && info.point.x <= r.right &&
      info.point.y >= r.top && info.point.y <= r.bottom;
    if (!inside) {
      setWrong(true); setTimeout(() => setWrong(false), 500); return;
    }
    const relX = ((info.point.x - r.left) / r.width) * 100;
    const next = [...fruits, { id, x: Math.max(15, Math.min(85, relX)) }];
    setFruits(next);
    fireBurst();
    if (next.length >= 3) advance();
  };

  const pickType = (id: "egg" | "eggless") => {
    setType(id);
    fireBurst();
    advance();
  };

  const startBake = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setTimeout(() => setBakePhase("rotate"), 200);
    setTimeout(() => setBakePhase("oven"), 2700);
    setTimeout(() => { setBakePhase("finale"); setShowComplete(true); }, 6500);
    setTimeout(onComplete, 12000);
  };

  if (showComplete) return <FinaleScreen />;
  if (bakePhase === "rotate" || bakePhase === "oven") return <BakeScene phase={bakePhase} />;

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
        {/* Header */}
        <div className="bg-primary p-5 text-center">
          <h2 className="text-lg font-display font-bold text-primary-foreground">
            🎂 Cake Banao Khushi Ke Liye
          </h2>
          <p className="text-primary-foreground/80 text-xs mt-2">{STEP_HINTS[currentStep]}</p>
          <div className="flex gap-1.5 justify-center mt-3">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-2 flex-1 max-w-10 rounded-full transition-all duration-300 ${
                  i < stepIdx ? "bg-accent" : i === stepIdx ? "bg-accent/70 animate-pulse" : "bg-primary-foreground/30"
                }`}
              />
            ))}
          </div>
          <p className="text-primary-foreground/60 text-[10px] mt-2 tracking-wider uppercase">
            Step {stepIdx + 1} / {STEPS.length}
          </p>
        </div>

        {/* Cake preview / drop area */}
        <div
          ref={dropRef}
          className={`relative h-72 mx-4 mt-4 rounded-xl border-2 border-dashed transition-colors flex items-end justify-center pb-4 overflow-hidden ${
            hoverDrop ? "border-primary bg-primary/5" : "border-border bg-muted/30"
          }`}
        >
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--muted)/0.2) 0%, hsl(var(--muted)/0.5) 100%)",
            }}
          />

          <CakeSVG flavor={flavorObj} type={type} fruits={fruits} />

          {/* Sparkle burst */}
          <AnimatePresence>
            {burstKey > 0 && (
              <div key={burstKey} className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {Array.from({ length: 14 }).map((_, i) => {
                  const angle = (i / 14) * Math.PI * 2;
                  return (
                    <motion.span
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                      animate={{
                        x: Math.cos(angle) * 90,
                        y: Math.sin(angle) * 90 - 30,
                        opacity: 0,
                        scale: 1.3,
                      }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="absolute text-lg"
                    >
                      {["✨", "💖", "⭐", "🌸"][i % 4]}
                    </motion.span>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Step controls */}
        <div className="p-4 mt-3 min-h-[140px]">
          {currentStep === "flavor" && (
            <>
              <p className="text-xs text-muted-foreground mb-3 text-center">
                Drag karo → cake pe drop karo
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FLAVORS.map((f) => (
                  <motion.div
                    key={f.id}
                    drag
                    dragSnapToOrigin
                    onDragStart={() => setHoverDrop(true)}
                    onDragEnd={handleFlavorDragEnd(f.id)}
                    whileDrag={{ scale: 1.25, zIndex: 50 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-border bg-muted/30 cursor-grab active:cursor-grabbing"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner"
                      style={{ background: f.color }}
                    >
                      {f.emoji}
                    </div>
                    <span className="text-[10px] font-medium text-foreground">{f.name}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {currentStep === "type" && (
            <>
              <p className="text-xs text-muted-foreground mb-3 text-center">
                Tap karke choose karo
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TYPES.map((t) => (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => pickType(t.id)}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border bg-muted/30 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-3xl">{t.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground text-center">{t.desc}</span>
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {currentStep === "fruit" && (
            <>
              <p className="text-xs text-muted-foreground mb-3 text-center">
                {fruits.length}/3 fruits — drag karke top pe rakho
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FRUITS.map((fr) => (
                  <motion.div
                    key={fr.id}
                    drag
                    dragSnapToOrigin
                    onDragStart={() => setHoverDrop(true)}
                    onDragEnd={handleFruitDragEnd(fr.id)}
                    whileDrag={{ scale: 1.3, zIndex: 50 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-border bg-muted/30 cursor-grab active:cursor-grabbing"
                  >
                    <span className="text-2xl">{fr.emoji}</span>
                    <span className="text-[10px] font-medium text-foreground">{fr.name}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {currentStep === "bake" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground text-center">
                Cake ready hai — ab oven me bake karo 🔥
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startBake}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-accent to-primary text-primary-foreground font-bold text-lg shadow-lg"
                style={{ boxShadow: "0 8px 24px hsl(var(--primary) / 0.4)" }}
              >
                🔥 Bake Now
              </motion.button>
              <div className="text-[11px] text-muted-foreground text-center space-y-0.5">
                <p>Flavour: <span className="text-foreground font-medium">{flavorObj?.name}</span></p>
                <p>Type: <span className="text-foreground font-medium">{type === "egg" ? "With Egg" : "Eggless"}</span></p>
                <p>Toppings: <span className="text-foreground font-medium">{fruits.map(f => FRUITS.find(x=>x.id===f.id)?.emoji).join(" ")}</span></p>
              </div>
            </div>
          )}

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

// ============= Cake SVG =============
const CakeSVG = ({
  flavor,
  type,
  fruits,
}: {
  flavor: FlavorOpt | null;
  type: "egg" | "eggless" | null;
  fruits: { id: string; x: number }[];
}) => {
  const creamColor = flavor?.color ?? "#e8e3df";
  const dripColor = flavor?.accent ?? "#c9c2bd";

  return (
    <motion.svg
      viewBox="0 0 300 260"
      className="w-72 h-72 drop-shadow-xl"
      initial={{ scale: 0.85, opacity: 0.9 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.3 }}
    >
      <defs>
        <linearGradient id="sponge2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6a877" />
          <stop offset="50%" stopColor="#b8854a" />
          <stop offset="100%" stopColor="#8a5c2e" />
        </linearGradient>
        <linearGradient id="plate2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="100%" stopColor="#c8c8c8" />
        </linearGradient>
        <linearGradient id="creamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="40%" stopColor={creamColor} />
          <stop offset="100%" stopColor={dripColor} />
        </linearGradient>
      </defs>

      {/* Plate */}
      <ellipse cx="150" cy="240" rx="120" ry="14" fill="url(#plate2)" />
      <ellipse cx="150" cy="236" rx="105" ry="9" fill="#ffffff" opacity="0.4" />

      {/* PRE-MADE BASE — always visible */}
      <g>
        <rect x="40" y="170" width="220" height="65" rx="6" fill="url(#sponge2)" />
        {[55, 95, 135, 175, 215, 245].map((cx, i) => (
          <circle key={i} cx={cx} cy={195 + (i % 2) * 18} r="2" fill="#fff" opacity="0.2" />
        ))}
        <rect x="70" y="118" width="160" height="58" rx="6" fill="url(#sponge2)" />
        {[85, 120, 155, 190, 220].map((cx, i) => (
          <circle key={i} cx={cx} cy={138 + (i % 2) * 16} r="2" fill="#fff" opacity="0.2" />
        ))}
      </g>

      {/* Flavor cream layer */}
      <AnimatePresence>
        {flavor && (
          <motion.g
            key={flavor.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {/* Bottom tier cream */}
            <path
              d="M40 170 Q60 158 90 168 T150 165 T210 168 T260 170 L260 180 L40 180 Z"
              fill="url(#creamGrad)"
            />
            {[60, 110, 165, 215].map((x, i) => (
              <ellipse
                key={i}
                cx={x}
                cy={184 + (i % 2) * 4}
                rx="6"
                ry={8 + (i % 2) * 3}
                fill={dripColor}
              />
            ))}
            {/* Top tier cream */}
            <path
              d="M70 118 Q90 108 120 115 T180 113 T230 118 L230 126 L70 126 Z"
              fill="url(#creamGrad)"
            />
            {[88, 135, 175, 215].map((x, i) => (
              <ellipse
                key={i}
                cx={x}
                cy={131 + (i % 2) * 3}
                rx="5"
                ry={7 + (i % 2) * 2}
                fill={dripColor}
              />
            ))}
            <ellipse cx="150" cy="115" rx="60" ry="6" fill="#ffffff" opacity="0.55" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Egg / Eggless badge */}
      <AnimatePresence>
        {type && (
          <motion.g
            key={type}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <circle cx="248" cy="208" r="14" fill="#ffffff" stroke={type === "eggless" ? "#4caf50" : "#ff9800"} strokeWidth="2" />
            <text x="248" y="213" textAnchor="middle" fontSize="14">
              {type === "eggless" ? "🌿" : "🥚"}
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Fruit toppings */}
      {fruits.map((fr, i) => {
        const px = 90 + (fr.x / 100) * 120;
        const meta = FRUITS.find((x) => x.id === fr.id)!;
        return (
          <motion.g
            key={i}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.6 }}
          >
            <circle cx={px} cy={108} r="10" fill={meta.color} />
            <circle cx={px - 2.5} cy={105} r="3" fill="#ffffff" opacity="0.55" />
            <text x={px} y={113} textAnchor="middle" fontSize="11">
              {meta.emoji}
            </text>
          </motion.g>
        );
      })}
    </motion.svg>
  );
};

// ============= Bake Scene =============
const BakeScene = ({ phase }: { phase: "rotate" | "oven" }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-900 via-orange-950 to-black p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(circle at 50% 60%, #ff8c42 0%, transparent 60%)" }}
      />
      <div className="text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/90 font-display text-xl mb-6"
        >
          {phase === "rotate" ? "Cake oven me jaa raha hai... ✨" : "Oven me pak raha hai... 🔥"}
        </motion.p>

        {phase === "oven" && (
          <div className="relative mx-auto" style={{ width: 320, height: 280 }}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-zinc-700 to-zinc-900 border-4 border-zinc-600 shadow-2xl" />
            <div
              className="absolute inset-4 rounded-xl overflow-hidden border-2 border-amber-700"
              style={{ background: "radial-gradient(ellipse at center, #ff7a18 0%, #c2410c 50%, #4a1d05 100%)" }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: [0.6, 1, 0.7, 0.95, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ background: "radial-gradient(circle at 50% 80%, #ffd700 0%, transparent 60%)" }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 text-6xl"
                style={{ translateX: "-50%", translateY: "-50%" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                🎂
              </motion.div>
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-xs"
                  initial={{ x: `${20 + Math.random() * 60}%`, y: "100%", opacity: 0 }}
                  animate={{ y: "-20%", opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                >
                  ✨
                </motion.span>
              ))}
            </div>
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

// ============= Finale Screen =============
const FinaleScreen = () => {
  const fireworks = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    cx: 10 + Math.random() * 80,
    cy: 15 + Math.random() * 35,
    delay: i * 0.4,
    hue: Math.floor(Math.random() * 360),
  }));

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 35%, #4a1d5e 70%, #7a2d3e 100%)",
      }}
    >
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