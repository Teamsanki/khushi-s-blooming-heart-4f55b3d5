import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownScreenProps {
  targetDate: Date;
  onUnlock: () => void;
}

const CountdownScreen = ({ targetDate, onUnlock }: CountdownScreenProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const check = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const diff = target - now;

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

  if (isUnlocked) return null;

  const blocks = [
    { label: "Din", value: timeLeft.days },
    { label: "Ghante", value: timeLeft.hours },
    { label: "Minute", value: timeLeft.minutes },
    { label: "Second", value: timeLeft.seconds },
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

      {/* Lock icon with glow */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-7xl mb-6 relative"
      >
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl -z-10"
          style={{ background: "hsl(var(--primary) / 0.3)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        🔒
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
        className="text-muted-foreground text-sm mb-8 text-center"
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
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20 relative overflow-hidden"
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
                className="text-2xl sm:text-3xl font-bold text-primary-foreground font-display relative z-10"
              >
                {String(block.value).padStart(2, "0")}
              </motion.span>
            </motion.div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">{block.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-muted-foreground/60 text-xs mt-10 text-center"
      >
        ✨ Thoda sabar karo, kuch khaas aane wala hai ✨
      </motion.p>

      {/* Skip button - only in development */}
      {import.meta.env.DEV && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          whileHover={{ opacity: 1 }}
          onClick={() => { setIsUnlocked(true); onUnlock(); }}
          className="fixed bottom-4 left-4 text-[10px] text-muted-foreground border border-muted-foreground/20 rounded-full px-3 py-1 hover:bg-muted transition-colors z-50"
        >
          Skip (Testing)
        </motion.button>
      )}
    </div>
  );
};

export default CountdownScreen;
