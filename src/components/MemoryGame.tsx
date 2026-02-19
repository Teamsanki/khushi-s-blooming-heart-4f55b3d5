import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const allEmojis = ["🎂", "🎁", "🎈", "💖", "🌸", "👑", "⭐", "🦋", "🎀", "💎", "🌹", "🥳"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface MemoryGameProps {
  onComplete: () => void;
}

const MemoryGame = ({ onComplete }: MemoryGameProps) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const pairCount = 6;

  useEffect(() => {
    const picked = shuffle(allEmojis).slice(0, pairCount);
    const deck = shuffle([...picked, ...picked].map((emoji, i) => ({
      id: i,
      emoji,
      flipped: false,
      matched: false,
    })));
    setCards(deck);
  }, []);

  const handleFlip = useCallback((id: number) => {
    if (flippedIds.length >= 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(fid => newCards.find(c => c.id === fid)!);
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === a.id || c.id === b.id ? { ...c, matched: true } : c));
          setFlippedIds([]);
          const newMatched = matchedCount + 1;
          setMatchedCount(newMatched);
          if (newMatched === pairCount) {
            setShowComplete(true);
            setTimeout(onComplete, 1500);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c));
          setFlippedIds([]);
        }, 800);
      }
    }
  }, [cards, flippedIds, matchedCount, onComplete]);

  if (showComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-display font-bold text-foreground">Unlocked!</h2>
          <p className="text-muted-foreground mt-2">{moves} moves mein complete! Surprise aa rha hai...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
        <div className="bg-primary p-5 text-center">
          <h2 className="text-lg font-display font-bold text-primary-foreground">🧠 Memory Match Karo!</h2>
          <p className="text-primary-foreground/70 text-xs mt-2">Saare pairs dhundho to unlock hoga! • Moves: {moves}</p>
          <div className="flex gap-1.5 justify-center mt-3">
            {Array.from({ length: pairCount }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 max-w-8 rounded-full transition-all duration-300 ${i < matchedCount ? "bg-accent" : "bg-primary-foreground/30"}`} />
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2.5">
            {cards.map(card => (
              <motion.button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center font-bold transition-all border-2 ${
                  card.matched
                    ? "bg-success/10 border-success"
                    : card.flipped
                    ? "bg-secondary border-primary"
                    : "bg-muted border-border hover:border-primary/50"
                }`}
                whileTap={{ scale: 0.95 }}
                animate={card.matched ? { scale: [1, 1.15, 1] } : {}}
              >
                <AnimatePresence mode="wait">
                  {card.flipped || card.matched ? (
                    <motion.span key="emoji" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} exit={{ rotateY: 90 }} transition={{ duration: 0.2 }}>
                      {card.emoji}
                    </motion.span>
                  ) : (
                    <motion.span key="back" initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} exit={{ rotateY: -90 }} transition={{ duration: 0.2 }} className="text-muted-foreground/40">
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
