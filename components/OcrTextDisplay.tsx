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
          className="flex w-full cursor-pointer items-center justify-between outline-none"
        >
          <div className="flex items-center gap-2 font-medium">
            <Camera className="h-5 w-5 flex-shrink-0 text-primary" />
            <h3 className="text-lg text-white">OCR Text</h3>
          </div>
          <div
            className={`text-sm text-white transition-transform ${
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
        <Card className="mt-2 overflow-hidden">
          <div className="min-h-[100px] whitespace-pre-wrap break-words p-4 font-mono text-sm">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                <p>Processing image...</p>
              </div>
            ) : ocrText ? (
              ocrText
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No OCR text available
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
