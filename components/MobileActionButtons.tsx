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
    <div className="pointer-events-auto fixed inset-x-6 bottom-8 z-50 flex items-center justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full"
      >
        <Button
          size="lg"
          className="relative w-full touch-manipulation select-none"
          variant="outline"
          onClick={clear}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <Button
          size="lg"
          className="relative w-full touch-manipulation select-none"
          onClick={capture}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 -ml-1 h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Space className="mr-2 h-4 w-4" />
              Capture
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
