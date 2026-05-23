import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface CountdownScreenProps {
  targetDate: Date;
  onUnlock: () => void;
}

const LAUNCH_DATE = new Date("2025-06-23T00:00:00");

const CountdownScreen = ({ targetDate, onUnlock }: CountdownScreenProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [now, setNow] = useState(Date.now());

  const totalDays = useMemo(() => {
    return Math.ceil((targetDate.getTime() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24));
  }, [targetDate]);

  // Pre-compute sparkle + emoji particle positions ONCE so re-renders (every second) don't jitter them
  const sparkles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 4,
        colorIdx: i % 3,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 4,
      })),
    []
  );
  const emojiParticles = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        left: 5 + i * 6,
        top: 10 + (i % 4) * 20,
        emoji: ["🎂", "🎈", "🎉", "💖", "✨", "🌸", "🎁", "👑"][i % 8],
        duration: 3 + i * 0.5,
        delay: i * 0.3,
      })),
    []
  );

  useEffect(() => {
    const check = () => {
      const current = Date.now();
      setNow(current);
      const diff = targetDate.getTime() - current;

      if (diff <= 0) {
        setIsUnlocked(true);
        onUnlock();
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        ms: Math.floor((diff % 1000) / 10),
      });
    };

    check();
    // Smooth ~60fps ticker for realistic feel
    let raf = 0;
    const loop = () => { check(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [targetDate, onUnlock]);

  // Days passed since launch
  const daysPassed = Math.floor((now - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = timeLeft.days;

  // Daily progress: 24-hour cycle progress (0–100)
  const msInDay = 24 * 60 * 60 * 1000;
  const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0)).getTime();
  const elapsedToday = now - todayStart;
  const dailyProgress = Math.min(100, Math.max(0, (elapsedToday / msInDay) * 100));

  // Per-day layer reveal: one blur layer hates per day passed since LAUNCH_DATE.
  // Blur stays constant within a day — only changes when the date rolls over.
  const totalLayers = totalDays;
  const layersRemoved = Math.min(totalLayers, Math.max(0, daysPassed));
  const MAX_BLUR = 20;
  const layersLeft = Math.max(0, totalLayers - layersRemoved);
  const blurAmount = totalLayers > 0 ? (MAX_BLUR * layersLeft) / totalLayers : 0;

  if (isUnlocked) return null;

  const blocks = [
    { label: "Din", value: timeLeft.days, emoji: "📅" },
    { label: "Ghante", value: timeLeft.hours, emoji: "⏰" },
    { label: "Minute", value: timeLeft.minutes, emoji: "⏳" },
    { label: "Second", value: timeLeft.seconds, emoji: "💫" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 50%, hsl(340 72% 52% / 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, hsl(40 85% 55% / 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, hsl(340 80% 65% / 0.1) 0%, transparent 50%), hsl(var(--background))",
            "radial-gradient(ellipse at 60% 30%, hsl(340 72% 52% / 0.18) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, hsl(40 85% 55% / 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, hsl(340 80% 65% / 0.12) 0%, transparent 50%), hsl(var(--background))",
            "radial-gradient(ellipse at 40% 60%, hsl(340 72% 52% / 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 40%, hsl(40 85% 55% / 0.1) 0%, transparent 50%), radial-gradient(ellipse at 20% 30%, hsl(340 80% 65% / 0.15) 0%, transparent 50%), hsl(var(--background))",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Sparkle dots (positions memoized) */}
      {sparkles.map((s, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background:
              s.colorIdx === 0
                ? "hsl(var(--gold))"
                : s.colorIdx === 1
                ? "hsl(var(--rose-glow))"
                : "hsl(var(--primary))",
          }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Floating emoji particles */}
      {emojiParticles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.15, 0.5, 0.15], rotate: [0, 10, -10, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        >
          {p.emoji}
        </motion.span>
      ))}

      {/* Khushi's photo - blurred, clears as days pass */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="mb-3 relative"
      >
        <motion.div
          className="absolute -inset-3 rounded-full -z-10"
          style={{
            background: "conic-gradient(from 0deg, hsl(var(--primary) / 0.4), hsl(var(--gold) / 0.4), hsl(var(--rose-glow) / 0.4), hsl(var(--primary) / 0.4))",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-3 rounded-full blur-xl -z-20"
          style={{ background: "hsl(var(--primary) / 0.25)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-[3px] border-primary/50 shadow-2xl transition-all duration-1000"
          style={{ filter: `blur(${blurAmount}px)` }}
        >
          <img
            src="/photos/khushi-1.jpeg"
            alt="Khushi"
            className="w-full h-full object-cover"
          />
        </div>
        {blurAmount > 5 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-5xl drop-shadow-lg">🔒</span>
          </motion.div>
        )}
      </motion.div>

      {/* Layer reveal — segmented progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-64 sm:w-80 mb-5"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            🧊 Blur Layers
          </span>
          <span className="text-[11px] font-bold text-primary">
            {layersRemoved}/{totalLayers}
          </span>
        </div>

        {/* Segmented bar — one segment per day */}
        <div className="flex gap-[2px] h-2.5 rounded-full overflow-hidden bg-muted/40 p-[2px]">
          {Array.from({ length: Math.min(totalLayers, 60) }).map((_, i) => {
            const scaled = Math.floor((i / Math.min(totalLayers, 60)) * totalLayers);
            const revealed = scaled < layersRemoved;
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-full"
                initial={false}
                animate={{
                  background: revealed
                    ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold)))"
                    : "hsl(var(--muted-foreground) / 0.18)",
                  opacity: revealed ? 1 : 0.6,
                }}
                transition={{ duration: 0.4, delay: i * 0.01 }}
              />
            );
          })}
        </div>

        {/* Today's smooth progress ring/bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-medium text-muted-foreground/80">⏳ Aaj ka din</span>
            <span className="text-[10px] font-bold text-primary tabular-nums">
              {dailyProgress.toFixed(2)}%
            </span>
          </div>
          <div className="relative h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-linear"
              style={{
                width: `${dailyProgress}%`,
                background:
                  "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--rose-glow)), hsl(var(--gold)))",
                boxShadow: "0 0 12px hsl(var(--primary) / 0.6)",
              }}
            />
            <motion.div
              className="absolute inset-y-0 w-8 rounded-full pointer-events-none"
              style={{
                left: `calc(${dailyProgress}% - 16px)`,
                background:
                  "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.9), transparent)",
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
          Har din ek layer hategi — slowly slowly clear ho rha hai ✨
        </p>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 text-center sparkle-text"
      >
        Surprise Abhi Lock Hai! 🎂
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-sm mb-6 text-center"
      >
        10 July 2026 ko khulega yeh surprise 💖
      </motion.p>

      {/* Countdown blocks */}
      <div className="flex gap-3 sm:gap-4">
        {blocks.map((block, i) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="w-[4.2rem] h-[4.2rem] sm:w-[5.2rem] sm:h-[5.2rem] rounded-2xl flex flex-col items-center justify-center shadow-lg border border-primary/20 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--rose-glow)))",
              }}
              whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{ background: "linear-gradient(45deg, transparent 30%, hsl(var(--gold) / 0.5) 50%, transparent 70%)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              />
              <span className="text-2xl sm:text-3xl font-bold text-primary-foreground font-display relative z-10 leading-none tabular-nums">
                {String(block.value).padStart(2, "0")}
              </span>
              <span className="text-[9px] text-primary-foreground/60 relative z-10 mt-0.5">{block.emoji}</span>
            </motion.div>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">{block.label}</p>
          </motion.div>
        ))}
        {/* Milliseconds ticker — adds realism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="flex flex-col items-center"
        >
          <div
            className="w-[4.2rem] h-[4.2rem] sm:w-[5.2rem] sm:h-[5.2rem] rounded-2xl flex flex-col items-center justify-center shadow-lg border border-primary/20 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--rose-glow)))" }}
          >
            <span className="text-2xl sm:text-3xl font-bold text-primary-foreground font-display relative z-10 leading-none tabular-nums">
              {String(timeLeft.ms).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-primary-foreground/60 relative z-10 mt-0.5">⚡</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 font-medium">ms</p>
        </motion.div>
      </div>

      {/* Motivational text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-muted-foreground/60 text-xs mt-6 text-center max-w-xs"
      >
        {daysRemaining > 30
          ? "✨ Thoda sabar karo, kuch khaas aane wala hai ✨"
          : daysRemaining > 7
          ? "🌟 Bas kuch din aur... excitement badh rhi hai!"
          : daysRemaining > 1
          ? "🔥 Almost there! Countdown tez ho rha hai..."
          : "💖 Kal hai woh din! Ready ho jao! 🎉"}
      </motion.p>

      {/* Credit */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-8 text-center"
      >
        <p className="text-[10px] text-muted-foreground/40">
          made with 💖 by
        </p>
        <p className="text-[11px] font-display font-semibold text-muted-foreground/50 tracking-wide">
          Sumit urf Tera Sanki 😎
        </p>
      </motion.div>
    </div>
  );
};

export default CountdownScreen;