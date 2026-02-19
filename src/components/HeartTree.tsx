import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HeartTreeProps {
  onComplete?: () => void;
}

const HeartTree = ({ onComplete }: HeartTreeProps) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3000),
      setTimeout(() => {
        setStage(4);
        onComplete?.();
      }, 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const flowers = ["🌸", "🌺", "🌹", "🌷", "💐", "🌼", "🌻", "🏵️"];
  const flowerPositions = [
    { bottom: 100, left: -40 },
    { bottom: 115, left: 30 },
    { bottom: 90, left: -25 },
    { bottom: 130, left: 15 },
    { bottom: 105, left: -50 },
    { bottom: 125, left: 40 },
    { bottom: 95, left: -10 },
    { bottom: 120, left: -35 },
  ];

  return (
    <div className="relative w-64 h-80 mx-auto flex items-end justify-center">
      {/* Ground shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-3 bg-success/20 rounded-full blur-sm" />

      {/* Trunk */}
      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 rounded-t-sm bg-tree-trunk"
        initial={{ height: 0 }}
        animate={{ height: 110 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Branches */}
      {stage >= 1 && (
        <>
          <motion.div
            className="absolute bottom-[85px] left-1/2 w-2 origin-bottom rounded bg-tree-branch"
            style={{ marginLeft: "-18px", transform: "rotate(35deg)" }}
            initial={{ height: 0 }}
            animate={{ height: 35 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="absolute bottom-[85px] left-1/2 w-2 origin-bottom rounded bg-tree-branch"
            style={{ marginLeft: "10px", transform: "rotate(-35deg)" }}
            initial={{ height: 0 }}
            animate={{ height: 35 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          />
          <motion.div
            className="absolute bottom-[65px] left-1/2 w-1.5 origin-bottom rounded bg-tree-branch"
            style={{ marginLeft: "-28px", transform: "rotate(50deg)" }}
            initial={{ height: 0 }}
            animate={{ height: 22 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          />
          <motion.div
            className="absolute bottom-[65px] left-1/2 w-1.5 origin-bottom rounded bg-tree-branch"
            style={{ marginLeft: "22px", transform: "rotate(-50deg)" }}
            initial={{ height: 0 }}
            animate={{ height: 22 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          />
        </>
      )}

      {/* Heart */}
      {stage >= 2 && (
        <motion.div
          className="absolute bottom-[100px] left-1/2 -translate-x-1/2 text-7xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        >
          💖
        </motion.div>
      )}

      {/* Flowers */}
      {stage >= 2 &&
        flowers.map((flower, i) => (
          <motion.span
            key={`flower-${i}`}
            className="absolute text-base"
            style={{
              bottom: flowerPositions[i].bottom,
              left: `calc(50% + ${flowerPositions[i].left}px)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2 + i * 0.1, duration: 0.3, type: "spring" }}
          >
            {flower}
          </motion.span>
        ))}

      {/* Petal burst */}
      {stage >= 3 &&
        Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={`petal-${i}`}
            className="absolute left-1/2 bottom-[130px] w-2.5 h-2.5 rounded-full bg-primary"
            style={{ opacity: 0.7 + Math.random() * 0.3 }}
            initial={{ x: 0, y: 0, scale: 0 }}
            animate={{
              x: (Math.random() - 0.5) * 220,
              y: -(Math.random() * 140 + 40),
              scale: [0, 1.2, 0.6],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.8, delay: i * 0.04, ease: "easeOut" }}
          />
        ))}
    </div>
  );
};

export default HeartTree;
