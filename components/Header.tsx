"use client";

import { Brain } from "lucide-react";
import { motion } from "framer-motion";

export const Header = () => {
  return (
    <>
      <div className="mb-10 flex items-center justify-center gap-3 sm:mb-16">
        <Brain className="text-primary h-8 w-8" />
        <span className="text-xl font-semibold text-white">AI Helper</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-2 text-4xl leading-tight font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:mb-4 lg:text-[72px] lg:leading-[1.15]">
          Instant Question Analysis
        </h1>
        <p className="mx-auto max-w-2xl text-lg font-medium text-white/80 sm:text-xl">
          Get real-time answers and verification using multiple AI models
        </p>
      </motion.div>
    </>
  );
};

export default Header;
