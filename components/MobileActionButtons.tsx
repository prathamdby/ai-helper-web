"use client";

import { Button } from "@/components/ui/button";
import { X, Space, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface MobileActionButtonsProps {
  isSettingsConfigured: boolean;
  isLoading: boolean;
  capture: () => Promise<void>;
  clear: () => void;
}

export default function MobileActionButtons({
  isSettingsConfigured,
  isLoading,
  capture,
  clear,
}: MobileActionButtonsProps) {
  if (!isSettingsConfigured) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-4 inset-x-6 grid grid-cols-2 gap-4 z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Button size="lg" className="w-full" variant="outline" onClick={clear}>
        <X className="w-4 h-4 mr-2" />
        Clear
      </Button>
      <Button
        size="lg"
        className="w-full"
        onClick={capture}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            Loading...
          </>
        ) : (
          <>
            <Space className="w-4 h-4 mr-2" />
            Capture
          </>
        )}
      </Button>
    </motion.div>
  );
}
