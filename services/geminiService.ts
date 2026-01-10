
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (transactions: Transaction[]) => {
  const prompt = `Analyze these louage driver transactions (Tunisia context) and provide 3 key insights for profitability and a net profit prediction for next month.
  Transactions: ${JSON.stringify(transactions)}
  Context: Louage drivers pay a "Pack Pro" fee of 5 TND/month, which decreases by 1 TND for every 100 TND earned.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedProfit: { type: Type.NUMBER },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            optimizationTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Insight Error:", error);
    return null;
  }
};
