"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Space,
  Camera,
  X,
  KeySquare,
  Loader2,
  Copy,
  Check,
  BookOpen,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import useStore from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getAllModelResponses } from "@/lib/model-responses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // State for copy button
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          model: "google/gemini-2.0-pro-exp-02-05:free",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract text from this image with high accuracy:

If it's a multiple choice question, format EXACTLY as:
Question: <full question text>
Options: A. <option A text>
B. <option B text>
C. <option C text>
D. <option D text>

If it's a regular question without options, format EXACTLY as:
Question: <full question text>

Important instructions:
1. Preserve ALL text exactly as written in the image
2. Include the full question text, not just a summary
3. For multiple choice, include the letter (A, B, C, D) with each option
4. Maintain proper formatting of mathematical equations, symbols, and special characters
5. If the image contains multiple questions, focus on the most prominent one
6. ONLY return a Question: line if you detect an actual question in the image
7. If no question is detected, return empty string

Return ONLY the formatted text without any additional explanation.`,
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

      const choices = response.data.choices;
      if (!choices || choices.length === 0) {
        setOcrText("Error: No response from model");
        setLoading(false);
        return;
      }

      const detectedText = choices[0].message.content.trim();
      setOcrText(detectedText);

      let question = "";
      let options = "";
      let isOptionsSection = false;
      const lines = detectedText.split("\n");

      // First, try to extract the question
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("Question:")) {
          question = line.replace("Question:", "").trim();
          break;
        }
      }

      // Then, extract all options with different approaches to ensure we catch them all
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip the question line
        if (line.startsWith("Question:")) continue;

        // Check for Options: header
        if (line.startsWith("Options:")) {
          isOptionsSection = true;
          // If the options are on the same line (e.g., "Options: A. Option")
          const optionOnSameLine = line.replace("Options:", "").trim();
          if (optionOnSameLine.match(/^[A-D](?:\.|\)|\s)/)) {
            options = optionOnSameLine;
          }
          continue;
        }

        // Detect option lines in various formats
        if (
          line.match(/^[A-D](?:\.|\)|\s)/) ||
          (isOptionsSection && line.length > 0)
        ) {
          if (options === "") {
            options = line;
          } else {
            options += "\n" + line;
          }
        }
      }

      console.log("Parsed question:", question);
      console.log("Parsed options:", options);

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
      const keyActions = { Space: capture, KeyX: clear };

      if (e.code in keyActions) {
        e.preventDefault();
        keyActions[e.code as keyof typeof keyActions]?.();
      }
    };

    if (!isMobile && isSettingsConfigured) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, isSettingsConfigured, capture, clear]);

  // Format question and options for display
  const formatQuestionDisplay = () => {
    if (!question) return null;

    if (question === "No question detected.") {
      return (
        <div className="text-center text-muted-foreground italic">
          No question detected in the image
        </div>
      );
    }

    // More robust parsing of question and options
    const lines = question.split("\n");
    let questionText = lines[0];
    let optionLines: string[] = [];

    // If the first line contains both question and option, separate them
    if (
      questionText.includes("A)") ||
      questionText.includes("A.") ||
      questionText.includes("A ")
    ) {
      const optionStartIndex = Math.min(
        questionText.indexOf("A)") >= 0 ? questionText.indexOf("A)") : Infinity,
        questionText.indexOf("A.") >= 0 ? questionText.indexOf("A.") : Infinity,
        questionText.indexOf("A ") >= 0 ? questionText.indexOf("A ") : Infinity
      );

      if (optionStartIndex !== Infinity) {
        optionLines.push(questionText.substring(optionStartIndex));
        questionText = questionText.substring(0, optionStartIndex).trim();
      }
    }

    // Add remaining lines as options
    if (lines.length > 1) {
      optionLines = [...optionLines, ...lines.slice(1)];
    }

    // Process option lines to ensure they're properly formatted
    const processedOptions = optionLines.map((line) => {
      // If line doesn't start with A-D, but contains A-D with delimiter, split it
      if (
        !line.match(/^[A-D](?:\.|\)|\s)/) &&
        (line.includes("A)") ||
          line.includes("A.") ||
          line.includes("B)") ||
          line.includes("B.") ||
          line.includes("C)") ||
          line.includes("C.") ||
          line.includes("D)") ||
          line.includes("D."))
      ) {
        // Find the first option indicator
        const optionStartIndex = Math.min(
          line.indexOf("A)") >= 0 ? line.indexOf("A)") : Infinity,
          line.indexOf("A.") >= 0 ? line.indexOf("A.") : Infinity,
          line.indexOf("B)") >= 0 ? line.indexOf("B)") : Infinity,
          line.indexOf("B.") >= 0 ? line.indexOf("B.") : Infinity,
          line.indexOf("C)") >= 0 ? line.indexOf("C)") : Infinity,
          line.indexOf("C.") >= 0 ? line.indexOf("C.") : Infinity,
          line.indexOf("D)") >= 0 ? line.indexOf("D)") : Infinity,
          line.indexOf("D.") >= 0 ? line.indexOf("D.") : Infinity
        );

        if (optionStartIndex !== Infinity) {
          return line.substring(optionStartIndex);
        }
      }
      return line;
    });

    // Extract individual options with proper formatting
    const options: string[] = [];
    let currentOption = "";

    processedOptions.forEach((line) => {
      // If this line starts a new option
      if (line.match(/^[A-D](?:\.|\)|\s)/)) {
        if (currentOption) {
          options.push(currentOption);
        }
        currentOption = line;
      } else if (currentOption) {
        // This is a continuation of the previous option
        currentOption += " " + line;
      } else {
        // This is the first line and it's an option
        currentOption = line;
      }
    });

    // Add the last option
    if (currentOption) {
      options.push(currentOption);
    }

    return (
      <div className="space-y-4 w-full">
        <div className="text-base font-medium leading-relaxed break-words">
          {questionText}
        </div>

        {options.length > 0 && (
          <div className="grid grid-cols-1 gap-2 w-full">
            {options.map((option, index) => {
              // Enhanced regex to match different option formats: A., A), A
              const optionMatch = option.match(/^([A-D])(?:\.|\)|)\s*(.+)$/);
              if (!optionMatch)
                return (
                  <div key={index} className="text-sm">
                    {option}
                  </div>
                );

              const [_, letter, text] = optionMatch;

              return (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors w-full"
                >
                  <Badge
                    variant="outline"
                    className="mt-0.5 h-6 w-6 flex-shrink-0 flex items-center justify-center p-0"
                  >
                    {letter}
                  </Badge>
                  <span className="text-sm break-words">{text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Helper to determine if we have any completed model responses
  const hasCompletedResponses = modelResponses.some(
    (model) =>
      model.status !== "Processing..." && !model.status.startsWith("Error:")
  );

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
            {(() => {
              // Determine status and styling based on app state
              let statusText = "Unknown";
              let statusClass = "bg-gray-500/20 text-gray-500";

              if (!isSettingsConfigured) {
                statusText = "Settings Required";
                statusClass = "bg-red-500/20 text-red-500";
              } else if (error) {
                statusText = "Camera Error";
                statusClass = "bg-red-500/20 text-red-500";
              } else if (isLoading) {
                statusText = "Processing...";
                statusClass = "bg-blue-500/20 text-blue-500";
              } else if (!stream) {
                statusText = "Initializing Camera";
                statusClass = "bg-orange-500/20 text-orange-500";
              } else if (
                ocrText &&
                question &&
                question !== "No question detected."
              ) {
                // Check if any model is still processing
                const anyModelProcessing = modelResponses.some(
                  (model) => model.status === "Processing..."
                );

                if (anyModelProcessing) {
                  statusText = "Models Processing...";
                  statusClass = "bg-blue-500/20 text-blue-500";
                } else {
                  statusText = "Analysis Complete";
                  statusClass = "bg-green-500/20 text-green-500";
                }
              } else {
                statusText = "Ready";
                statusClass = "bg-yellow-500/20 text-yellow-500";
              }

              return (
                <div
                  className={`px-3 py-1.5 ${statusClass} rounded-md text-sm font-medium flex items-center gap-2`}
                >
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {statusText}
                </div>
              );
            })()}
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
          {/* Stacked Results Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full space-y-4"
          >
            {/* Question Section */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-medium">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg">Question</h3>
                </div>

                {(question || ocrText) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(question || ocrText)}
                    className="h-8"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>

              <Card className="overflow-hidden">
                <div className="p-4 min-h-[100px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Processing image...</p>
                    </div>
                  ) : question ? (
                    <div className="w-full">{formatQuestionDisplay()}</div>
                  ) : (
                    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                      {isSettingsConfigured ? (
                        <div className="flex flex-col items-center">
                          <Camera className="h-8 w-8 mb-2 text-muted-foreground/70" />
                          <p>
                            Point your camera at a question and press SPACE to
                            analyze
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Sparkles className="h-8 w-8 mb-2 text-muted-foreground/70" />
                          <p>
                            Click the settings icon in the top-right to
                            configure API keys and models
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* AI Answers Section */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-medium">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  <h3 className="text-lg">AI Answers</h3>
                  {modelResponses.some((m) => m.status === "Processing...") && (
                    <Loader2 className="h-4 w-4 animate-spin ml-1 text-blue-500" />
                  )}
                </div>
              </div>

              <Card className="overflow-hidden">
                <div className="min-h-[100px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground h-[100px]">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Processing image...</p>
                    </div>
                  ) : modelResponses.length > 0 ? (
                    <div className="divide-y">
                      {modelResponses.map((model, index) => {
                        // Determine status styling
                        let statusColor = "text-muted-foreground";
                        let bgColor = "";

                        if (model.status === "Processing...") {
                          statusColor = "text-blue-500";
                          bgColor = "bg-blue-500/5";
                        } else if (model.status.startsWith("Error:")) {
                          statusColor = "text-red-500";
                          bgColor = "bg-red-500/5";
                        } else {
                          statusColor = "text-green-500";
                          bgColor = "bg-green-500/5";
                        }

                        return (
                          <motion.div
                            key={index}
                            className={cn(
                              "flex flex-col sm:flex-row sm:items-center gap-2 p-4",
                              bgColor
                            )}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="font-medium min-w-[120px]">
                              {model.name}:
                            </div>

                            <div className="flex-1 flex items-center gap-2">
                              {model.status === "Processing..." ? (
                                <div
                                  className={cn(
                                    "flex items-center gap-2",
                                    statusColor
                                  )}
                                >
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Processing...</span>
                                </div>
                              ) : model.status.startsWith("Error:") ? (
                                <div className={statusColor}>
                                  {model.status}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge className="text-lg font-bold">
                                    {model.status}
                                  </Badge>
                                  {model.timeTaken && (
                                    <span className="text-xs text-muted-foreground">
                                      {model.timeTaken.toFixed(2)}s
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[100px] text-muted-foreground">
                      {question ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-8 w-8 mb-2 text-muted-foreground/70 animate-spin" />
                          <p>Waiting for AI responses...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <BrainCircuit className="h-8 w-8 mb-2 text-muted-foreground/70" />
                          <p>No model responses available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* OCR Text Section (Collapsible) */}
            <div className="w-full">
              <details className="group">
                <summary className="flex items-center justify-between mb-2 cursor-pointer list-none">
                  <div className="flex items-center gap-2 font-medium">
                    <Camera className="h-5 w-5 text-primary" />
                    <h3 className="text-lg">OCR Text</h3>
                  </div>
                  <div className="text-muted-foreground text-sm group-open:rotate-180 transition-transform">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </summary>

                <Card className="overflow-hidden mt-2">
                  <div className="p-4 min-h-[100px] font-mono text-sm whitespace-pre-wrap break-words">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Processing image...</p>
                      </div>
                    ) : ocrText ? (
                      ocrText
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No OCR text available
                      </div>
                    )}
                  </div>
                </Card>
              </details>
            </div>
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
      )}
    </main>
  );
}
