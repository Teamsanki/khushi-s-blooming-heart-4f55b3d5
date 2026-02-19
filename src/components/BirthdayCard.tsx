import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import HeartTree from "./HeartTree";
import SparklingName from "./SparklingName";

const photos = [
  { id: 1, caption: "Pehli baar college mein mili thi 💕", emoji: "📸" },
  { id: 2, caption: "Hamesha muskurati rehti hai ✨", emoji: "😊" },
  { id: 3, caption: "Sabse pyaari junior 👑", emoji: "👑" },
  { id: 4, caption: "College ki best yaadein 📚", emoji: "🎓" },
  { id: 5, caption: "Dil se special hai tu 💖", emoji: "💝" },
];

const shayari =
  "Khushi naam hai tera, khushi hi tu laati hai... Jab se college mein mili, zindagi khubsurat ho gayi hai. Tu sirf junior nahi, tu dil ki behen hai meri. Happy Birthday Khushi! Hamesha khush reh! 🎂💖";

// Typewriter hook
const useTypewriter = (text: string, speed = 40, start = true) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;
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

const BirthdayCard = () => {
  const [coverOpen, setCoverOpen] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [treeComplete, setTreeComplete] = useState(false);
  const touchStartX = useRef(0);

  const totalPages = 1 + photos.length + 1; // tree + photos + final

  const handleOpenCover = () => {
    setCoverOpen(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#e84393", "#fd79a8", "#fdcb6e", "#ffeaa7", "#fab1a0"],
    });
    setTimeout(() => setShowPages(true), 900);
  };

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const variants = {
    enter: (d: number) => ({
      x: d >= 0 ? 300 : -300,
      opacity: 0,
      rotateY: d >= 0 ? 15 : -15,
    }),
    center: { x: 0, opacity: 1, rotateY: 0 },
    exit: (d: number) => ({
      x: d >= 0 ? -300 : 300,
      opacity: 0,
      rotateY: d >= 0 ? -15 : 15,
    }),
  };

  // Cover page
  if (!showPages) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background p-4"
        style={{ perspective: "1500px" }}
      >
        <motion.div
          className="w-full max-w-sm aspect-[3/4] bg-primary rounded-2xl shadow-2xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={
            coverOpen
              ? { rotateY: -180, opacity: 0 }
              : { scale: 1, opacity: 1, rotateY: 0 }
          }
          transition={
            coverOpen
              ? { duration: 0.8, ease: "easeInOut" }
              : { duration: 0.5, type: "spring" }
          }
          style={{
            transformOrigin: "left center",
            backfaceVisibility: "hidden",
          }}
          onClick={!coverOpen ? handleOpenCover : undefined}
        >
          {/* Floating sparkle particles */}
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-accent"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          <div className="relative z-10 text-center px-6">
            <motion.p
              className="text-primary-foreground/90 font-cursive text-4xl sm:text-5xl mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Happy Birthday
            </motion.p>

            <SparklingName />

            <motion.p
              className="text-primary-foreground/70 text-sm font-medium mt-3 tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              ~ Junior ~
            </motion.p>

            <motion.p
              className="text-primary-foreground/50 text-xs mt-10"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨ Tap to Open ✨
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Inner pages
  const renderPage = () => {
    if (currentPage === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center">
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            🌳 A Tree of Love 💖
          </h3>
          <HeartTree onComplete={() => setTreeComplete(true)} />
          {treeComplete && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground text-sm mt-2"
            >
              Swipe ya arrow press karo →
            </motion.p>
          )}
        </div>
      );
    }

    if (currentPage >= 1 && currentPage <= photos.length) {
      const photo = photos[currentPage - 1];
      return (
        <div className="h-full flex flex-col items-center justify-center">
          {/* Photo frame */}
          <div className="w-full aspect-[4/3] bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border mb-5 relative overflow-hidden">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-rose-glow/5" />
            <div className="text-center relative z-10">
              <span className="text-5xl block mb-2">{photo.emoji}</span>
              <p className="text-muted-foreground text-xs">
                Photo {photo.id} yahan add karo
              </p>
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center font-cursive text-xl sm:text-2xl text-foreground"
          >
            {photo.caption}
          </motion.p>
        </div>
      );
    }

    // Final page
    return <FinalPage />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="relative w-full max-w-sm aspect-[3/4] bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
        {/* Paper texture */}
        <div className="absolute inset-0 paper-lines opacity-30" />

        <div
          className="relative h-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ perspective: "800px" }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute inset-0 p-5 sm:p-6 flex flex-col"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev button */}
        {currentPage > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors z-10 text-lg"
            aria-label="Previous"
          >
            ‹
          </button>
        )}

        {/* Next button */}
        {currentPage < totalPages - 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors z-10 text-lg"
            aria-label="Next"
          >
            ›
          </button>
        )}

        {/* Page indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FinalPage = () => {
  const { displayed, done } = useTypewriter(shayari, 35);

  useEffect(() => {
    if (done) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#e84393", "#fdcb6e", "#fd79a8"],
      });
    }
  }, [done]);

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-4xl mb-4"
      >
        💖
      </motion.div>

      <p className="text-foreground font-medium leading-relaxed text-sm sm:text-base min-h-[120px]">
        {displayed}
        {!done && (
          <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
        )}
      </p>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="w-16 h-px bg-border mx-auto mb-4" />
          <p className="text-xs text-muted-foreground">Made with ❤️</p>
          <p className="text-sm font-display font-semibold text-foreground mt-1">
            ~ From Sumit ~
          </p>
          <p className="text-[10px] text-muted-foreground mt-4 opacity-60">
            credit: terasanki
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BirthdayCard;
