"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useState } from "react";
import useStore from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import GridPattern from "@/components/GridPattern";
import CameraComponent from "@/components/CameraComponent";
import QuestionDisplay from "@/components/QuestionDisplay";
import ModelResponsesDisplay from "@/components/ModelResponsesDisplay";
import OcrTextDisplay from "@/components/OcrTextDisplay";
import MobileActionButtons from "@/components/MobileActionButtons";
// Import the capture logic directly
import CaptureLogic from "@/components/CaptureLogic";

export default function Home() {
  const isMobile = useIsMobile();
  const { ocrText, question, modelResponses, isSettingsConfigured, isLoading } =
    useStore();

  // State for camera error - only used for passing to CaptureLogic
  const [, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Use the capture logic
  const { capture, clear } = CaptureLogic({
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    videoRef,
    setError,
  });

  return (
    <main className="flex flex-col min-h-screen w-full relative overflow-hidden">
      <GridPattern />
      <Sidebar />
      <div className="px-6 lg:px-16 pt-12 pb-8 relative z-10">
        <Header />
      </div>
      <motion.div
        className="flex-1 px-6 lg:px-16 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Camera Feed Container */}
        <CameraComponent
          isMobile={isMobile}
          capture={capture}
          clear={clear}
          isLoading={isLoading}
          isSettingsConfigured={isSettingsConfigured}
        />

        {/* Results Section */}
        <div className="flex flex-col gap-4 lg:w-3/5 mx-auto mb-16">
          {/* Stacked Results Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full space-y-4"
          >
            {/* Question Section */}
            <QuestionDisplay
              question={question}
              ocrText={ocrText}
              isLoading={isLoading}
              isSettingsConfigured={isSettingsConfigured}
            />

            {/* AI Answers Section */}
            <ModelResponsesDisplay
              modelResponses={modelResponses}
              isLoading={isLoading}
              question={question}
            />

            {/* OCR Text Section */}
            <OcrTextDisplay ocrText={ocrText} isLoading={isLoading} />
          </motion.div>
        </div>
      </motion.div>

      <Footer />

      {/* Mobile Action Buttons - Only show when configured */}
      {isMobile && (
        <MobileActionButtons
          isSettingsConfigured={isSettingsConfigured}
          isLoading={isLoading}
          capture={capture}
          clear={clear}
        />
      )}
    </main>
  );
}
