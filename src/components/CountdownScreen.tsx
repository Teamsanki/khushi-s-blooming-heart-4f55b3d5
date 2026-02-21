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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Floating particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 4) * 20}%` }}
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        >
          {["🎂", "🎈", "🎉", "💖", "✨", "🌸", "🎁", "👑"][i % 8]}
        </motion.span>
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-7xl mb-6"
      >
        🔒
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 text-center"
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
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg border border-primary/20">
              <motion.span
                key={block.value}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl sm:text-3xl font-bold text-primary-foreground font-display"
              >
                {String(block.value).padStart(2, "0")}
              </motion.span>
            </div>
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
