"use client";

import axios from "axios";
import useStore from "@/lib/store";
import { getAllModelResponses } from "@/lib/model-responses";

interface CaptureLogicProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setError: (error: string | null) => void;
}

export default function CaptureLogic({
  canvasRef,
  videoRef,
  setError,
}: CaptureLogicProps) {
  const { setOcrText, setQuestion, setModelResponses, settings, setLoading } =
    useStore();

  const capture = async () => {
    setLoading(true);

    // Clear any previous error
    setError(null);

    if (!canvasRef.current) {
      setError("Camera not available.");
      setLoading(false);
      return;
    }

    try {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) {
        setError("Could not get canvas context.");
        setLoading(false);
        return;
      }

      // If video is paused or ended, try to restart it
      if (
        videoRef.current &&
        (videoRef.current.paused || videoRef.current.ended)
      ) {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error("Failed to restart video on capture:", err);
          // Continue anyway, we'll use whatever is on the canvas
        }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  const clear = () => {
    setModelResponses([]);
    setError(null);
    setOcrText("");
    setQuestion("");
  };

  return { capture, clear };
}
