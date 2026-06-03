import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import HeartTree from "./HeartTree";
import SparklingName from "./SparklingName";
import { supabase } from "@/integrations/supabase/client";

const photos = [
  { id: 1, shayari: "Khushi ki muskaan mein chhupa hai jahan sara 💕", src: "/photos/khushi-1.jpeg" },
  { id: 2, shayari: "Har pal tera chehra yaad aata hai, dil ko sukoon mil jaata hai ✨", src: "/photos/khushi-2.jpeg" },
  { id: 3, shayari: "Tujhse milke lagta hai zindagi mein rang aa gaye 👑", src: "/photos/khushi-3.jpeg" },
  { id: 4, shayari: "Queen ho tum dil ki, har baat mein khaas ho 💖", src: "/photos/khushi-4.jpeg" },
  { id: 5, shayari: "Husn tera chaand sa, nazaakat mein ek kahani hai 🌙", src: "/photos/khushi-5.jpeg" },
  { id: 6, shayari: "Aankhon mein sapne hain, dil mein pyaar hai tera 🌸", src: "/photos/khushi-6.jpeg" },
  { id: 7, shayari: "Duniya ki sabse pyaari muskaan sirf teri hai 🌺", src: "/photos/khushi-7.jpeg" },
  { id: 8, shayari: "Tere jaisi koi nahi, tu ek anmol ratan hai 💎", src: "/photos/khushi-8.jpeg" },
  { id: 9, shayari: "Khuda ne jab tujhe banaya hoga, farishtey bhi dekhte reh gaye honge 🦋", src: "/photos/khushi-9.jpeg" },
  { id: 10, shayari: "Tera style, teri adaa, duniya deewani hai tera 👗", src: "/photos/khushi-10.jpeg" },
  { id: 11, shayari: "Rang birangi duniya mein, tu sabse haseen hai 🌈", src: "/photos/khushi-11.jpeg" },
  { id: 12, shayari: "Har photo mein ek nayi kahani hai teri 📸", src: "/photos/khushi-12.jpeg" },
  { id: 13, shayari: "Teri hasi se roshni hoti hai chaaron taraf ⭐", src: "/photos/khushi-13.jpeg" },
  { id: 14, shayari: "Sundar, pyaari, aur sabse nirali - yehi hai Khushi 🌹", src: "/photos/khushi-14.jpeg" },
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

// Realistic book page turn:
// - Exiting page peels around its edge (left for forward, right for back) 0 -> -180deg
// - Entering page is revealed underneath (no rotation, just sits there)
// Implemented per layer (exiting/entering) below via separate variants.
const exitVariants = {
  initial: { rotateY: 0 },
  animate: (d: number) => ({
    rotateY: d >= 0 ? -180 : 180,
    transition: { duration: 0.9, ease: [0.645, 0.045, 0.355, 1.0] },
  }),
};
const enterVariants = {
  initial: { opacity: 0, scale: 0.985 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.25, duration: 0.45, ease: "easeOut" },
  },
};

