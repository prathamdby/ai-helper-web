"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModelResponse {
  name: string;
  status: string;
  timeTaken?: number;
}

interface ModelResponsesDisplayProps {
  modelResponses: ModelResponse[];
  isLoading: boolean;
  question: string;
}

export default function ModelResponsesDisplay({
  modelResponses,
  isLoading,
  question,
}: ModelResponsesDisplayProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <BrainCircuit className="text-primary h-5 w-5" />
          <h3 className="text-lg text-white">AI Answers</h3>
          {modelResponses.some((m) => m.status === "Processing...") && (
            <Loader2 className="text-primary ml-1 h-4 w-4 animate-spin" />
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="min-h-[100px]">
          {isLoading ? (
            <div className="text-muted-foreground flex h-[100px] flex-col items-center justify-center">
              <Loader2 className="mb-2 h-8 w-8 animate-spin" />
              <p>Processing image...</p>
            </div>
          ) : modelResponses.length > 0 ? (
            <div className="divide-y">
              {modelResponses.map((model, index) => {
                // Determine status styling
                let statusColor = "text-muted-foreground";
                let bgColor = "";

                if (model.status === "Processing...") {
                  statusColor = "text-primary";
                  bgColor = "bg-primary/5";
                } else if (model.status.startsWith("Error:")) {
                  statusColor = "text-destructive";
                  bgColor = "bg-destructive/5";
                } else {
                  statusColor = "text-primary/80";
                  bgColor = "bg-primary/5";
                }

                return (
                  <motion.div
                    key={index}
                    className={cn(
                      "flex flex-col gap-2 p-4 sm:flex-row sm:items-center",
                      bgColor
                    )}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="min-w-[120px] font-medium">
                      {model.name}:
                    </div>

                    <div className="flex flex-1 items-center gap-2">
                      {model.status === "Processing..." ? (
                        <div
                          className={cn("flex items-center gap-2", statusColor)}
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : model.status.startsWith("Error:") ? (
                        <div className={statusColor}>{model.status}</div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className="text-lg font-bold">
                            {model.status}
                          </Badge>
                          {model.timeTaken && (
                            <span className="text-muted-foreground text-xs">
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
            <div className="text-muted-foreground flex h-[100px] items-center justify-center">
              {question ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="text-muted-foreground/70 mb-2 h-8 w-8 animate-spin" />
                  <p>Waiting for AI responses...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <BrainCircuit className="text-muted-foreground/70 mb-2 h-8 w-8" />
                  <p>No model responses available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
