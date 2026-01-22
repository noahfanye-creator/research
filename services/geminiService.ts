import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from "../types";

export const extractReportFromText = async (text: string): Promise<ReportData> => {
  // Use process.env.API_KEY directly as per guidelines.
  // Assume it is pre-configured and available.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Update prompt to enforce Chinese content with English headers/terminology
  const prompt = `
    You are a Senior Equity Research Editor at a top-tier global investment bank. 
    Your task is to take the provided unstructured user notes and format them into a professional Institutional Equity Research Report JSON.

    User Notes:
    """
    ${text}
    """

    **CRITICAL INSTRUCTIONS:**
    1. **Dynamic Structure**: Do NOT force the content into fixed "Summary/Thesis/Valuation" buckets if they don't fit. Instead, create a list of **sections** based on the topics found in the User Notes.
    2. **Content Preservation**: Retain ALL details, numbers, and logic from the user notes. Do not summarize to the point of data loss.
    3. **Language**: Write the main analysis in **Professional Chinese (Mandarin)**.
    4. **Terminology**: Use English for financial metrics (e.g., "CAGR", "EBITDA").
    5. **Price Trend**: Estimate or simulate a 7-day closing price array (length 7) based on the sentiment. If the note says "surged", the numbers should go up. If "crashed", down. If neutral or unknown, use a realistic random walk around the current price.
    6. **Key Metrics**: Extract at least 4-5 key financial figures.

    Generate the JSON content.
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
                analyst: { type: Type.STRING },
                priceTrend: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER },
                    description: "Array of 7 numbers representing the last 7 days closing prices for a sparkline chart."
                }
              }
            },
            content: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Section header (e.g., 'Investment Summary', '2Q24 Review', 'Valuation')" },
                      body: { type: Type.STRING, description: "The content of the section. Use Markdown bold for emphasis." }
                    }
                  }
                },
                keyRisks: { type: Type.STRING },
                conclusion: { type: Type.STRING, description: "The final verdict, recommendation, or closing summary." }
              }
            },
            keyMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "Metric name (e.g. 'P/E (TTM)')" },
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
    
    // Catch Network/VPN issues specifically
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
        throw new Error("网络连接失败。请确保您已开启 VPN/代理 并且可以访问 Google 服务。(中国大陆无法直接连接 Gemini API)");
    }

    if (errorMessage.includes('401') || errorMessage.includes('API key')) {
        throw new Error("API Key 无效或未授权 (401)。请检查 Key 是否正确。");
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