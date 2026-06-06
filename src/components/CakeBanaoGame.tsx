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
  color: string;
  accent: string;
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

const MAX_LAYERS = 3;

const STEP_HINTS: Record<StepKey, string> = {
  flavor: "Step 1: Flavour drag karo — max 3 layers, order ↑↓ se adjust karo 🎨",
  type: "Step 2: Egg ya Eggless — apni pasand select karo 🥚🌿",
  fruit: "Step 3: Topping ke liye 3 fruits drag karo cake ke upar 🍓",
  bake: "Step 4: Oven me bake karo — perfect doneness pe Take Out dabao! 🔥",
};

const STEPS: StepKey[] = ["flavor", "type", "fruit", "bake"];
const STORAGE_KEY = "cakeBanaoProgress_v3";

interface SavedProgress {
  stepIdx: number;
  flavors: string[];
  type: "egg" | "eggless" | null;
  fruits: { id: string; x: number }[];
}

const CakeBanaoGame = ({ onComplete }: CakeBanaoGameProps) => {
  const initial: SavedProgress = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as SavedProgress;
        if (typeof p.stepIdx === "number" && Array.isArray(p.flavors) && Array.isArray(p.fruits)) return p;
      }
    } catch {}
    return { stepIdx: 0, flavors: [], type: null, fruits: [] };
  })();

  const [stepIdx, setStepIdx] = useState(initial.stepIdx);
  const [flavors, setFlavors] = useState<string[]>(initial.flavors);
  const [type, setType] = useState<"egg" | "eggless" | null>(initial.type);
  const [fruits, setFruits] = useState<{ id: string; x: number }[]>(initial.fruits);
  const [hoverDrop, setHoverDrop] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [baking, setBaking] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stepIdx, flavors, type, fruits }));
    } catch {}
  }, [stepIdx, flavors, type, fruits]);

  const currentStep = STEPS[stepIdx];
  const flavorObjs = flavors.map((id) => FLAVORS.find((f) => f.id === id)!).filter(Boolean);

  const fireBurst = () => setBurstKey((k) => k + 1);
  const goNext = () => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  const goBack = () => setStepIdx((i) => Math.max(0, i - 1));

  const handleFlavorDragEnd = (id: string) => (_e: any, info: PanInfo) => {
    setHoverDrop(false);
    if (!dropRef.current) return;
    const r = dropRef.current.getBoundingClientRect();
    const inside =
      info.point.x >= r.left && info.point.x <= r.right &&
      info.point.y >= r.top && info.point.y <= r.bottom;
    if (!inside) { setWrong(true); setTimeout(() => setWrong(false), 500); return; }
    if (flavors.length >= MAX_LAYERS) return;
    setFlavors([...flavors, id]);
    fireBurst();
  };

  const handleFruitDragEnd = (id: string) => (_e: any, info: PanInfo) => {
    setHoverDrop(false);
    if (!dropRef.current) return;
    const r = dropRef.current.getBoundingClientRect();
    const inside =
      info.point.x >= r.left && info.point.x <= r.right &&
      info.point.y >= r.top && info.point.y <= r.bottom;
    if (!inside) { setWrong(true); setTimeout(() => setWrong(false), 500); return; }
    const relX = ((info.point.x - r.left) / r.width) * 100;
    const next = [...fruits, { id, x: Math.max(15, Math.min(85, relX)) }];
    setFruits(next);
    fireBurst();
    if (next.length >= 3) setTimeout(goNext, 450);
  };

  const pickType = (id: "egg" | "eggless") => {
    setType(id);
    fireBurst();
    setTimeout(goNext, 450);
  };

  const moveLayer = (idx: number, dir: -1 | 1) => {
    const next = [...flavors];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setFlavors(next);
  };
  const removeLayer = (idx: number) => setFlavors(flavors.filter((_, i) => i !== idx));

  const startBake = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setBaking(true);
  };

  const finishBake = () => {
    setBaking(false);
    setShowComplete(true);
    setTimeout(onComplete, 9000);
  };

  if (showComplete) return <FinaleScreen />;
  if (baking) {
    return (
      <BakingScene
        flavors={flavorObjs}
        type={type}
        fruits={fruits}
        onFinish={finishBake}
      />
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

        {/* Cake area */}
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

          <CakeSVG flavors={flavorObjs} type={type} fruits={fruits} />

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
        <div className="p-4 mt-3 min-h-[170px]">
          {currentStep === "flavor" && (
            <>
              <p className="text-xs text-muted-foreground mb-2 text-center">
                {flavors.length}/{MAX_LAYERS} layers · drag flavour → cake pe drop
              </p>

              {/* Stack reorder list */}
              {flavors.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {flavors.map((id, i) => {
                    const f = FLAVORS.find((x) => x.id === id)!;
                    return (
                      <div
                        key={`${id}-${i}`}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border bg-muted/40"
                      >
                        <span className="text-[10px] text-muted-foreground w-10">
                          Top {flavors.length - i}
                        </span>
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ background: f.color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)" }}
                        />
                        <span className="text-xs font-medium text-foreground flex-1">{f.name}</span>
                        <button
                          onClick={() => moveLayer(i, -1)}
                          disabled={i === 0}
                          className="w-6 h-6 rounded text-xs bg-background hover:bg-accent/20 disabled:opacity-30"
                          aria-label="Move up"
                        >↑</button>
                        <button
                          onClick={() => moveLayer(i, 1)}
                          disabled={i === flavors.length - 1}
                          className="w-6 h-6 rounded text-xs bg-background hover:bg-accent/20 disabled:opacity-30"
                          aria-label="Move down"
                        >↓</button>
                        <button
                          onClick={() => removeLayer(i)}
                          className="w-6 h-6 rounded text-xs bg-background hover:bg-destructive/20 text-destructive"
                          aria-label="Remove"
                        >×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {FLAVORS.map((f) => (
                  <motion.div
                    key={f.id}
                    drag={flavors.length < MAX_LAYERS}
                    dragSnapToOrigin
                    onDragStart={() => setHoverDrop(true)}
                    onDragEnd={handleFlavorDragEnd(f.id)}
                    whileDrag={{ scale: 1.25, zIndex: 50 }}
                    whileHover={{ scale: 1.05 }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-border bg-muted/30 ${
                      flavors.length < MAX_LAYERS ? "cursor-grab active:cursor-grabbing" : "opacity-40 cursor-not-allowed"
                    }`}
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

              {flavors.length > 0 && (
                <button
                  onClick={goNext}
                  className="mt-3 w-full py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                >
                  Next →
                </button>
              )}
            </>
          )}

          {currentStep === "type" && (
            <>
              <p className="text-xs text-muted-foreground mb-3 text-center">Tap karke choose karo</p>
              <div className="grid grid-cols-2 gap-3">
                {TYPES.map((t) => (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => pickType(t.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors ${
                      type === t.id ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:border-primary"
                    }`}
                  >
                    <span className="text-3xl">{t.emoji}</span>
                    <span className="text-sm font-semibold text-foreground">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground text-center">{t.desc}</span>
                  </motion.button>
                ))}
              </div>
              <button onClick={goBack} className="mt-3 text-xs text-muted-foreground underline w-full">← Back</button>
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
              <button onClick={goBack} className="mt-3 text-xs text-muted-foreground underline w-full">← Back</button>
            </>
          )}

          {currentStep === "bake" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground text-center">
                Tera cake ready hai — ab oven me bake karo 🔥
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
                <p>Layers: <span className="text-foreground font-medium">
                  {flavorObjs.map((f) => f.name).join(" + ") || "—"}
                </span></p>
                <p>Type: <span className="text-foreground font-medium">{type === "egg" ? "With Egg" : "Eggless"}</span></p>
                <p>Toppings: <span className="text-foreground font-medium">{fruits.map(f => FRUITS.find(x=>x.id===f.id)?.emoji).join(" ")}</span></p>
              </div>
              <button onClick={goBack} className="text-xs text-muted-foreground underline">← Back</button>
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

// ============= Cake SVG (stacked layers) =============
const CakeSVG = ({
  flavors,
  type,
  fruits,
  baked = 0, // 0..1 browning factor for oven view
}: {
  flavors: FlavorOpt[];
  type: "egg" | "eggless" | null;
  fruits: { id: string; x: number }[];
  baked?: number;
}) => {
  // Up to 3 stacked tiers from bottom→top. Layers[0] is bottom.
  const tiers = [
    { y: 170, h: 60, x: 40, w: 220 },  // bottom
    { y: 122, h: 50, x: 70, w: 160 },  // middle
    { y: 80,  h: 40, x: 100, w: 100 }, // top
  ];

  // Browning darkens cream & sponge as baked rises (max ~0.5)
  const darken = (hex: string, amt: number) => {
    const h = hex.replace("#", "");
    const r = Math.max(0, parseInt(h.slice(0, 2), 16) - Math.round(255 * amt));
    const g = Math.max(0, parseInt(h.slice(2, 4), 16) - Math.round(255 * amt));
    const b = Math.max(0, parseInt(h.slice(4, 6), 16) - Math.round(255 * amt));
    return `rgb(${r},${g},${b})`;
  };
  const bakeAmt = Math.min(0.45, baked * 0.45);

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
          <stop offset="0%" stopColor={darken("#d6a877", bakeAmt)} />
          <stop offset="50%" stopColor={darken("#b8854a", bakeAmt)} />
          <stop offset="100%" stopColor={darken("#8a5c2e", bakeAmt)} />
        </linearGradient>
        <linearGradient id="plate2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="100%" stopColor="#c8c8c8" />
        </linearGradient>
      </defs>

      {/* Plate */}
      <ellipse cx="150" cy="240" rx="120" ry="14" fill="url(#plate2)" />
      <ellipse cx="150" cy="236" rx="105" ry="9" fill="#ffffff" opacity="0.4" />

      {/* Tiers — only render up to flavors.length+1; bottom sponge always shown */}
      {tiers.map((t, idx) => {
        // bottom tier always visible; upper tiers only if user added enough layers
        if (idx > 0 && flavors.length < idx) return null;
        const f = flavors[idx]; // flavour for this tier's cream (may be undefined for bottom if no flavor)
        return (
          <g key={idx}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="6" fill="url(#sponge2)" />
            {/* crumb dots */}
            {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((p, i) => (
              <circle key={i} cx={t.x + t.w * p} cy={t.y + 18 + (i % 2) * 18} r="2" fill="#fff" opacity="0.2" />
            ))}
            {/* cream on top of this tier */}
            {f && (
              <motion.g
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <path
                  d={`M${t.x} ${t.y} Q${t.x + t.w * 0.2} ${t.y - 12} ${t.x + t.w * 0.4} ${t.y - 4}
                      T${t.x + t.w * 0.7} ${t.y - 6} T${t.x + t.w} ${t.y} L${t.x + t.w} ${t.y + 10} L${t.x} ${t.y + 10} Z`}
                  fill={darken(f.color, bakeAmt * 0.7)}
                />
                {[0.15, 0.4, 0.65, 0.88].map((p, i) => (
                  <ellipse
                    key={i}
                    cx={t.x + t.w * p}
                    cy={t.y + 14 + (i % 2) * 4}
                    rx="5"
                    ry={7 + (i % 2) * 2}
                    fill={darken(f.accent, bakeAmt * 0.7)}
                  />
                ))}
                <ellipse cx={t.x + t.w / 2} cy={t.y - 3} rx={t.w * 0.35} ry="5" fill="#ffffff" opacity="0.45" />
              </motion.g>
            )}
          </g>
        );
      })}

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

      {/* Fruits — perch on highest tier */}
      {fruits.map((fr, i) => {
        const topTier = tiers[Math.min(flavors.length, tiers.length - 1)];
        const px = topTier.x + (fr.x / 100) * topTier.w;
        const py = topTier.y - 10;
        const meta = FRUITS.find((x) => x.id === fr.id)!;
        return (
          <motion.g
            key={i}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.6 }}
          >
            <circle cx={px} cy={py} r="10" fill={meta.color} />
            <circle cx={px - 2.5} cy={py - 3} r="3" fill="#ffffff" opacity="0.55" />
            <text x={px} y={py + 5} textAnchor="middle" fontSize="11">{meta.emoji}</text>
          </motion.g>
        );
      })}
    </motion.svg>
  );
};

// ============= Baking Scene with real cake + timer =============
const BAKE_DURATION_MS = 8000;

type Doneness = "raw" | "baking" | "ready" | "overbaked";

const donenessFor = (pct: number): Doneness => {
  if (pct < 35) return "raw";
  if (pct < 70) return "baking";
  if (pct < 92) return "ready";
  return "overbaked";
};

const DONENESS_META: Record<Doneness, { label: string; emoji: string; color: string; tip: string }> = {
  raw: { label: "Undercooked", emoji: "🥶", color: "#7a8edb", tip: "Abhi kachha hai — thoda aur ruk!" },
  baking: { label: "Baking…", emoji: "🔥", color: "#ff8c42", tip: "Sundar khushboo aa rahi hai…" },
  ready: { label: "Perfectly Ready!", emoji: "✨", color: "#4caf50", tip: "Abhi nikaalo — perfect doneness!" },
  overbaked: { label: "Overbaked", emoji: "🥵", color: "#c2410c", tip: "Thoda jal gaya — jaldi nikaalo!" },
};

const BakingScene = ({
  flavors,
  type,
  fruits,
  onFinish,
}: {
  flavors: FlavorOpt[];
  type: "egg" | "eggless" | null;
  fruits: { id: string; x: number }[];
  onFinish: () => void;
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState<Doneness | null>(null);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      const e = Date.now() - startRef.current;
      setElapsed(e);
      if (e >= BAKE_DURATION_MS + 2500) {
        // auto take out as overbaked
        setDone("overbaked");
        clearInterval(id);
      }
    }, 80);
    return () => clearInterval(id);
  }, [done]);

  const pct = Math.min(100, (elapsed / BAKE_DURATION_MS) * 100);
  const live = donenessFor(pct);
  const current = done ?? live;
  const meta = DONENESS_META[current];
  const baked = Math.min(1, elapsed / BAKE_DURATION_MS);

  const handleTakeOut = () => {
    if (done) return;
    setDone(live);
    setTimeout(onFinish, 2200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-900 via-orange-950 to-black p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(circle at 50% 60%, #ff8c42 0%, transparent 60%)" }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/90 font-display text-xl mb-4 text-center"
        >
          Tera cake oven me pak raha hai…
        </motion.p>

        {/* Oven */}
        <div className="relative mx-auto" style={{ width: 340, height: 320 }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-zinc-700 to-zinc-900 border-4 border-zinc-600 shadow-2xl" />
          <div
            className="absolute inset-4 rounded-xl overflow-hidden border-2 border-amber-700 flex items-end justify-center"
            style={{ background: "radial-gradient(ellipse at center, #ff7a18 0%, #c2410c 50%, #4a1d05 100%)" }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.5, 1, 0.7, 0.95, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ background: "radial-gradient(circle at 50% 80%, #ffd700 0%, transparent 60%)" }}
            />

            {/* Real cake inside oven, slowly browning + gentle rotation */}
            <motion.div
              className="relative z-10"
              animate={{ rotate: done ? 0 : [0, 4, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                filter: `brightness(${1 - baked * 0.25}) sepia(${baked * 0.6})`,
              }}
            >
              <CakeSVG flavors={flavors} type={type} fruits={fruits} baked={baked} />
            </motion.div>

            {/* Sparks */}
            {Array.from({ length: 12 }).map((_, i) => (
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

        {/* Timer + progress */}
        <div className="w-full mt-5 px-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/80 text-xs font-medium">
              {(elapsed / 1000).toFixed(1)}s / {(BAKE_DURATION_MS / 1000).toFixed(0)}s
            </span>
            <motion.span
              key={current}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}` }}
            >
              {meta.emoji} {meta.label}
            </motion.span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, #ffd54f, ${meta.color})`,
                boxShadow: `0 0 12px ${meta.color}`,
              }}
            />
          </div>
          <p className="text-center text-white/70 text-xs mt-2 italic">{meta.tip}</p>
        </div>

        {/* Take out button */}
        <motion.button
          whileHover={{ scale: done ? 1 : 1.05 }}
          whileTap={{ scale: done ? 1 : 0.95 }}
          onClick={handleTakeOut}
          disabled={!!done}
          className="mt-4 px-8 py-3 rounded-full font-bold text-white shadow-lg disabled:opacity-60"
          style={{
            background: `linear-gradient(135deg, ${meta.color}, #ff5722)`,
            boxShadow: `0 8px 24px ${meta.color}66`,
          }}
        >
          {done ? `${meta.emoji} ${meta.label}` : "🧤 Take Out"}
        </motion.button>
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