
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from "../types";

export const extractReportFromText = async (text: string): Promise<ReportData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Update prompt to enforce Chinese content with English headers/terminology
  const prompt = `
    You are a Senior Equity Research Editor at a top-tier global investment bank (like Goldman Sachs, UBS, or Morgan Stanley). 
    Your task is to take the provided unstructured user notes and format them into a professional Institutional Equity Research Report JSON.

    User Notes:
    """
    ${text}
    """

    **CRITICAL STYLE INSTRUCTIONS (High-End Bilingual Style):**
    1. **Language**: Write the main analysis (Summary, Thesis, Valuation, Risks) in **Professional Chinese (Mandarin)**.
    2. **Terminology**: Use English for specific financial metrics (e.g., "CAGR", "EBITDA", "RSI", "PE Ratio") and proper nouns where appropriate to create a "premium global" feel.
    3. **Tone**: Objective, sophisticated, institutional. Avoid casual language.
    4. **Content Logic**:
       - **Headline**: Catchy Chinese headline summarizing the core view.
       - **Investment Thesis**: Why buy/sell now? What is the market missing? (Write in Chinese).
       - **Valuation**: Justify the price target using multiples or technicals (Write in Chinese).
       - **Risks**: What could go wrong? (Write in Chinese).

    Instructions:
    1. Extract company name, ticker, rating (BUY/SELL/HOLD), and prices.
    2. Generate the JSON content based on the notes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meta: {
              type: Type.OBJECT,
              properties: {
                ticker: { type: Type.STRING },
                companyName: { type: Type.STRING },
                rating: { type: Type.STRING, enum: ['BUY', 'SELL', 'HOLD', 'NEUTRAL', 'OVERWEIGHT'] },
                targetPrice: { type: Type.STRING },
                currentPrice: { type: Type.STRING },
                date: { type: Type.STRING },
                analyst: { type: Type.STRING }
              }
            },
            content: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                summary: { type: Type.STRING },
                investmentThesis: { type: Type.STRING },
                keyRisks: { type: Type.STRING },
                valuation: { type: Type.STRING }
              }
            },
            keyMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "Keep standard metric names in English (e.g. 'P/E (TTM)', 'EPS')" },
                  value: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const rawText = response.text || "{}";
    const cleanText = rawText.replace(/```json\n?|\n?```/g, '').trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to generate report. The content might be too long or complex.");
  }
};
