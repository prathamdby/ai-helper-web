"use client";

import { Brain } from "lucide-react";
import { motion } from "framer-motion";

export const Header = () => {
  return (
    <>
      <div className="mb-10 flex items-center justify-center gap-3 sm:mb-16">
        <Brain className="h-8 w-8 text-primary" />
        <span className="font-semibold text-white text-xl">AI Helper</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.32, 0.72, 0, 1],
          opacity: { duration: 0.3 },
        }}
        style={{
          willChange: "opacity, transform",
          translateZ: 0,
          backfaceVisibility: "hidden",
        }}
        className="mb-8 text-center"
      >
        <h1 className="mb-2 font-black text-4xl text-white leading-tight tracking-tight sm:text-5xl md:text-6xl lg:mb-4 lg:text-[72px] lg:leading-[1.15]">
          Instant Question Analysis
        </h1>
        <p className="mx-auto max-w-2xl font-medium text-lg text-white/80 sm:text-xl">
          Get real-time answers and verification using multiple AI models
        </p>
      </motion.div>
    </>
  );
};

export default Header;
