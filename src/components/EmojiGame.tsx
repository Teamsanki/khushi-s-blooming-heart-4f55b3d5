import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const puzzles = [
  {
    emojis: "🎂 🎈 🎉",
    question: "Yeh kya celebration hai?",
    options: ["Shaadi", "Birthday Party", "Picnic", "Exam Result"],
    answer: 1,
  },
  {
    emojis: "👩‍🎓 📚 🏫",
    question: "Yeh jagah kaun si hai?",
    options: ["Hospital", "Office", "College", "Mall"],
    answer: 2,
  },
  {
    emojis: "👭 💕 🤗",
    question: "Yeh rishta kya kehlata hai?",
    options: ["Dushman", "Boss", "Teacher", "Behen"],
    answer: 3,
  },
  {
    emojis: "🌸 😊 ✨ 💖",
    question: "Inn emojis mein kaun chhupa hai?",
    options: ["Sadness", "Anger", "Fear", "Khushi"],
    answer: 3,
  },
  {
    emojis: "🎁 🎀 💝 🥳",
    question: "Aaj ka plan kya hai?",
    options: ["Homework Dena", "Daantna", "Surprise Gift", "Ignore Karna"],
    answer: 2,
  },
  {
    emojis: "👑 ⭐ 💎 🌟 🦋",
    question: "Khushi kaun hai?",
    options: ["Koi Nahi", "Stranger", "Villain", "Queen Junior Sis 👑"],
    answer: 3,
  },
];

interface EmojiGameProps {
  onComplete: () => void;
}

const EmojiGame = ({ onComplete }: EmojiGameProps) => {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const puzzle = puzzles[round];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);

    if (idx === puzzle.answer) {
      setIsCorrect(true);
      setTimeout(() => {
        if (round === puzzles.length - 1) {
          setShowComplete(true);
          setTimeout(onComplete, 1500);
        } else {
          setRound((r) => r + 1);
          setSelected(null);
          setIsCorrect(null);
        }
      }, 800);
    } else {
      setIsCorrect(false);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setSelected(null);
        setIsCorrect(null);
      }, 800);
    }
  };

  if (showComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-center"
        >
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-display font-bold text-foreground">Unlocked!</h2>
          <p className="text-muted-foreground mt-2">Surprise aa rha hai...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="bg-primary p-5 text-center">
          <h2 className="text-lg font-display font-bold text-primary-foreground">
            🔒 Surprise Unlock Karo!
          </h2>
          <div className="flex gap-1.5 justify-center mt-3">
            {puzzles.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 max-w-8 rounded-full transition-all duration-300 ${
                  i < round
                    ? "bg-accent"
                    : i === round
                    ? "bg-primary-foreground"
                    : "bg-primary-foreground/30"
                }`}
              />
            ))}
          </div>
          <p className="text-primary-foreground/70 text-xs mt-2">
            Round {round + 1} / {puzzles.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={round}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <div className="text-5xl sm:text-6xl mb-3 py-5 tracking-widest">
                {puzzle.emojis}
              </div>
              <p className="text-lg font-medium text-foreground mb-6">
                {puzzle.question}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {puzzle.options.map((option, i) => {
                  let btnClass =
                    "bg-secondary border-2 border-border text-secondary-foreground hover:border-primary";
                  if (selected === i) {
                    if (isCorrect)
                      btnClass =
                        "bg-success/10 border-2 border-success text-foreground";
                    else
                      btnClass =
                        "bg-destructive/10 border-2 border-destructive text-foreground";
                  }
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(i)}
                      className={`p-3.5 rounded-xl text-sm font-medium transition-all ${btnClass}`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default EmojiGame;
