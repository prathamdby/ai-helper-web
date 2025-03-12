"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Space, Camera, X, KeySquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface ModelResponse {
  name: string;
  status: string;
  timeTaken?: number;
}

export default function Home() {
  const isMobile = useIsMobile();
  const modelResponses: ModelResponse[] = [];

  return (
    <main className="flex flex-col min-h-screen w-full bg-background">
      <div className="px-6 lg:px-16 py-8">
        <Header />
      </div>
      <motion.div
        className="flex-1 px-6 lg:px-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Camera Feed Container */}
        <motion.div
          className="relative w-full lg:w-3/5 mx-auto aspect-[21/9] bg-muted rounded-lg overflow-hidden mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-16 h-16 text-muted-foreground" />
          </div>

          {/* Status Overlay */}
          <motion.div
            className="absolute top-4 right-4 flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="px-3 py-1.5 bg-yellow-500/20 text-yellow-500 rounded-md text-sm font-medium">
              Ready
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
                OCR: Waiting for capture...
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
                Point your camera at a question and press SPACE to analyze
              </p>

              {/* Dynamic Model Responses */}
              <div className="space-y-2">
                {modelResponses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No model responses yet...
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

      {/* Mobile Action Buttons */}
      {isMobile && (
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
