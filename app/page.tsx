"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Space, Camera, X, KeySquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import useStore from "@/lib/store";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const isMobile = useIsMobile();
  const { modelResponses, isSettingsConfigured } = useStore();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
        });
        setStream(stream);

        const video = document.createElement("video");
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          const renderFrame = () => {
            if (!video.paused && !video.ended && canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              if (ctx) {
                const canvasWidth = canvasRef.current.width;
                const canvasHeight = canvasRef.current.height;
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;

                const canvasAspectRatio = canvasWidth / canvasHeight;
                const videoAspectRatio = videoWidth / videoHeight;

                let sourceX = 0;
                let sourceY = 0;
                let sourceWidth = videoWidth;
                let sourceHeight = videoHeight;
                let destX = 0;
                let destY = 0;
                let destWidth = canvasWidth;
                let destHeight = canvasHeight;

                if (canvasAspectRatio > videoAspectRatio) {
                  // Canvas is wider than the video, so crop the top and bottom
                  sourceHeight = videoWidth / canvasAspectRatio;
                  sourceY = (videoHeight - sourceHeight) / 2;
                } else {
                  // Canvas is taller than the video, so crop the left and right
                  sourceWidth = videoHeight * canvasAspectRatio;
                  sourceX = (videoWidth - sourceWidth) / 2;
                }

                ctx.drawImage(
                  video,
                  sourceX,
                  sourceY,
                  sourceWidth,
                  sourceHeight,
                  destX,
                  destY,
                  destWidth,
                  destHeight
                );
              }
            }
            requestAnimationFrame(renderFrame);
          };
          renderFrame();
        };
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (isSettingsConfigured) {
      getCameraStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isSettingsConfigured]);

  return (
    <main className="flex flex-col min-h-screen w-full bg-background">
      <Sidebar />
      <div className="px-6 lg:px-16 pt-12 pb-8">
        <Header />
      </div>
      <motion.div
        className="flex-1 px-6 lg:px-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Camera Feed Container */}
        <motion.div
          className="relative w-full lg:w-3/5 mx-auto aspect-video bg-muted rounded-lg overflow-hidden mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : stream ? (
            <canvas ref={canvasRef} className="w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          {/* Status Overlay */}
          <motion.div
            className="absolute top-4 right-4 flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="px-3 py-1.5 bg-yellow-500/20 text-yellow-500 rounded-md text-sm font-medium">
              {isSettingsConfigured ? "Ready" : "Configure Settings"}
            </div>
          </motion.div>

          {/* Controls - Only show on desktop */}
          {!isMobile && (
            <motion.div
              className="absolute top-4 left-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-3 bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 text-green-500">
                    <KeySquare className="w-4 h-4" />
                    <span>Controls:</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Space className="w-3 h-3" /> Capture & Analyze
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <X className="w-3 h-3" /> Clear Results
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <div className="flex flex-col gap-4 lg:w-3/5 mx-auto mb-16">
          {/* OCR Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4">
              <p className="text-sm font-mono text-muted-foreground">
                {isSettingsConfigured
                  ? "OCR: Waiting for capture..."
                  : "OCR: Configure settings to start"}
              </p>
            </Card>
          </motion.div>

          {/* Question Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4">
              <p className="text-sm font-medium mb-4">
                {isSettingsConfigured
                  ? "Point your camera at a question and press SPACE to analyze"
                  : "Click the settings icon in the top-right to configure API keys and models"}
              </p>

              {/* Dynamic Model Responses */}
              <div className="space-y-2">
                {!isSettingsConfigured ? (
                  <p className="text-sm text-muted-foreground">
                    No models configured
                  </p>
                ) : (
                  modelResponses.map((model, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="text-blue-500">{model.name}:</div>
                      <div className="text-muted-foreground">
                        {model.status}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <Footer />

      {/* Mobile Action Buttons - Only show when configured */}
      {isMobile && isSettingsConfigured && (
        <motion.div
          className="fixed bottom-4 inset-x-6 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button size="lg" className="w-full" variant="outline">
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button size="lg" className="w-full">
            <Space className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </motion.div>
      )}
    </main>
  );
}
