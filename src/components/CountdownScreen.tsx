import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

interface CountdownScreenProps {
  targetDate: Date;
  onUnlock: () => void;
}

const LAUNCH_DATE = new Date("2025-06-23T00:00:00");

const CountdownScreen = ({ targetDate, onUnlock }: CountdownScreenProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);
  const holdRafRef = useRef<number | null>(null);

  const startHold = () => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / 1200);
      setHoldProgress(p);
      if (p < 1) holdRafRef.current = requestAnimationFrame(tick);
    };
    holdRafRef.current = requestAnimationFrame(tick);
    holdTimerRef.current = window.setTimeout(() => {
      setShowPwd(true);
      setPwd("");
      setPwdError(false);
      setHoldProgress(0);
    }, 1200);
  };
  const endHold = () => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (holdRafRef.current) { cancelAnimationFrame(holdRafRef.current); holdRafRef.current = null; }
    setHoldProgress(0);
  };

  const submitPwd = () => {
    if (pwd === "11211") {
      setIsUnlocked(true);
      onUnlock();
    } else {
      setPwdError(true);
      setTimeout(() => setPwdError(false), 1200);
    }
  };

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
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

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
      {/* Khushi's photo - blurred, clears as days pass */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="mb-10 relative"
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
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-1 ring-black/5 transition-all duration-1000"
          style={{ filter: `blur(${blurAmount}px)` }}
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onTouchCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
        >
          <img
            src="/photos/khushi-1.jpeg"
            alt="Khushi"
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />
        </div>
        {holdProgress > 0 && holdProgress < 1 && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth="2" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - holdProgress)}
              strokeLinecap="round" />
          </svg>
        )}
        {blurAmount > 5 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ pointerEvents: "none" }}
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
        className="w-full max-w-sm mb-10 space-y-6"
      >
        {/* Memory Reveal */}
        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
              Memory Reveal
            </span>
            <span className="text-[10px] font-bold tracking-widest text-primary tabular-nums">
              {totalLayers > 0 ? Math.round((layersRemoved / totalLayers) * 100) : 0}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden bg-primary/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--rose-glow)))",
                boxShadow: "0 0 8px hsl(var(--primary) / 0.5)",
              }}
              initial={false}
              animate={{ width: `${totalLayers > 0 ? (layersRemoved / totalLayers) * 100 : 0}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Today's Journey */}
        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--gold))]/90">
              Today's Journey
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[hsl(var(--gold))] tabular-nums">
              {dailyProgress.toFixed(2)}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden bg-[hsl(var(--gold))]/10">
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-linear"
              style={{
                width: `${dailyProgress}%`,
                background: "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--rose-glow)))",
                boxShadow: "0 0 8px hsl(var(--gold) / 0.5)",
              }}
            />
          </div>
          <p className="text-[11px] italic text-muted-foreground/70 font-medium pt-1">
            Har din ek layer hategi — slowly slowly clear ho rha hai ✨
          </p>
        </div>
      </motion.div>

      {/* Main Message */}
      <div className="space-y-4 mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-tight"
        >
          Surprise{" "}
          <span
            className="italic bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))",
            }}
          >
            Abhi Lock Hai!
          </span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block px-6 py-2 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm"
        >
          <p className="text-primary font-semibold text-xs sm:text-sm tracking-wide">
            10 July 2026 ko khulega yeh surprise ❤️
          </p>
        </motion.div>
      </div>

      {/* Countdown blocks */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 w-full mb-10">
        {blocks.map((block, i) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="group bg-white/40 dark:bg-white/5 backdrop-blur-lg border border-white/60 dark:border-white/10 p-4 md:p-6 rounded-3xl transition-all duration-300 hover:scale-105 hover:bg-white/60"
          >
            <div className="text-3xl md:text-4xl font-display font-bold text-foreground tabular-nums mb-1">
              {String(block.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
              {block.label}
            </div>
          </motion.div>
        ))}
        {/* Milliseconds ticker — adds realism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="col-span-3 md:col-span-1 p-4 md:p-6 rounded-3xl shadow-lg transition-all duration-300 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold)))",
            boxShadow: "0 10px 30px hsl(var(--primary) / 0.25)",
          }}
        >
          <div className="text-3xl md:text-4xl font-display font-bold text-primary-foreground tabular-nums mb-1">
            {String(timeLeft.ms).padStart(2, "0")}
          </div>
          <div className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest">
            ms
          </div>
        </motion.div>
      </div>

      {/* Motivational caption */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-3 text-muted-foreground/80 font-medium text-xs sm:text-sm"
      >
        <span className="h-px w-8 bg-primary/20" />
        <span>
          {daysRemaining > 30
            ? "Thoda sabar karo, kuch khaas aane wala hai"
            : daysRemaining > 7
            ? "Bas kuch din aur... excitement badh rhi hai"
            : daysRemaining > 1
            ? "Almost there! Countdown tez ho rha hai"
            : "Kal hai woh din! Ready ho jao"}
        </span>
        <span className="h-px w-8 bg-primary/20" />
      </motion.div>

      {/* Credit */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-12 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground/60">
          crafted with love by
        </span>
        <div className="flex items-center gap-2 text-xs font-display font-bold text-foreground/70 tracking-wider uppercase">
          Sumit urf Tera Sanki
          <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px]">😎</span>
        </div>
      </motion.footer>
      </div>

      {showPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPwd(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-card border border-border rounded-2xl p-6 shadow-2xl text-center"
          >
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="text-base font-display font-bold text-foreground mb-1">Secret Password</h3>
            <p className="text-xs text-muted-foreground mb-4">Sirf Sumit jaanta hai 😏</p>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitPwd()}
              placeholder="• • • • •"
              className={`w-full text-center text-lg tracking-[0.5em] px-4 py-3 rounded-xl bg-background border-2 outline-none transition-colors ${
                pwdError ? "border-destructive animate-pulse" : "border-border focus:border-primary"
              }`}
            />
            {pwdError && <p className="text-xs text-destructive mt-2">Galat password 😤</p>}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowPwd(false)}
                className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium"
              >Cancel</button>
              <button
                onClick={submitPwd}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >Unlock</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CountdownScreen;