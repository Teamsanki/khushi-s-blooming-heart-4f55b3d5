import { useState, useRef, useMemo, useCallback } from "react";
import EmojiGame from "@/components/EmojiGame";
import MemoryGame from "@/components/MemoryGame";
import BirthdayCard from "@/components/BirthdayCard";
import SplashScreen from "@/components/SplashScreen";
import CountdownScreen from "@/components/CountdownScreen";
import EndingScreen from "@/components/EndingScreen";

type Phase = "splash" | "countdown" | "game" | "card" | "ending";

const TARGET_DATE = new Date("2026-07-10T00:00:00");

const Index = () => {
  const [phase, setPhase] = useState<Phase>("splash");
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const gameType = useMemo(() => (Math.random() < 0.5 ? "emoji" : "memory"), []);

  const handleCountdownUnlock = useCallback(() => {
    setPhase("game");
  }, []);

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
      {phase === "splash" && (
        <SplashScreen onComplete={() => setPhase("countdown")} />
      )}

      {phase === "countdown" && (
        <CountdownScreen targetDate={TARGET_DATE} onUnlock={handleCountdownUnlock} />
      )}

      {phase === "game" && (
        gameType === "emoji" ? (
          <EmojiGame onComplete={() => setPhase("card")} />
        ) : (
          <MemoryGame onComplete={() => setPhase("card")} />
        )
      )}

      {phase === "card" && (
        <BirthdayCard onComplete={() => setPhase("ending")} />
      )}

      {phase === "ending" && <EndingScreen />}

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
