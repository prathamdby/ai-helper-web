import useStore from "./store";
import axios from "axios";

interface ModelResponse {
  name: string;
  status: string;
  timeTaken?: number;
}

const MAX_RETRIES = 2;

async function getModelResponse(
  question: string,
  options: string,
  model: string
): Promise<ModelResponse> {
  const { settings } = useStore.getState();
  const startTime = Date.now();

  function validateAnswer(answer: string, isMCQ: boolean): boolean {
    if (!answer) {
      return false;
    }

    // For multiple choice questions
    if (isMCQ) {
      // Clean the answer by removing any non-alphanumeric characters
      const cleanedAnswer = answer
        .replace(/[^a-zA-Z0-9]/g, "")
        .trim()
        .toUpperCase();

      // Valid if it's a single letter A, B, C, or D
      return cleanedAnswer.length === 1 && "ABCD".includes(cleanedAnswer);
    }

    // For regular questions
    // Validate that the answer is not too long (likely means the model ignored instructions)
    // and not too short (empty or meaningless)
    const wordCount = answer.trim().split(/\s+/).length;
    const characterCount = answer.trim().length;

    // Answer should be between 1-20 words and have at least 1 character
    // This prevents extremely verbose answers while allowing for necessary complexity
    return characterCount > 0 && wordCount <= 20;
  }

  function formatAnswer(answer: string, isMCQ: boolean): string {
    if (isMCQ) {
      // For MCQ, extract just the letter and format it
      const cleanedAnswer = answer
        .replace(/[^a-zA-Z0-9]/g, "")
        .trim()
        .toUpperCase();
      if (cleanedAnswer.length === 1 && "ABCD".includes(cleanedAnswer)) {
        return cleanedAnswer;
      }
      return answer; // Return original if we can't clean it properly
    }
      // For regular questions, capitalize first letter and ensure proper ending punctuation
      let formattedAnswer = answer.trim();

      // Capitalize first letter if it's not already
      if (formattedAnswer.length > 0 && /[a-z]/.test(formattedAnswer[0])) {
        formattedAnswer =
          formattedAnswer[0].toUpperCase() + formattedAnswer.slice(1);
      }

      // Add period at the end if there's no ending punctuation and it's not a number or single word
      const hasEndingPunctuation = /[.!?]$/.test(formattedAnswer);
      const isNumberOrSingleWord =
        /^\d+$/.test(formattedAnswer) ||
        formattedAnswer.split(/\s+/).length === 1;

      if (!(hasEndingPunctuation || isNumberOrSingleWord)) {
        formattedAnswer += ".";
      }

      return formattedAnswer;
  }

  let prompt = "";
  if (options) {
    prompt = `Multiple Choice Question:
${question}
${options}

Instructions:
1. You MUST respond with ONLY the letter of the correct answer: A, B, C, or D
2. Do not include any explanation, reasoning, or additional text
3. Do not repeat the question or options
4. Do not prefix your answer with "Answer:" or similar text
5. Your entire response must be a single letter: A, B, C, or D

Respond with exactly one letter.`;
  } else {
    prompt = `Question:
${question}

Instructions:
1. Provide the most accurate and factually correct answer
2. Your answer must be extremely concise - ideally 1-5 words only
3. For numerical answers, use digits (e.g., "42" not "forty-two")
4. For dates, use standard format (e.g., "May 15, 1989" or "1989")
5. For proper nouns, use correct capitalization (e.g., "Paris", "Einstein")
6. Do not include explanations, reasoning, or additional context
7. Do not use bullet points or formatting
8. Do not repeat or rephrase the question

Your response must be the shortest possible correct answer.`;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert question-answering system designed to provide precise, accurate answers with absolute minimal verbosity. You follow instructions exactly and never include explanations or additional text beyond what was requested. Your goal is to provide the most accurate answer in the most concise format possible.\n\nFor mathematical questions: Provide the final numerical answer with appropriate units if applicable.\nFor scientific questions: Use proper scientific notation and terminology.\nFor factual questions: Provide the most widely accepted factual answer.\nFor historical questions: Provide accurate dates, names, and locations.\nFor definitional questions: Provide concise, accurate definitions.\n\nAlways prioritize accuracy over brevity, but aim for both.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
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
        return {
          name: model,
          status: "Error: No response from model",
        };
      }

      const answer = choices[0].message.content.trim();
      if (validateAnswer(answer, !!options)) {
        const timeTaken = (Date.now() - startTime) / 1000;
        return {
          name: model,
          status: formatAnswer(answer, !!options),
          timeTaken,
        };
      }

      // If we get an invalid response, try to fix it with a follow-up prompt
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying

        try {
          // Create a follow-up prompt to fix the invalid response
          let fixPrompt = "";
          if (options) {
            fixPrompt = `Your previous answer "${answer}" was invalid. 
            
I need ONLY a single letter (A, B, C, or D) as the answer to this multiple choice question.
Do not include any other text, explanation, or punctuation.
Just respond with exactly one letter: A, B, C, or D.`;
          } else {
            fixPrompt = `Your previous answer "${answer}" was invalid or too verbose.

Please provide an extremely concise answer (1-5 words if possible).
Do not include any explanation or additional context.
Just the direct answer and nothing else.`;
          }

          // Send the follow-up prompt
          const fixResponse = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              model,
              messages: [
                {
                  role: "system",
                  content:
                    "You are an expert question-answering system that follows instructions exactly. Provide only the exact answer requested with no additional text.",
                },
                { role: "user", content: prompt },
                { role: "assistant", content: answer },
                { role: "user", content: fixPrompt },
              ],
              temperature: 0.1,
            },
            {
              headers: {
                Authorization: `Bearer ${settings.openrouterKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          const fixedAnswer =
            fixResponse.data.choices[0].message.content.trim();
          if (validateAnswer(fixedAnswer, !!options)) {
            const timeTaken = (Date.now() - startTime) / 1000;
            return {
              name: model,
              status: formatAnswer(fixedAnswer, !!options),
              timeTaken,
            };
          }
        } catch (error) {
          // If the fix attempt fails, continue with the regular retry
          console.error("Error attempting to fix invalid response:", error);
        }
      }

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    } catch (error: unknown) {
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        return {
          name: model,
          status: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        };
      }
    }
  }
  return {
    name: model,
    status: options ? "Invalid response" : "Unknown",
  };
}

export async function getAllModelResponses(
  question: string,
  options: string
): Promise<void> {
  const { settings, setModelResponses, setLoading } = useStore.getState();
  const models = settings.selectedModels;

  const responses: ModelResponse[] = models.map((model) => ({
    name: model,
    status: "Processing...",
  }));
  setModelResponses(responses);
  setLoading(true);

  try {
    const responsePromises = models.map((model, index) =>
      getModelResponse(question, options, model).then((result) => {
        const updatedResponses = [...useStore.getState().modelResponses];
        updatedResponses[index] = result;
        setModelResponses(updatedResponses);
        return result;
      })
    );

    await Promise.all(responsePromises);
  } catch (error) {
    console.error("Error processing model responses:", error);
  } finally {
    setLoading(false);
  }
}
