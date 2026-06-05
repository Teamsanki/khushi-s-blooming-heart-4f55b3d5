import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BalloonPopGameProps {
  onComplete: () => void;
}

const TARGET = ["K", "H", "U", "S", "H", "I"];
const DISTRACTORS = ["A", "B", "M", "R", "P", "T", "N", "L", "E", "O"];
const COLORS = [
  "hsl(340 82% 70%)", // pink
  "hsl(280 70% 70%)", // purple
  "hsl(200 80% 68%)", // blue
  "hsl(45 90% 65%)",  // yellow
  "hsl(160 60% 60%)", // mint
  "hsl(15 85% 68%)",  // coral
];

interface Balloon {
  id: number;
  letter: string;
  color: string;
  x: number;        // vw
  duration: number; // s
  sway: number;     // px
  delay: number;
}

let nextId = 1;

const BalloonPopGame = ({ onComplete }: BalloonPopGameProps) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [step, setStep] = useState(0); // index into TARGET
  const [oops, setOops] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [burst, setBurst] = useState<{ id: number; x: number; y: number; color: string } | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  const spawnBalloon = useCallback(() => {
    const needNext = TARGET[stepRef.current];
    // 55% chance to include the needed next letter so game is solvable quickly
    const includeNeeded = Math.random() < 0.55 && needNext;
    const letter = includeNeeded
      ? needNext
      : Math.random() < 0.4
      ? TARGET[Math.floor(Math.random() * TARGET.length)]
      : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
    const b: Balloon = {
      id: nextId++,
      letter,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: 5 + Math.random() * 85,
      duration: 7 + Math.random() * 4,
      sway: 20 + Math.random() * 40,
      delay: 0,
    };
    setBalloons((prev) => [...prev, b]);
    // auto remove after duration
    setTimeout(() => {
      setBalloons((prev) => prev.filter((x) => x.id !== b.id));
    }, (b.duration + 1) * 1000);
  }, []);

  useEffect(() => {
    if (showComplete) return;
    // initial burst
    for (let i = 0; i < 4; i++) setTimeout(spawnBalloon, i * 300);
    const interval = setInterval(spawnBalloon, 1100);
    return () => clearInterval(interval);
  }, [spawnBalloon, showComplete]);

  const handlePop = (b: Balloon, evt: React.MouseEvent) => {
    const need = TARGET[stepRef.current];
    setBalloons((prev) => prev.filter((x) => x.id !== b.id));
    if (b.letter === need) {
      const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect();
      setBurst({ id: Date.now(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, color: b.color });
      setTimeout(() => setBurst(null), 700);
      const newStep = stepRef.current + 1;
      setStep(newStep);
      if (newStep >= TARGET.length) {
        setShowComplete(true);
        setTimeout(onComplete, 1700);
      }
    } else {
      setOops(true);
      setTimeout(() => setOops(false), 600);
    }
  };

  if (showComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${Math.random() * 100}vw`, opacity: 1, rotate: 0 }}
            animate={{ y: "110vh", rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
            transition={{ duration: 1.8 + Math.random() * 1.5, ease: "linear" }}
            className="absolute text-2xl"
          >
            {["🎉", "✨", "💖", "🎈", "⭐", "🌸"][i % 6]}
          </motion.div>
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-center relative z-10"
        >
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-display font-bold text-foreground">KHUSHI!</h2>
          <p className="text-muted-foreground mt-2">Pehla game complete! Next: Memory Match 🧠</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Soft pastel backdrop */}
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, hsl(var(--primary)/0.18), transparent 55%), radial-gradient(ellipse at 80% 80%, hsl(var(--accent)/0.15), transparent 55%)",
        }}
      />

      {/* Header */}
      <div className="relative z-20 max-w-md mx-auto pt-6 px-4">
        <motion.div
          animate={oops ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-card/90 backdrop-blur rounded-2xl shadow-xl border border-border overflow-hidden"
        >
          <div className="bg-primary p-4 text-center">
            <h2 className="text-base font-display font-bold text-primary-foreground">
              🎈 Balloons Pop Karo — Spell KHUSHI
            </h2>
            <p className="text-primary-foreground/70 text-xs mt-1">
              Sahi order me tap karo (K → H → U → S → H → I)
            </p>
          </div>
          <div className="p-4">
            <div className="flex justify-center gap-2">
              {TARGET.map((ltr, i) => {
                const filled = i < step;
                const current = i === step;
                return (
                  <motion.div
                    key={i}
                    animate={filled ? { scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`w-9 h-11 sm:w-10 sm:h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-colors ${
                      filled
                        ? "bg-success/15 border-success text-success"
                        : current
                        ? "bg-primary/10 border-primary text-primary animate-pulse"
                        : "bg-secondary border-border text-muted-foreground/40"
                    }`}
                  >
                    {filled ? ltr : "_"}
                  </motion.div>
                );
              })}
            </div>
            {oops && (
              <p className="text-center text-xs text-destructive mt-2 font-medium">
                Oops! Agla letter: <span className="font-bold">{TARGET[step]}</span>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Balloons */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {balloons.map((b) => (
            <motion.button
              key={b.id}
              initial={{ y: "110vh", opacity: 0, x: 0 }}
              animate={{
                y: "-25vh",
                opacity: 1,
                x: [0, b.sway, -b.sway, 0],
              }}
              exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.3 } }}
              transition={{
                y: { duration: b.duration, ease: "linear" },
                opacity: { duration: 0.5 },
                x: { duration: b.duration / 2, repeat: Infinity, ease: "easeInOut" },
              }}
              onClick={(e) => handlePop(b, e)}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ left: `${b.x}%`, top: 0 }}
              aria-label={`Balloon ${b.letter}`}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className="w-14 h-16 sm:w-16 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg relative"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${b.color}, ${b.color} 60%, hsl(0 0% 0% / 0.2))`,
                    borderRadius: "50% 50% 50% 50% / 55% 55% 45% 45%",
                  }}
                >
                  <span className="drop-shadow-md">{b.letter}</span>
                </div>
                {/* Knot */}
                <div
                  className="w-2 h-2"
                  style={{
                    background: b.color,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  }}
                />
                {/* String */}
                <div className="w-px h-10 bg-foreground/30" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Pop burst */}
      <AnimatePresence>
        {burst && (
          <div
            key={burst.id}
            className="fixed z-30 pointer-events-none"
            style={{ left: burst.x, top: burst.y }}
          >
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i / 10) * Math.PI * 2;
              const dist = 50 + Math.random() * 25;
              return (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute block w-2 h-2 rounded-full"
                  style={{ background: burst.color, left: -4, top: -4 }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BalloonPopGame;