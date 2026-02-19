import { useState, useRef } from "react";
import EmojiGame from "@/components/EmojiGame";
import BirthdayCard from "@/components/BirthdayCard";

const Index = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
        <EmojiGame onComplete={() => setUnlocked(true)} />
      ) : (
        <BirthdayCard />
      )}

      {/* Music Player */}
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
