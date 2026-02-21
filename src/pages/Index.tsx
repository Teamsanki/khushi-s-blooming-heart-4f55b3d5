import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import EmojiGame from "@/components/EmojiGame";
import MemoryGame from "@/components/MemoryGame";
import BirthdayCard from "@/components/BirthdayCard";
import SplashScreen from "@/components/SplashScreen";
import CountdownScreen from "@/components/CountdownScreen";
import EndingScreen from "@/components/EndingScreen";

type Phase = "splash" | "countdown" | "game" | "card" | "ending";

const TARGET_DATE = new Date("2026-07-10T00:00:00");

const FADE_DURATION = 2000; // ms for fade in/out

const Index = () => {
  const [phase, setPhase] = useState<Phase>("splash");
  const [musicMuted, setMusicMuted] = useState(false);
  const countdownAudioRef = useRef<HTMLAudioElement>(null);
  const birthdayAudioRef = useRef<HTMLAudioElement>(null);
  const gameType = useMemo(() => (Math.random() < 0.5 ? "emoji" : "memory"), []);

  // Fade audio volume helper
  const fadeAudio = useCallback((audio: HTMLAudioElement, from: number, to: number, duration: number) => {
    const steps = 30;
    const stepTime = duration / steps;
    const diff = (to - from) / steps;
    let step = 0;
    audio.volume = from;
    const interval = setInterval(() => {
      step++;
      audio.volume = Math.min(1, Math.max(0, from + diff * step));
      if (step >= steps) {
        clearInterval(interval);
        audio.volume = to;
        if (to === 0) audio.pause();
      }
    }, stepTime);
    return interval;
  }, []);

  // Auto-play countdown music during countdown phase
  useEffect(() => {
    if (phase === "countdown" && countdownAudioRef.current && !musicMuted) {
      const audio = countdownAudioRef.current;
      audio.volume = 0;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      fadeAudio(audio, 0, 1, FADE_DURATION);
    }
    if (phase !== "countdown" && countdownAudioRef.current) {
      const audio = countdownAudioRef.current;
      if (!audio.paused) {
        fadeAudio(audio, audio.volume, 0, FADE_DURATION);
      }
    }
  }, [phase, fadeAudio, musicMuted]);

  // Auto-play birthday music after countdown (game, card, ending phases)
  useEffect(() => {
    const isPostCountdown = phase === "game" || phase === "card" || phase === "ending";
    if (isPostCountdown && birthdayAudioRef.current && !musicMuted) {
      const audio = birthdayAudioRef.current;
      audio.volume = 0;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      fadeAudio(audio, 0, 1, FADE_DURATION);
    }
    if (!isPostCountdown && birthdayAudioRef.current) {
      const audio = birthdayAudioRef.current;
      if (!audio.paused) {
        fadeAudio(audio, audio.volume, 0, FADE_DURATION);
      }
    }
  }, [phase, fadeAudio, musicMuted]);

  // Handle fade-loop for birthday music (fade out at end, restart with fade in)
  useEffect(() => {
    const audio = birthdayAudioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      // Start fading out 2 seconds before end
      if (audio.duration && audio.currentTime >= audio.duration - 2 && audio.volume > 0.05) {
        // Will naturally end, then onEnded triggers restart
      }
    };
    const handleEnded = () => {
      if (musicMuted) return;
      const isPostCountdown = phase === "game" || phase === "card" || phase === "ending";
      if (isPostCountdown) {
        audio.currentTime = 0;
        audio.volume = 0;
        audio.play().catch(() => {});
        fadeAudio(audio, 0, 1, FADE_DURATION);
      }
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [phase, musicMuted, fadeAudio]);

  // Mute/unmute handler
  const toggleMute = () => {
    const newMuted = !musicMuted;
    setMusicMuted(newMuted);
    [countdownAudioRef.current, birthdayAudioRef.current].forEach((audio) => {
      if (!audio) return;
      if (newMuted) {
        fadeAudio(audio, audio.volume, 0, 500);
      } else {
        // Resume whichever is relevant
        const isCountdown = phase === "countdown";
        const isPostCountdown = phase === "game" || phase === "card" || phase === "ending";
        if ((isCountdown && audio === countdownAudioRef.current) || (isPostCountdown && audio === birthdayAudioRef.current)) {
          audio.volume = 0;
          audio.play().catch(() => {});
          fadeAudio(audio, 0, 1, FADE_DURATION);
        }
      }
    });
  };

  const handleCountdownUnlock = useCallback(() => {
    setPhase("game");
  }, []);

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

      <audio ref={countdownAudioRef} src="/music/countdown.mp3" loop preload="auto" />
      <audio ref={birthdayAudioRef} src="/music/birthday.mp3" preload="auto" />

      {phase !== "splash" && (
        <button
          onClick={toggleMute}
          className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform text-xl"
          aria-label="Toggle music"
        >
          {musicMuted ? "🔇" : "🔊"}
        </button>
      )}
    </div>
  );
};

export default Index;
