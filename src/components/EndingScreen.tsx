import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const useTypewriter = (text: string, speed = 40, start = true) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start || !text) return;
    let i = 0;
    setDisplayed("");
    setDone(false);
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, start]);

  return { displayed, done };
};

const EndingScreen = () => {
  const [aiMessage, setAiMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    // Fade in title first
    setTimeout(() => setShowTitle(true), 500);

    // Fetch AI message
    const fetchMessage = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-shayari", {
          body: { type: "ending" },
        });
        if (error) throw error;
        setAiMessage(data.text);
      } catch {
        setAiMessage("Khushi, tu duniya ki sabse pyaari insaan hai. Tera janamdin mubarak ho, hamesha khush reh, hamesha muskurati reh. Tera bhai hamesha tere saath hai 💖🎂✨");
      }
    };

    fetchMessage();
    // Show typewriter after title animation
    setTimeout(() => setShowMessage(true), 2500);
  }, []);

  const { displayed, done } = useTypewriter(aiMessage, 35, showMessage && !!aiMessage);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Soft floating sparkles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          style={{ left: `${Math.random() * 90 + 5}%`, top: `${Math.random() * 90 + 5}%` }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5], y: [0, -10, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
        >
          ✨
        </motion.div>
      ))}

      {/* Happy Birthday title with fade-in */}
      {showTitle && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            🎂
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-cursive text-primary mb-2">
            Happy Birthday
          </h1>
          <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Khushi 💖
          </p>
        </motion.div>
      )}

      {/* AI-generated message with typewriter */}
      {showMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center px-4"
        >
          <div className="w-12 h-px bg-primary/40 mx-auto mb-4" />
          <p className="text-foreground font-medium leading-relaxed text-sm sm:text-base min-h-[80px]">
            {displayed}
            {!done && aiMessage && (
              <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
            )}
          </p>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-12 h-px bg-primary/40 mx-auto mt-4 mb-4" />
              <p className="text-xs text-muted-foreground">Made with ❤️</p>
              <p className="text-sm font-display font-semibold text-foreground mt-1">
                ~ From Sumit ~
              </p>
              <p className="text-[10px] text-muted-foreground mt-4 opacity-60">
                credit: terasanki
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EndingScreen;
