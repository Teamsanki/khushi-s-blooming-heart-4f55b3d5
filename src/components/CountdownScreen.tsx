import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface CountdownScreenProps {
  targetDate: Date;
  onUnlock: () => void;
}

const LAUNCH_DATE = new Date("2025-06-23T00:00:00");

const CountdownScreen = ({ targetDate, onUnlock }: CountdownScreenProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [now, setNow] = useState(Date.now());

  const totalDays = useMemo(() => {
    return Math.ceil((targetDate.getTime() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24));
  }, [targetDate]);

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
      });
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onUnlock]);

  // Days passed since launch
  const daysPassed = Math.floor((now - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = timeLeft.days;

  // Daily progress: 24-hour cycle progress (0–100)
  const msInDay = 24 * 60 * 60 * 1000;
  const todayStart = new Date(new Date(now).setHours(0, 0, 0, 0)).getTime();
  const elapsedToday = now - todayStart;
  const dailyProgress = Math.min(100, Math.max(0, (elapsedToday / msInDay) * 100));

  // Blur: each day removes one layer. Total layers = totalDays
  // Blur starts at 20px, each day removes (20/totalDays)px
  const blurPerDay = totalDays > 0 ? 20 / totalDays : 0;
  const blurAmount = Math.max(0, 20 - daysPassed * blurPerDay - (dailyProgress / 100) * blurPerDay);

  // How many layers removed
  const layersRemoved = daysPassed;
  const totalLayers = totalDays;

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

      {/* Sparkle dots */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            background: i % 3 === 0
              ? "hsl(var(--gold))"
              : i % 3 === 1
              ? "hsl(var(--rose-glow))"
              : "hsl(var(--primary))",
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating emoji particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 4) * 20}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.15, 0.5, 0.15], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        >
          {["🎂", "🎈", "🎉", "💖", "✨", "🌸", "🎁", "👑"][i % 8]}
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

      {/* Blur layers info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[11px] text-muted-foreground/80 text-center mb-3"
      >
        🧊 Har din ek blur layer hategi — <span className="text-primary font-semibold">{layersRemoved}/{totalLayers}</span> layers hatt chuki hain
      </motion.p>

      {/* Daily progress bar — resets every 24h */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-60 sm:w-72 mb-5"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-medium text-muted-foreground">⏳ Aaj ka Progress</span>
          <span className="text-[11px] font-bold text-primary">{dailyProgress.toFixed(1)}%</span>
        </div>
        <div className="relative">
          <Progress value={dailyProgress} className="h-3 bg-muted/60" />
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full opacity-30"
            style={{
              width: `${dailyProgress}%`,
              background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))",
            }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center mt-1">
          Din poora hone pe ek aur layer hategi ✨
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
              <motion.span
                key={block.value}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl sm:text-3xl font-bold text-primary-foreground font-display relative z-10 leading-none"
              >
                {String(block.value).padStart(2, "0")}
              </motion.span>
              <span className="text-[9px] text-primary-foreground/60 relative z-10 mt-0.5">{block.emoji}</span>
            </motion.div>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">{block.label}</p>
          </motion.div>
        ))}
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