const BirthdayCard = ({ onComplete }: { onComplete?: () => void }) => {
  const [coverOpen, setCoverOpen] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [treeComplete, setTreeComplete] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const touchStartX = useRef(0);
  const [flipping, setFlipping] = useState(false);
  const [prevPage, setPrevPage] = useState<number | null>(null);

  const totalPages = 1 + photos.length + 1; // tree + photos + final

  // Reset readiness whenever page changes
  useEffect(() => {
    setPageReady(false);
  }, [currentPage]);

  // Tree page readiness mirrors treeComplete
  useEffect(() => {
    if (currentPage === 0 && treeComplete) setPageReady(true);
  }, [currentPage, treeComplete]);

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
    if (currentPage < totalPages - 1 && !flipping) {
      setDirection(1);
      setPrevPage(currentPage);
      setFlipping(true);
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages, flipping]);

  const goPrev = useCallback(() => {
    if (currentPage > 0 && !flipping) {
      setDirection(-1);
      setPrevPage(currentPage);
      setFlipping(true);
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage, flipping]);

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
          <HeartTree onComplete={() => { setTreeComplete(true); setPageReady(true); }} />
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
      return <PhotoCard photo={photo} onReady={() => setPageReady(true)} />;
    }

    // Final page
    return <FinalPage onCardClose={onComplete} />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div
        className="relative w-full max-w-sm aspect-[3/4] bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
        style={{ perspective: "1200px" }}
      >
        {/* Paper texture */}
        <div className="absolute inset-0 paper-lines opacity-30" />

        {/* Page curl shadow effect */}
        <div className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: "linear-gradient(to right, hsl(var(--foreground) / 0.03) 0%, transparent 5%, transparent 95%, hsl(var(--foreground) / 0.06) 100%)",
          }}
        />

        <div
          className="relative h-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ perspective: "1800px" }}
        >
          {/* Entering / current page sits underneath */}
          <motion.div
            key={`current-${currentPage}`}
            variants={enterVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 p-5 sm:p-6 flex flex-col"
          >
            {renderPage()}
          </motion.div>

          {/* Exiting page peels over the top */}
          <AnimatePresence>
            {flipping && prevPage !== null && (
              <motion.div
                key={`flip-${prevPage}-${direction}`}
                custom={direction}
                variants={exitVariants}
                initial="initial"
                animate="animate"
                onAnimationComplete={() => {
                  setFlipping(false);
                  setPrevPage(null);
                }}
                className="absolute inset-0 z-[5]"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: direction >= 0 ? "left center" : "right center",
                  boxShadow:
                    direction >= 0
                      ? "8px 0 28px hsl(var(--foreground) / 0.18)"
                      : "-8px 0 28px hsl(var(--foreground) / 0.18)",
                  borderRadius: "1rem",
                  background: "hsl(var(--card))",
                }}
              >
                {/* Front face — shows the page being turned */}
                <div
                  className="absolute inset-0 p-5 sm:p-6 flex flex-col rounded-2xl overflow-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="absolute inset-0 paper-lines opacity-30 pointer-events-none" />
                  {(() => {
                    if (prevPage === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center">
                          <h3 className="text-xl font-display font-bold text-foreground mb-2">
                            🌳 A Tree of Love 💖
                          </h3>
                          <div className="w-40 h-40 rounded-full bg-primary/10" />
                        </div>
                      );
                    }
                    if (prevPage >= 1 && prevPage <= photos.length) {
                      const p = photos[prevPage - 1];
                      return (
                        <div className="h-full flex items-center justify-center">
                          <img src={p.src} alt="" className="max-h-[55vh] w-auto rounded-xl object-contain" />
                        </div>
                      );
                    }
                    return <div className="h-full" />;
                  })()}
                  {/* Dynamic crease shadow */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0.6, 0.2] }}
                    transition={{ duration: 0.9, times: [0, 0.3, 0.6, 1] }}
                    style={{
                      background:
                        direction >= 0
                          ? "linear-gradient(to right, hsl(var(--foreground)/0.25), transparent 35%)"
                          : "linear-gradient(to left, hsl(var(--foreground)/0.25), transparent 35%)",
                    }}
                  />
                </div>
                {/* Back face — subtle paper back */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background:
                      "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
                  }}
                >
                  <div className="absolute inset-0 paper-lines opacity-20" />
                </div>
              </motion.div>
            )}
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

        {/* Next button — appears only when current page content (AI/typewriter) is ready */}
        {currentPage < totalPages - 1 && pageReady && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors z-10 text-lg animate-fade-in"
            aria-label="Next"
          >
            ›
          </button>
        )}
        {/* Subtle waiting hint when next is hidden */}
        {currentPage < totalPages - 1 && !pageReady && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-[10px] text-muted-foreground/60 italic">
            likh raha hu…
          </div>
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

// Photo card component with fade-in shayari
const PhotoCard = ({ photo, onReady }: { photo: { src: string; shayari: string }; onReady?: () => void }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAiText("");
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-shayari", {
          body: { type: "photo" },
        });
        if (error) throw error;
        if (!cancelled) setAiText((data?.text || "").trim() || photo.shayari);
      } catch {
        if (!cancelled) setAiText(photo.shayari);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photo.src]);

  const { displayed, done } = useTypewriter(aiText, 35, imageLoaded && !loading && !!aiText);

  useEffect(() => {
    if (done) onReady?.();
  }, [done, onReady]);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Photo frame with fade */}
      <motion.div
        className="w-full rounded-xl overflow-hidden mb-4 relative shadow-lg border-2 border-primary/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={photo.src}
          alt="Khushi"
          className="w-full h-auto object-contain max-h-[55vh]"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Soft gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/4"
          style={{
            background: "linear-gradient(to top, hsl(var(--background) / 0.4), transparent)",
          }}
        />
      </motion.div>

      {/* AI text with typewriter */}
      {imageLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center px-2 min-h-[72px]"
        >
          <div className="w-8 h-px bg-primary/40 mx-auto mb-3" />
          {loading || !aiText ? (
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="text-muted-foreground text-xs"
            >
              ✨ likh raha hu... ✨
            </motion.p>
          ) : (
            <p className="font-cursive text-lg sm:text-xl text-foreground leading-relaxed">
              "{displayed}"
              {!done && (
                <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse align-middle" />
              )}
            </p>
          )}
          <div className="w-8 h-px bg-primary/40 mx-auto mt-3" />
        </motion.div>
      )}
    </div>
  );
};

const FinalPage = ({ onCardClose }: { onCardClose?: () => void }) => {
  const [aiShayari, setAiShayari] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShayari = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-shayari", {
          body: { type: "shayari" },
        });
        if (error) throw error;
        setAiShayari(data.text);
      } catch {
        setAiShayari(shayari);
      }
      setLoading(false);
    };
    fetchShayari();
  }, []);

  const { displayed, done } = useTypewriter(aiShayari || shayari, 35, !loading);

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

      {loading ? (
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-muted-foreground text-sm"
        >
          ✨ AI shayari likh raha hai... ✨
        </motion.p>
      ) : (
        <p className="text-foreground font-medium leading-relaxed text-sm sm:text-base min-h-[120px]">
          {displayed}
          {!done && (
            <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
          )}
        </p>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <div className="w-16 h-px bg-border mx-auto mb-4" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCardClose}
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg"
          >
            Card Band Karo 💌
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default BirthdayCard;
