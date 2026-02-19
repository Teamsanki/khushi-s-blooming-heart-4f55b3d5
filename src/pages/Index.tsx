import { useState, useRef, useMemo } from "react";
import EmojiGame from "@/components/EmojiGame";
import MemoryGame from "@/components/MemoryGame";
import BirthdayCard from "@/components/BirthdayCard";

const Index = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const gameType = useMemo(() => (Math.random() < 0.5 ? "emoji" : "memory"), []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setPlaying(!playing);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {!unlocked ? (
        gameType === "emoji" ? (
          <EmojiGame onComplete={() => setUnlocked(true)} />
        ) : (
          <MemoryGame onComplete={() => setUnlocked(true)} />
        )
      ) : (
        <BirthdayCard />
      )}

      <audio ref={audioRef} src="/birthday-music.mp3" loop />
      <button
        onClick={toggleMusic}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform text-xl"
        aria-label="Toggle music"
      >
        {playing ? "🔊" : "🔇"}
      </button>
    </div>
  );
};

export default Index;
