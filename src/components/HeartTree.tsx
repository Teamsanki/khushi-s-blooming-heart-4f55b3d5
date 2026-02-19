import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HeartTreeProps {
  onComplete?: () => void;
}

const HeartTree = ({ onComplete }: HeartTreeProps) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1000),
      setTimeout(() => setStage(2), 1800),
      setTimeout(() => setStage(3), 2800),
      setTimeout(() => {
        setStage(4);
        onComplete?.();
      }, 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const leaves = ["🍃", "🌿", "☘️", "🍀"];
  const flowers = ["🌸", "🌺", "🌹", "🌷", "💐", "🌼", "🌻", "🏵️"];
  const flowerPositions = [
    { bottom: 100, left: -40 },
    { bottom: 118, left: 32 },
    { bottom: 88, left: -28 },
    { bottom: 132, left: 18 },
    { bottom: 105, left: -52 },
    { bottom: 128, left: 44 },
    { bottom: 92, left: -12 },
    { bottom: 122, left: -38 },
  ];

  return (
    <div className="relative w-72 h-80 mx-auto flex items-end justify-center">
      {/* Grass */}
      <div className="absolute bottom-0 left-0 right-0 h-6 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`grass-${i}`}
            className="absolute bottom-0 w-1 bg-success rounded-t-full"
            style={{ left: `${i * 5 + Math.random() * 3}%`, height: 8 + Math.random() * 12 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.5 + i * 0.03, duration: 0.3 }}
          />
        ))}
      </div>

      {/* Ground shadow */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-44 h-4 bg-success/15 rounded-full blur-md" />

      {/* Roots */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {[-15, 0, 15].map((x, i) => (
          <motion.div
            key={`root-${i}`}
            className="absolute w-1 h-4 bg-tree-trunk/60 rounded-b-full"
            style={{ left: x, bottom: -3, transform: `rotate(${x}deg)` }}
            initial={{ height: 0 }}
            animate={{ height: 12 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
          />
        ))}
      </motion.div>

      {/* Trunk - thicker, textured */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 rounded-t-md overflow-hidden"
        style={{ background: "linear-gradient(90deg, hsl(25 40% 25%), hsl(25 40% 30%), hsl(25 40% 25%))" }}
        initial={{ height: 0 }}
        animate={{ height: 120 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Bark texture lines */}
        {[20, 40, 60, 80].map(top => (
          <div key={top} className="absolute w-full h-px bg-tree-trunk/30" style={{ top }} />
        ))}
      </motion.div>

      {/* Main branches */}
      {stage >= 1 && (
        <>
          {[
            { bottom: 90, ml: -20, rot: 35, h: 40, w: 2.5, delay: 0 },
            { bottom: 90, ml: 12, rot: -35, h: 40, w: 2.5, delay: 0.12 },
            { bottom: 70, ml: -30, rot: 50, h: 28, w: 2, delay: 0.25 },
            { bottom: 70, ml: 24, rot: -50, h: 28, w: 2, delay: 0.35 },
            { bottom: 55, ml: -22, rot: 40, h: 20, w: 1.5, delay: 0.45 },
            { bottom: 55, ml: 18, rot: -40, h: 20, w: 1.5, delay: 0.5 },
          ].map((b, i) => (
            <motion.div
              key={`branch-${i}`}
              className="absolute left-1/2 origin-bottom rounded bg-tree-branch"
              style={{ bottom: b.bottom, marginLeft: b.ml, transform: `rotate(${b.rot}deg)`, width: b.w * 4 }}
              initial={{ height: 0 }}
              animate={{ height: b.h }}
              transition={{ duration: 0.4, delay: b.delay }}
            />
          ))}

          {/* Small leaves on branches */}
          {leaves.map((leaf, i) => (
            <motion.span
              key={`leaf-${i}`}
              className="absolute text-xs"
              style={{
                bottom: 80 + i * 12,
                left: `calc(50% + ${(i % 2 === 0 ? -1 : 1) * (35 + i * 5)}px)`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.3, type: "spring" }}
            >
              {leaf}
            </motion.span>
          ))}
        </>
      )}

      {/* Heart - bigger, with glow */}
      {stage >= 2 && (
        <motion.div
          className="absolute bottom-[105px] left-1/2 -translate-x-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.5 }}
        >
          <span className="text-7xl block relative">
            💖
            <motion.span
              className="absolute inset-0 text-7xl blur-sm opacity-50"
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💖
            </motion.span>
          </span>
        </motion.div>
      )}

      {/* Flowers around the tree */}
      {stage >= 2 &&
        flowers.map((flower, i) => (
          <motion.span
            key={`flower-${i}`}
            className="absolute text-lg"
            style={{
              bottom: flowerPositions[i].bottom,
              left: `calc(50% + ${flowerPositions[i].left}px)`,
            }}
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 2 + i * 0.08, duration: 0.4, type: "spring" }}
          >
            {flower}
          </motion.span>
        ))}

      {/* Petal burst - more particles, colorful */}
      {stage >= 3 &&
        Array.from({ length: 24 }).map((_, i) => {
          const colors = ["hsl(340 72% 52%)", "hsl(40 85% 55%)", "hsl(340 80% 65%)", "hsl(0 80% 70%)"];
          return (
            <motion.div
              key={`petal-${i}`}
              className="absolute left-1/2 bottom-[135px] rounded-full"
              style={{
                width: 6 + Math.random() * 6,
                height: 6 + Math.random() * 6,
                backgroundColor: colors[i % colors.length],
                opacity: 0.8,
              }}
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{
                x: (Math.random() - 0.5) * 260,
                y: -(Math.random() * 160 + 30),
                scale: [0, 1.3, 0.5],
                opacity: [0, 1, 0],
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 2, delay: i * 0.03, ease: "easeOut" }}
            />
          );
        })}

      {/* Floating sparkles after complete */}
      {stage >= 4 &&
        Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute text-xs"
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: 80 + Math.random() * 120,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            ✨
          </motion.div>
        ))}
    </div>
  );
};

export default HeartTree;
