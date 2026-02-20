import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShowText(true);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !done) {
      setDone(true);
      setTimeout(onComplete, 800);
    }
  }, [progress, done, onComplete]);

  const emojis = ["🎂", "🎈", "🎉", "💖", "🌸", "✨", "🎁", "👑", "🦋", "💎"];

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Floating emojis */}
          {emojis.map((e, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${10 + (i * 8)}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              {e}
            </motion.span>
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 1 }}
            className="text-8xl mb-6"
          >
            🎂
          </motion.div>

          {showText && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-display font-bold text-foreground mb-2"
            >
              Loading Surprise...
            </motion.h1>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-sm mb-8"
          >
            Khushi ke liye kuch khaas aa raha hai ✨
          </motion.p>

          {/* Progress bar */}
          <div className="w-64 h-3 bg-muted rounded-full overflow-hidden border border-border">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-muted-foreground text-xs mt-3"
          >
            {progress}% ready
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
