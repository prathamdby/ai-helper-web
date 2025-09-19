"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import CameraComponent from "@/components/CameraComponent";
// Import the capture logic directly
import CaptureLogic from "@/components/CaptureLogic";
import Footer from "@/components/Footer";
import GridPattern from "@/components/GridPattern";
import Header from "@/components/Header";
import MobileActionButtons from "@/components/MobileActionButtons";
import ModelResponsesDisplay from "@/components/ModelResponsesDisplay";
import OcrTextDisplay from "@/components/OcrTextDisplay";
import QuestionDisplay from "@/components/QuestionDisplay";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import useStore from "@/lib/store";

export default function Home() {
  const isMobile = useIsMobile();
  const { ocrText, question, modelResponses, isSettingsConfigured, isLoading } =
    useStore();

  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use the capture logic with proper ref typing
  const { capture, clear } = CaptureLogic({
    canvasRef,
    videoRef,
    setError,
  });

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <GridPattern />
      <Sidebar />
      <div className="relative z-10 px-6 pt-12 pb-8 lg:px-16">
        <Header />
      </div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex-1 px-6 lg:px-16"
        initial={{ opacity: 0, y: 20 }}
      >
        {/* Camera Feed Container */}
        <CameraComponent
          canvasRef={canvasRef}
          capture={capture}
          clear={clear}
          error={error}
          isLoading={isLoading}
          isMobile={isMobile}
          isSettingsConfigured={isSettingsConfigured}
          setError={setError}
          videoRef={videoRef}
        />

        {/* Results Section */}
        <div className="mx-auto mb-16 flex flex-col gap-4 lg:w-3/5">
          {/* Stacked Results Display */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3 }}
          >
            {/* Question Section */}
            <QuestionDisplay
              isLoading={isLoading}
              isSettingsConfigured={isSettingsConfigured}
              ocrText={ocrText}
              question={question}
            />

            {/* AI Answers Section */}
            <ModelResponsesDisplay
              isLoading={isLoading}
              modelResponses={modelResponses}
              question={question}
            />

            {/* OCR Text Section */}
            <OcrTextDisplay isLoading={isLoading} ocrText={ocrText} />
          </motion.div>
        </div>
      </motion.div>

      <Footer />

      {/* Mobile Action Buttons - Only show when configured */}
      {isMobile && (
        <MobileActionButtons
          capture={capture}
          clear={clear}
          isLoading={isLoading}
          isSettingsConfigured={isSettingsConfigured}
        />
      )}
    </main>
  );
}
