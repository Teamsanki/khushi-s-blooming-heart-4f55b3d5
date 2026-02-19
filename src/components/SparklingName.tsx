import { motion } from "framer-motion";

const SparklingName = () => {
  const letters = "KHUSHI".split("");

  return (
    <div className="flex justify-center gap-1 sm:gap-2">
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, scale: 0, rotateZ: -15 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateZ: 0 }}
          transition={{
            delay: 0.5 + i * 0.18,
            duration: 0.6,
            type: "spring",
            bounce: 0.4,
          }}
          className="relative text-5xl sm:text-6xl font-display font-bold text-accent sparkle-text inline-block"
        >
          {letter}
          {/* Sparkle dots around each letter */}
          <motion.span
            className="absolute -top-2 -right-1 w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
          <motion.span
            className="absolute -bottom-1 -left-1 w-1 h-1 rounded-full bg-gold-glow"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 0.3 + i * 0.2,
            }}
          />
        </motion.span>
      ))}
    </div>
  );
};

export default SparklingName;
