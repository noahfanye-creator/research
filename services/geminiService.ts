
import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from "../types";

// Helper function to safely retrieve the API key in various environments
const getApiKey = (): string | undefined => {
  // 1. Try standard process.env (Node.js or polyfilled environments)
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore reference errors if process is not defined
  }

  // 2. Try Vite's specific import.meta.env (Browser/Vite)
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore errors
  }

  return undefined;
};

export const extractReportFromText = async (text: string): Promise<ReportData> => {
  const apiKey = getApiKey();
  
  // Debug log (remove in production if needed, but helpful for now)
  console.log("Gemini Service: Key Status:", apiKey ? "Present (Starts with " + apiKey.substring(0, 4) + ")" : "Missing");

  if (!apiKey || apiKey.trim() === '') {
    throw new Error("API Key 未检测到。请在 Netlify 环境变量中设置 'VITE_API_KEY'。");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
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
      model: 'gemini-3-flash-preview', 
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
  } catch (error: any) {
    console.error("Gemini Full Error Object:", error);
    
    // Propagate the actual error message to the UI
    let errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('401') || errorMessage.includes('API key')) {
        throw new Error("API Key 无效或未授权 (401)。请检查 Key 值是否正确。");
    }
    if (errorMessage.includes('429')) {
        throw new Error("请求太频繁 (429)。请稍后再试。");
    }
    if (errorMessage.includes('503') || errorMessage.includes('Overloaded')) {
        throw new Error("模型服务暂时繁忙 (503)。请重试。");
    }
    
    // Fallback for generic errors
    throw new Error(`系统错误: ${errorMessage}`);
  }
};
