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
import axios from "axios";
import { getAllModelResponses } from "@/lib/model-responses";

export default function Home() {
  const isMobile = useIsMobile();
  const {
    setOcrText,
    setQuestion,
    setModelResponses,
    modelResponses,
    isSettingsConfigured,
    settings,
    ocrText,
    question,
    isLoading,
    setLoading,
  } = useStore();

  const capture = async () => {
    setLoading(true);
    if (!canvasRef.current) {
      setError("Camera not available.");
      setLoading(false);
      return;
    }

    try {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        setError("Could not get canvas context.");
        return;
      }

      const imageData = canvasRef.current.toDataURL("image/jpeg");

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-pro-vision",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract text from this image:
If it's a multiple choice question, format as:
Question: <question>
Options: <options>

If it's a regular question, format as:
Question: <question>

ONLY return a Question: line if you detect an actual question in the image.
If no question is detected, return empty string.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData,
                  },
                },
              ],
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${settings.openrouterKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const detectedText = response.data.choices[0].message.content.trim();
      setOcrText(detectedText);

      let question = "";
      let options = "";
      for (const line of detectedText.split("\n")) {
        if (line.startsWith("Question:")) {
          question = line.replace("Question:", "").trim();
        } else if (line.startsWith("Options:")) {
          options = line.replace("Options:", "").trim();
        }
      }

      if (question) {
        setQuestion(options ? `${question}\n${options}` : question);
        getAllModelResponses(question, options);
      } else {
        setQuestion("No question detected.");
      }
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const clear = () => {
    setModelResponses([]);
    setError(null);
    setOcrText("");
    setQuestion("");
  };

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

  useEffect(() => {
    const video = document.createElement("video");
    if (stream) {
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
    }
  }, [stream]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      if (e.code === "Space") {
        capture();
      } else if (e.code === "KeyX") {
        clear();
      }
    };

    if (!isMobile && isSettingsConfigured) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, isSettingsConfigured, capture, clear]);

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
                OCR:{" "}
                {ocrText ||
                  (isLoading ? "Loading..." : "Waiting for capture...")}
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
                {question ||
                  (isSettingsConfigured
                    ? "Point your camera at a question and press SPACE to analyze"
                    : "Click the settings icon in the top-right to configure API keys and models")}
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
                        {model.timeTaken && ` (${model.timeTaken.toFixed(2)}s)`}
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
          <Button
            size="lg"
            className="w-full"
            variant="outline"
            onClick={clear}
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button size="lg" className="w-full" onClick={capture}>
            <Space className="w-4 h-4 mr-2" />
            Capture
          </Button>
        </motion.div>
      )}
    </main>
  );
}
