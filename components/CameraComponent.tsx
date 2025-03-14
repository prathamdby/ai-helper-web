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

  // Check if running as PWA in standalone mode
  const isPwa =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true);

  // Function to restart video stream
  const restartVideoStream = async () => {
    try {
      // Clear any existing error
      setError(null);

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Use lower resolution for PWA to improve performance
      const videoConstraints = isPwa
        ? {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 },
          }
        : {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          };

      // Get a new stream
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
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
        // Use lower resolution for PWA to improve performance
        const videoConstraints = isPwa
          ? {
              facingMode: "environment",
              width: { ideal: 640 },
              height: { ideal: 480 },
            }
          : {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
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
  }, [isSettingsConfigured, stream, isPwa]);

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

        // Set canvas dimensions once based on video dimensions
        if (canvasRef.current) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
        }

        let animationFrameId: number;
        let lastFrameTime = 0;
        // Use lower frame rate for PWA to improve performance
        const frameInterval = isPwa ? 1000 / 20 : 1000 / 30; // 20fps for PWA, 30fps otherwise

        const renderFrame = (timestamp: number) => {
          if (!video.paused && !video.ended && canvasRef.current) {
            // Throttle frame rate for better performance
            if (timestamp - lastFrameTime < frameInterval) {
              animationFrameId = requestAnimationFrame(renderFrame);
              return;
            }

            lastFrameTime = timestamp;

            const ctx = canvasRef.current.getContext("2d", { alpha: false });
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

              // Use optimized drawing
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
          animationFrameId = requestAnimationFrame(renderFrame);
        };

        animationFrameId = requestAnimationFrame(renderFrame);

        // Clean up function
        return () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
        };
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
      className="bg-muted relative mx-auto mb-6 aspect-video w-full overflow-hidden rounded-lg lg:w-3/5"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      {error ? (
        <div className="bg-destructive/20 absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-destructive mb-3 text-sm">{error}</p>
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
          className="h-full w-full"
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
          <Camera className="text-muted-foreground h-16 w-16" />
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
          className={`px-3 py-1.5 ${statusClass} flex items-center gap-2 rounded-md text-sm font-medium`}
        >
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
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
          <Card className="bg-background/80 p-3 backdrop-blur-sm">
            <div className="flex flex-col gap-2 text-xs">
              <div className="text-primary flex items-center gap-2">
                <KeySquare className="h-4 w-4" />
                <span>Controls:</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Space className="h-3 w-3" /> Capture & Analyze
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <X className="h-3 w-3" /> Clear Results
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
