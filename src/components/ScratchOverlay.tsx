import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScratchOverlayProps {
  children: React.ReactNode;
  onRevealed?: () => void;
  threshold?: number; // 0..1, default 0.55
  hint?: string;
}

/**
 * Scratch-card overlay. Wraps children and shows a silver/pastel coating
 * the user must scratch with finger/mouse. At `threshold` erased, the
 * remaining coating fades out and `onRevealed` fires.
 */
const ScratchOverlay = ({
  children,
  onRevealed,
  threshold = 0.55,
  hint = "✨ Scratch karo ✨",
}: ScratchOverlayProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const sampleCounter = useRef(0);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(false);

  const paintCoating = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Gradient coating
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, "#d8c5d8");
    g.addColorStop(0.45, "#b9a7c4");
    g.addColorStop(1, "#8e8aa8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
    // Sparkle dots
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.6 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Hint text
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 18px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hint, rect.width / 2, rect.height / 2);
    ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("ungli se rgdo 👆", rect.width / 2, rect.height / 2 + 22);
  }, [hint]);

  useEffect(() => {
    paintCoating();
    const onResize = () => {
      if (revealedRef.current) return;
      paintCoating();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paintCoating]);

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Sample at low res for perf
    const stepX = Math.max(1, Math.floor(canvas.width / 40));
    const stepY = Math.max(1, Math.floor(canvas.height / 60));
    let cleared = 0;
    let total = 0;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let y = 0; y < canvas.height; y += stepY) {
      for (let x = 0; x < canvas.width; x += stepX) {
        const i = (y * canvas.width + x) * 4 + 3;
        if (data[i] < 32) cleared++;
        total++;
      }
    }
    if (cleared / total >= threshold) {
      revealedRef.current = true;
      setBurst(true);
      // Soft chime
      try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AC) {
          const ac = new AC();
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(880, ac.currentTime);
          o.frequency.exponentialRampToValueAtTime(1760, ac.currentTime + 0.25);
          g.gain.setValueAtTime(0.15, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.4);
          o.connect(g).connect(ac.destination);
          o.start();
          o.stop(ac.currentTime + 0.42);
        }
      } catch {}
      if (navigator.vibrate) navigator.vibrate(30);
      setTimeout(() => {
        setRevealed(true);
        onRevealed?.();
      }, 260);
    }
  }, [threshold, onRevealed]);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || revealedRef.current) return;
    const rect = wrap.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    const last = lastPt.current;
    ctx.lineWidth = 56;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (last) {
      ctx.moveTo(last.x, last.y);
    } else {
      ctx.moveTo(x - 0.01, y - 0.01);
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    lastPt.current = { x, y };
    sampleCounter.current++;
    if (sampleCounter.current % 6 === 0) checkProgress();
  };

  const startPointer = (e: React.PointerEvent) => {
    if (revealedRef.current) return;
    drawing.current = true;
    lastPt.current = null;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  };
  const movePointer = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    scratchAt(e.clientX, e.clientY);
  };
  const endPointer = () => {
    drawing.current = false;
    lastPt.current = null;
    checkProgress();
  };

  return (
    <div ref={wrapRef} className="relative w-full h-full">
      {children}
      <AnimatePresence>
        {!revealed && (
          <motion.div
            className="absolute inset-0 rounded-xl overflow-hidden touch-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ cursor: "grab" }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full select-none"
              onPointerDown={startPointer}
              onPointerMove={movePointer}
              onPointerUp={endPointer}
              onPointerCancel={endPointer}
              onPointerLeave={endPointer}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle burst on reveal */}
      <AnimatePresence>
        {burst && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 22 }).map((_, i) => {
              const angle = (i / 22) * Math.PI * 2;
              const dist = 60 + Math.random() * 120;
              return (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: i % 2 ? "hsl(var(--primary))" : "hsl(var(--accent))",
                    boxShadow: "0 0 12px currentColor",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 0.2,
                  }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  onAnimationComplete={() => i === 0 && setBurst(false)}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScratchOverlay;