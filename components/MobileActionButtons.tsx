"use client";

import { motion } from "framer-motion";
import { Loader2, Space, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          className="relative w-full touch-manipulation select-none"
          onClick={clear}
          size="lg"
          variant="outline"
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          className="relative w-full touch-manipulation select-none"
          disabled={isLoading}
          onClick={capture}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="-ml-1 mr-3 h-5 w-5 animate-spin" />
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
