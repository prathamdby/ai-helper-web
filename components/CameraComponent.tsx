"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Space, Camera, X, KeySquare, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CameraComponentProps {
  isMobile: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  error: string | null;
  setError: (error: string | null) => void;
  isLoading: boolean;
  isSettingsConfigured: boolean;
  capture: () => Promise<void>;
  clear: () => void;
}

export default function CameraComponent({
  isMobile,
  videoRef,
  canvasRef,
  error,
  setError,
  isLoading,
  isSettingsConfigured,
  capture,
  clear,
}: CameraComponentProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  // Function to restart video stream
  const restartVideoStream = async () => {
    try {
      // Clear any existing error
      setError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }

      // Get a new stream with consistent constraints
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Store stream in ref to ensure proper cleanup
      streamRef.current = newStream;
      setStream(newStream);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  // Initialize camera stream
  useEffect(() => {
    let mounted = true;

    const getCameraStream = async () => {
      try {
        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          streamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        // Only set state if component is still mounted
        if (mounted) {
          streamRef.current = stream;
          setStream(stream);
        } else {
          // If unmounted, clean up the stream
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }
      } catch (err: unknown) {
        if (mounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred");
          }
        }
      }
    };

    if (isSettingsConfigured) {
      getCameraStream();

      // Set up periodic camera refresh to prevent lag buildup
      // Only in PWA or mobile contexts where lag is more likely
      if (
        typeof window !== "undefined" &&
        (window.matchMedia("(display-mode: standalone)").matches ||
          ("standalone" in window.navigator &&
            (window.navigator as Navigator & { standalone?: boolean })
              .standalone === true) ||
          isMobile)
      ) {
        // Clear any existing timer
        if (refreshTimerRef.current) {
          window.clearInterval(refreshTimerRef.current);
        }

        // Refresh camera every 30 seconds to prevent lag buildup
        refreshTimerRef.current = window.setInterval(() => {
          if (!isLoading && mounted) {
            console.log("Performing periodic camera refresh");
            getCameraStream();
          }
        }, 30000); // 30 seconds
      }
    }

    // Cleanup function
    return () => {
      mounted = false;

      // Clear refresh timer
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, [isSettingsConfigured, isMobile, isLoading, setError]);

  // Set video srcObject when stream changes
  useEffect(() => {
    const currentVideoRef = videoRef.current;

    if (currentVideoRef && stream) {
      currentVideoRef.srcObject = stream;

      // Add event listeners to handle potential errors
      const handleVideoError = () => {
        setError("Video playback error. Please try restarting the camera.");
      };

      // Handle stalled or frozen video
      const handleVideoStalled = () => {
        console.log("Video playback stalled, attempting recovery");
        if (currentVideoRef) {
          // Try to recover by restarting playback
          currentVideoRef.pause();
          setTimeout(() => {
            if (currentVideoRef) {
              currentVideoRef.play().catch((err) => {
                console.error("Failed to restart stalled video:", err);
              });
            }
          }, 100);
        }
      };

      currentVideoRef.addEventListener("error", handleVideoError);
      currentVideoRef.addEventListener("stalled", handleVideoStalled);
      currentVideoRef.addEventListener("freeze", handleVideoStalled);

      return () => {
        if (currentVideoRef) {
          currentVideoRef.removeEventListener("error", handleVideoError);
          currentVideoRef.removeEventListener("stalled", handleVideoStalled);
          currentVideoRef.removeEventListener("freeze", handleVideoStalled);
          currentVideoRef.srcObject = null;
        }
      };
    }
  }, [stream, videoRef, setError]);

  // Handle keyboard shortcuts
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
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{
              transform: "translateZ(0)", // Hardware acceleration hint
              backfaceVisibility: "hidden", // Reduce composite layers
              willChange: "transform", // Hint for browser optimization
            }}
          />
          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </>
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
