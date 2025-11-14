import { GoogleGenAI } from "@google/genai";
import { EMBEDDING_MODEL } from "@/constants";

const ai = new GoogleGenAI({});

export const generateEmbedding = async (
  text: string
): Promise<number[] | null> => {
  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
    });

    if (!response.embeddings?.[0]?.values?.length) {
      return null;
    }

    const values = response.embeddings[0].values;
    return values;
  } catch (error) {
    console.error("Embedding Generation Error:", error);
    return null;
  }
};
