import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export const AnimatedPlaceholder = () => {
  const [currentWord, setCurrentWord] = useState("users");
  const words = ["users", "channels"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev === "users" ? "channels" : "users"));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block">
      Search for{" "}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="inline-block"
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
