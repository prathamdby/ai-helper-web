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
    if (isMCQ) {
      return (
        answer.trim().length === 1 &&
        "ABCD".includes(answer.trim().toUpperCase())
      );
    }
    return answer.trim().length > 0;
  }

  let prompt = "";
  if (options) {
    prompt = `Multiple Choice Question:
${question}
${options}

Instructions:
1. ONLY respond with the letter (A, B, C, or D) of the correct option
2. Do not write the full answer or any explanation
3. Just the letter, nothing else

You must respond with just A, B, C, or D.`;
  } else {
    prompt = `Answer this question concisely:
${question}

Instructions:
1. If it's a factual question (like capitals, dates, names), give the exact correct answer
2. The answer must be brief and to the point - avoid explanations or unnecessary words
3. Proper nouns should be capitalized (e.g., Delhi, Paris, Einstein)
4. Keep your response very short and focused

Your response must be clear and concise.`;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model,
          messages: [
            {
              role: "system",
              content:
                "You are a precise answering system that follows instructions exactly.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${settings.openrouterKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const answer = response.data.choices[0].message.content.trim();
      if (validateAnswer(answer, !!options)) {
        const timeTaken = (Date.now() - startTime) / 1000;
        return {
          name: model,
          status: answer,
          timeTaken,
        };
      }
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    } catch (error: any) {
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        return {
          name: model,
          status: `Error: ${error.message}`,
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

  const updatedResponses = [...responses];
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const result = await getModelResponse(question, options, model);
    updatedResponses[i] = result;
    setModelResponses(updatedResponses);
  }
  setLoading(false);
}
