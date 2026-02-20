import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface HeartTreeProps {
  onComplete?: () => void;
}

const HeartTree = ({ onComplete }: HeartTreeProps) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2200),
      setTimeout(() => setStage(3), 3200),
      setTimeout(() => {
        setStage(4);
        onComplete?.();
      }, 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Pre-compute random values so they don't change on re-render
  const grassData = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    left: `${i * 3.3 + Math.random() * 2}%`,
    height: 6 + Math.random() * 16,
  })), []);

  const leafClusterPositions = useMemo(() => [
    // Top canopy clusters (heart-shaped arrangement)
    { cx: 0, cy: -155, r: 38 },
    { cx: -28, cy: -140, r: 30 },
    { cx: 28, cy: -140, r: 30 },
    { cx: -18, cy: -165, r: 26 },
    { cx: 18, cy: -165, r: 26 },
    { cx: -38, cy: -125, r: 24 },
    { cx: 38, cy: -125, r: 24 },
    { cx: 0, cy: -175, r: 22 },
    // Side canopy
    { cx: -50, cy: -105, r: 20 },
    { cx: 50, cy: -105, r: 20 },
    { cx: -30, cy: -115, r: 22 },
    { cx: 30, cy: -115, r: 22 },
  ], []);

  const petalData = useMemo(() => Array.from({ length: 30 }).map(() => ({
    x: (Math.random() - 0.5) * 280,
    y: -(Math.random() * 180 + 20),
    w: 5 + Math.random() * 7,
    rot: Math.random() * 360,
    colorIdx: Math.floor(Math.random() * 4),
  })), []);

  const sparkleData = useMemo(() => Array.from({ length: 10 }).map(() => ({
    left: `${15 + Math.random() * 70}%`,
    bottom: 60 + Math.random() * 160,
  })), []);

  const flowers = ["🌸", "🌺", "🌹", "🌷", "🌼", "🌻"];
  const flowerPos = useMemo(() => [
    { b: 30, l: -55 }, { b: 25, l: 50 }, { b: 35, l: -35 },
    { b: 28, l: 35 }, { b: 32, l: -65 }, { b: 22, l: 60 },
  ], []);

  const butterflies = ["🦋", "🦋"];

  return (
    <div className="relative w-72 h-[340px] mx-auto flex items-end justify-center">
      {/* Sky gradient background */}
      <div className="absolute inset-0 rounded-xl overflow-hidden opacity-30"
        style={{ background: "linear-gradient(to bottom, hsl(200 60% 85%), hsl(120 30% 85%) 70%, hsl(100 40% 75%))" }}
      />

      {/* Ground / soil */}
      <div className="absolute bottom-0 left-0 right-0 h-10 rounded-b-xl overflow-hidden">
        <div className="w-full h-full" style={{ background: "linear-gradient(to bottom, hsl(100 35% 55%), hsl(100 30% 45%))" }} />
      </div>

      {/* Grass blades */}
      <div className="absolute bottom-[8px] left-0 right-0 h-8 overflow-hidden z-[2]">
        {grassData.map((g, i) => (
          <motion.div
            key={`g-${i}`}
            className="absolute bottom-0 rounded-t-full"
            style={{
              left: g.left,
              height: g.height,
              width: i % 3 === 0 ? 3 : 2,
              background: i % 2 === 0 ? "hsl(120 45% 38%)" : "hsl(110 40% 45%)",
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3 + i * 0.02, duration: 0.3 }}
          />
        ))}
      </div>

      {/* Small ground flowers */}
      {stage >= 2 && flowerPos.map((fp, i) => (
        <motion.span
          key={`gf-${i}`}
          className="absolute text-sm z-[3]"
          style={{ bottom: fp.b, left: `calc(50% + ${fp.l}px)` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.5 + i * 0.1, duration: 0.4, type: "spring" }}
        >
          {flowers[i]}
        </motion.span>
      ))}

      {/* Roots */}
      {[
        { x: -12, rot: -25, h: 18, w: 3 },
        { x: -4, rot: -8, h: 14, w: 2.5 },
        { x: 4, rot: 8, h: 14, w: 2.5 },
        { x: 12, rot: 25, h: 18, w: 3 },
      ].map((r, i) => (
        <motion.div
          key={`root-${i}`}
          className="absolute rounded-b-full z-[1]"
          style={{
            bottom: 8,
            left: `calc(50% + ${r.x}px)`,
            width: r.w,
            transform: `rotate(${r.rot}deg)`,
            transformOrigin: "top center",
            background: "hsl(25 35% 28%)",
          }}
          initial={{ height: 0 }}
          animate={{ height: r.h }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
        />
      ))}

      {/* Trunk - realistic with gradient and knots */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 rounded-t-lg overflow-hidden z-[1]"
        style={{
          bottom: 18,
          width: 18,
          background: "linear-gradient(90deg, hsl(25 35% 22%), hsl(25 40% 30%) 30%, hsl(25 38% 28%) 60%, hsl(25 35% 24%))",
        }}
        initial={{ height: 0 }}
        animate={{ height: 140 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Bark texture */}
        {[15, 30, 48, 65, 82, 100, 115].map(t => (
          <div key={t} className="absolute w-full" style={{ top: t, height: 1, background: "hsl(25 30% 18% / 0.3)" }} />
        ))}
        {/* Knot */}
        <div className="absolute w-3 h-3 rounded-full" style={{ top: 55, left: 4, background: "hsl(25 30% 20%)", opacity: 0.4 }} />
        <div className="absolute w-2 h-2 rounded-full" style={{ top: 90, left: 8, background: "hsl(25 30% 20%)", opacity: 0.3 }} />
      </motion.div>

      {/* Branches */}
      {stage >= 1 && (
        <>
          {[
            { bottom: 120, ml: -16, rot: 30, h: 50, w: 8, delay: 0 },
            { bottom: 120, ml: 8, rot: -30, h: 50, w: 8, delay: 0.1 },
            { bottom: 100, ml: -28, rot: 48, h: 35, w: 6, delay: 0.2 },
            { bottom: 100, ml: 22, rot: -48, h: 35, w: 6, delay: 0.28 },
            { bottom: 85, ml: -18, rot: 38, h: 25, w: 5, delay: 0.38 },
            { bottom: 85, ml: 14, rot: -38, h: 25, w: 5, delay: 0.44 },
            { bottom: 70, ml: -24, rot: 55, h: 20, w: 4, delay: 0.5 },
            { bottom: 70, ml: 20, rot: -55, h: 20, w: 4, delay: 0.55 },
          ].map((b, i) => (
            <motion.div
              key={`br-${i}`}
              className="absolute left-1/2 origin-bottom rounded z-[1]"
              style={{
                bottom: b.bottom,
                marginLeft: b.ml,
                transform: `rotate(${b.rot}deg)`,
                width: b.w,
                background: "linear-gradient(to top, hsl(25 35% 26%), hsl(25 30% 32%))",
              }}
              initial={{ height: 0 }}
              animate={{ height: b.h }}
              transition={{ duration: 0.5, delay: b.delay }}
            />
          ))}
        </>
      )}

      {/* Leaf canopy clusters (heart-shaped) */}
      {stage >= 2 && leafClusterPositions.map((lc, i) => (
        <motion.div
          key={`canopy-${i}`}
          className="absolute left-1/2 rounded-full z-[2]"
          style={{
            bottom: -lc.cy,
            marginLeft: lc.cx - lc.r,
            width: lc.r * 2,
            height: lc.r * 2,
            background: `radial-gradient(ellipse, hsl(${120 + i * 5} ${45 + i * 2}% ${42 + i * 2}%), hsl(${115 + i * 3} ${40 + i}% ${35 + i}%))`,
            boxShadow: "inset -4px -4px 8px hsl(120 30% 25% / 0.3), inset 4px 4px 8px hsl(120 50% 55% / 0.2)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.95 }}
          transition={{ delay: 2 + i * 0.08, duration: 0.5, type: "spring", bounce: 0.3 }}
        />
      ))}

      {/* Heart on top */}
      {stage >= 2 && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-[3]"
          style={{ bottom: 195 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.8, type: "spring", bounce: 0.5 }}
        >
          <span className="text-5xl block relative drop-shadow-lg">
            💖
            <motion.span
              className="absolute inset-0 text-5xl blur-sm"
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              💖
            </motion.span>
          </span>
        </motion.div>
      )}

      {/* Cherry blossom petals falling */}
      {stage >= 3 && petalData.map((p, i) => {
        const colors = [
          "hsl(340 75% 70%)", "hsl(340 60% 80%)", "hsl(350 70% 75%)", "hsl(330 65% 78%)"
        ];
        return (
          <motion.div
            key={`petal-${i}`}
            className="absolute left-1/2 rounded-full z-[4]"
            style={{
              bottom: 180,
              width: p.w,
              height: p.w * 0.7,
              backgroundColor: colors[p.colorIdx],
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [0, 1.2, 0.6],
              opacity: [0, 0.9, 0],
              rotate: p.rot,
            }}
            transition={{ duration: 2.5, delay: i * 0.04, ease: "easeOut" }}
          />
        );
      })}

      {/* Butterflies */}
      {stage >= 4 && butterflies.map((b, i) => (
        <motion.span
          key={`butterfly-${i}`}
          className="absolute text-lg z-[5]"
          style={{ bottom: 160 + i * 40, left: `calc(50% + ${i === 0 ? -60 : 50}px)` }}
          animate={{
            x: [0, i === 0 ? 20 : -20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {b}
        </motion.span>
      ))}

      {/* Bird */}
      {stage >= 4 && (
        <motion.span
          className="absolute text-sm z-[5]"
          style={{ bottom: 220, left: "calc(50% + 35px)" }}
          animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🐦
        </motion.span>
      )}

      {/* Floating sparkles */}
      {stage >= 4 && sparkleData.map((s, i) => (
        <motion.div
          key={`sp-${i}`}
          className="absolute text-xs z-[5]"
          style={{ left: s.left, bottom: s.bottom }}
          animate={{ y: [0, -12, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.25 }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

export default HeartTree;
