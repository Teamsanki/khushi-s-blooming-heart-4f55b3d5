import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import MemoryGame from "@/components/MemoryGame";
import BalloonPopGame from "@/components/BalloonPopGame";
import CakeBanaoGame from "@/components/CakeBanaoGame";
import ButterflyCatchGame from "@/components/ButterflyCatchGame";
import BirthdayCard from "@/components/BirthdayCard";
import SplashScreen from "@/components/SplashScreen";
import CountdownScreen from "@/components/CountdownScreen";
import EndingScreen from "@/components/EndingScreen";

type Phase = "splash" | "countdown" | "game1" | "game2" | "game3" | "game4" | "card" | "ending";

const TARGET_DATE = new Date("2026-07-10T00:00:00");
const FADE_DURATION = 2000;
const PREVIEW_DURATION_MS = 3 * 60 * 1000; // 3 minutes preview before re-locking

const Index = () => {
  const [phase, setPhase] = useState<Phase>("splash");
  const [musicMuted, setMusicMuted] = useState(false);
  const countdownAudioRef = useRef<HTMLAudioElement>(null);
  const birthdayAudioRef = useRef<HTMLAudioElement>(null);
  
  const fadeIntervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const prevPhaseRef = useRef<Phase>("splash");
  const birthdayStartedRef = useRef(false);

  const fadeAudio = useCallback((key: string, audio: HTMLAudioElement, from: number, to: number, duration: number) => {
    if (fadeIntervalsRef.current[key]) {
      clearInterval(fadeIntervalsRef.current[key]);
      delete fadeIntervalsRef.current[key];
    }
    const steps = 30;
    const stepTime = duration / steps;
    const diff = (to - from) / steps;
    let step = 0;
    audio.volume = Math.min(1, Math.max(0, from));
    const interval = setInterval(() => {
      step++;
      audio.volume = Math.min(1, Math.max(0, from + diff * step));
      if (step >= steps) {
        clearInterval(interval);
        delete fadeIntervalsRef.current[key];
        audio.volume = Math.min(1, Math.max(0, to));
        if (to === 0) audio.pause();
      }
    }, stepTime);
    fadeIntervalsRef.current[key] = interval;
  }, []);

  // Phase transition audio logic - only runs on phase change, NOT on musicMuted change
  useEffect(() => {
    const prev = prevPhaseRef.current;
    if (prev === phase) return;
    prevPhaseRef.current = phase;
    const countdown = countdownAudioRef.current;
    const birthday = birthdayAudioRef.current;

    // Splash → Countdown: start countdown music (always from beginning)
    if (phase === "countdown" && prev === "splash" && countdown && !musicMuted) {
      countdown.currentTime = 0;
      countdown.volume = 0;
      countdown.play().catch(() => {});
      fadeAudio("countdown", countdown, 0, 1, FADE_DURATION);
    }

    // Countdown → Game1: fade out countdown, start birthday (always from beginning)
    if (prev === "countdown" && phase === "game1") {
      if (countdown && !countdown.paused) {
        fadeAudio("countdown", countdown, countdown.volume, 0, FADE_DURATION);
      }
      if (birthday && !musicMuted) {
        birthdayStartedRef.current = true;
        birthday.currentTime = 0;
        birthday.volume = 0;
        birthday.play().catch(() => {});
        fadeAudio("birthday", birthday, 0, 1, FADE_DURATION);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, fadeAudio]);

  // On mount/refresh: if already in countdown phase, auto-start countdown music
  useEffect(() => {
    const countdown = countdownAudioRef.current;
    if (phase === "countdown" && countdown && !musicMuted) {
      countdown.currentTime = 0;
      countdown.volume = 0;
      countdown.play().catch(() => {});
      fadeAudio("countdown", countdown, 0, 1, FADE_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Birthday music loop on end
  useEffect(() => {
    const audio = birthdayAudioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      if (musicMuted) return;
      const isPostCountdown = ["game1","game2","game3","game4","card","ending"].includes(phase);
      if (isPostCountdown) {
        audio.currentTime = 0;
        audio.volume = 0;
        audio.play().catch(() => {});
        fadeAudio("birthday", audio, 0, 1, FADE_DURATION);
      }
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [phase, musicMuted, fadeAudio]);

  const toggleMute = () => {
    const newMuted = !musicMuted;
    setMusicMuted(newMuted);
    const countdown = countdownAudioRef.current;
    const birthday = birthdayAudioRef.current;

    if (newMuted) {
      // Immediately stop all fades and pause
      if (countdown) {
        fadeAudio("countdown", countdown, countdown.volume, 0, 300);
      }
      if (birthday) {
        fadeAudio("birthday", birthday, birthday.volume, 0, 300);
      }
    } else {
      if (phase === "countdown" && countdown) {
        countdown.volume = 0;
        countdown.play().catch(() => {});
        fadeAudio("countdown", countdown, 0, 1, FADE_DURATION);
      }
      const isPostCountdown = ["game1","game2","game3","card","ending"].includes(phase);
      if (isPostCountdown && birthday) {
        birthday.volume = 0;
        birthday.play().catch(() => {});
        fadeAudio("birthday", birthday, 0, 1, FADE_DURATION);
      }
    }
  };

  const handleCountdownUnlock = useCallback(() => {
    setPhase("game1");
  }, []);

  // Auto re-lock back to countdown after 3 minutes if real birthday hasn't arrived yet.
  // Applies once user has unlocked early (via password) and is browsing game/card/ending.
  useEffect(() => {
    const isPostUnlock = ["game1","game2","game3","card","ending"].includes(phase);
    if (!isPostUnlock) return;
    if (Date.now() >= TARGET_DATE.getTime()) return; // birthday actually arrived — keep open

    const timer = setTimeout(() => {
      if (Date.now() < TARGET_DATE.getTime()) {
        setPhase("countdown");
      }
    }, PREVIEW_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="min-h-screen bg-background relative">
      {phase === "splash" && (
        <SplashScreen onComplete={() => setPhase("countdown")} />
      )}

      {phase === "countdown" && (
        <CountdownScreen targetDate={TARGET_DATE} onUnlock={handleCountdownUnlock} />
      )}

      {phase === "game1" && (
        <BalloonPopGame onComplete={() => setPhase("game2")} />
      )}

      {phase === "game2" && (
        <MemoryGame onComplete={() => setPhase("game3")} />
      )}

      {phase === "game3" && (
        <CakeBanaoGame onComplete={() => setPhase("game4")} />
      )}

      {phase === "game4" && (
        <ButterflyCatchGame onComplete={() => setPhase("card")} />
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
