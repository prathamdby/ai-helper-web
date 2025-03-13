"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OcrTextDisplayProps {
  ocrText: string;
  isLoading: boolean;
}

export default function OcrTextDisplay({
  ocrText,
  isLoading,
}: OcrTextDisplayProps) {
  // State for OCR text section visibility
  const [isOcrSectionOpen, setIsOcrSectionOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-2">
        <button
          onClick={() => setIsOcrSectionOpen(!isOcrSectionOpen)}
          className="flex items-center justify-between w-full cursor-pointer outline-none"
        >
          <div className="flex items-center gap-2 font-medium">
            <Camera className="h-5 w-5 text-primary flex-shrink-0" />
            <h3 className="text-lg text-white">OCR Text</h3>
          </div>
          <div
            className={`text-white text-sm transition-transform ${
              isOcrSectionOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
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
        </button>
      </div>

      {isOcrSectionOpen && (
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
      )}
    </div>
  );
}
