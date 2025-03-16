"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy, Check, Loader2, Camera, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionDisplayProps {
  question: string;
  ocrText: string;
  isLoading: boolean;
  isSettingsConfigured: boolean;
}

export default function QuestionDisplay({
  question,
  ocrText,
  isLoading,
  isSettingsConfigured,
}: QuestionDisplayProps) {
  // State for copy button
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format question and options for display
  const formatQuestionDisplay = () => {
    if (!question) return null;

    if (question === "No question detected.") {
      return (
        <div className="text-muted-foreground text-center italic">
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
      <div className="w-full space-y-4">
        <div className="text-base leading-relaxed font-medium break-words">
          {questionText}
        </div>

        {options.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-2">
            {options.map((option, index) => {
              // Enhanced regex to match different option formats: A., A), A
              const optionMatch = option.match(/^([A-D])(?:\.|\)|)\s*(.+)$/);
              if (!optionMatch)
                return (
                  <div key={index} className="text-sm">
                    {option}
                  </div>
                );

              const [, letter, text] = optionMatch;

              return (
                <div
                  key={index}
                  className="hover:bg-accent/50 flex w-full [transform:translate3d(0,0,0)] items-start gap-2 rounded-md p-2 transition-colors duration-200 [will-change:background-color]"
                >
                  <Badge
                    variant="outline"
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center p-0"
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

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <BookOpen className="text-primary h-5 w-5" />
          <h3 className="text-lg text-white">Question</h3>
        </div>

        {(question || ocrText) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(question || ocrText)}
            className="h-8 [transform:translate3d(0,0,0)] transition-transform duration-150 active:scale-95"
          >
            {copied ? (
              <Check className="mr-1 h-4 w-4" />
            ) : (
              <Copy className="mr-1 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="min-h-[100px] p-4">
          {isLoading ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center">
              <Loader2 className="mb-2 h-8 w-8 animate-spin" />
              <p>Processing image...</p>
            </div>
          ) : question ? (
            <div className="w-full">{formatQuestionDisplay()}</div>
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-center">
              {isSettingsConfigured ? (
                <div className="flex flex-col items-center">
                  <Camera className="text-muted-foreground/70 mb-2 h-8 w-8" />
                  <p>
                    Point your camera at a question and press SPACE to analyze
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Sparkles className="text-muted-foreground/70 mb-2 h-8 w-8" />
                  <p>
                    Click the settings icon in the top-right to configure API
                    keys and models
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
