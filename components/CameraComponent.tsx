"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Space, Camera, X, KeySquare, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CameraComponentProps {
  isMobile: boolean;
  capture: () => Promise<void>;
  clear: () => void;
  isLoading: boolean;
  isSettingsConfigured: boolean;
}

export default function CameraComponent({
  isMobile,
  capture,
  clear,
  isLoading,
  isSettingsConfigured,
}: CameraComponentProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Function to restart video stream
  const restartVideoStream = async () => {
    try {
      // Clear any existing error
      setError(null);

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Get a new stream
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      setStream(newStream);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
        });
        setStream(stream);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
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
  }, [isSettingsConfigured, stream]);

  useEffect(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("autoplay", "");
    videoRef.current = video;

    if (stream) {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        // Handle play as a promise with proper error handling
        const playVideo = async () => {
          try {
            await video.play();
          } catch (err) {
            console.error("Error playing video:", err);
            setError(
              "Browser blocked video autoplay. Click 'Restart Camera' to try again."
            );
          }
        };

        playVideo();

        const renderFrame = () => {
          if (!video.paused && !video.ended && canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              // Make sure canvas dimensions are set correctly
              if (!canvasRef.current.width || !canvasRef.current.height) {
                canvasRef.current.width = video.videoWidth;
                canvasRef.current.height = video.videoHeight;
              }

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
              const destX = 0;
              const destY = 0;
              const destWidth = canvasWidth;
              const destHeight = canvasHeight;

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

  // Determine status and styling based on app state
  const getStatusInfo = () => {
    let statusText = "Unknown";
    let statusClass = "bg-muted/20 text-muted-foreground";

    if (!isSettingsConfigured) {
      statusText = "Settings Required";
      statusClass = "bg-destructive/20 text-destructive";
    } else if (error) {
      statusText = "Camera Error";
      statusClass = "bg-destructive/20 text-destructive";
    } else if (isLoading) {
      statusText = "Processing...";
      statusClass = "bg-primary/20 text-primary";
    } else if (!stream) {
      statusText = "Initializing Camera";
      statusClass = "bg-primary/10 text-primary/80";
    } else {
      statusText = "Ready";
      statusClass = "bg-primary/30 text-primary";
    }

    return { statusText, statusClass };
  };

  const { statusText, statusClass } = getStatusInfo();

  return (
    <motion.div
      className="relative w-full lg:w-3/5 mx-auto aspect-video bg-muted rounded-lg overflow-hidden mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20">
          <p className="text-destructive text-sm mb-3">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={restartVideoStream}
            className="bg-background/80"
          >
            Restart Camera
          </Button>
        </div>
      ) : stream ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onClick={() => {
            // Try to play video on user interaction (helps with Safari)
            if (
              videoRef.current &&
              (videoRef.current.paused || videoRef.current.ended)
            ) {
              videoRef.current.play().catch((err) => {
                console.error("Failed to play video on click:", err);
              });
            }
          }}
        />
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
        <div
          className={`px-3 py-1.5 ${statusClass} rounded-md text-sm font-medium flex items-center gap-2`}
        >
          {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          {statusText}
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
              <div className="flex items-center gap-2 text-primary">
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
  );
}
