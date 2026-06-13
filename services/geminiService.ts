
import { GoogleGenAI, Type } from "@google/genai";
import { BiomechanicalMetrics } from "../types";

export const analyzeAthleticVideo = async (
  base64Video: string,
  mimeType: string
): Promise<BiomechanicalMetrics> => {
  const API_KEY = process.env.API_KEY || "";
  if (!API_KEY) {
    throw new Error("API Key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    You are 'AuraLink AI', a world-class Performance Coach and Biomechanical Expert.
    
    TASK: Analyze the athlete's movement and calculate their "Aura Score".
    
    COMMUNICATION STYLE:
    - TECHNICAL: Evaluate Stability, Explosiveness, and Injury Prevention (0-100).
    - COACH CUES: Provide 3 clear, simple 'Coach Cues' using layman terms that a beginner can understand.
    
    FORMATTING RULES (CRITICAL):
    - You MUST separate each cue into its own paragraph using double newlines.
    - Use the exact emojis below to start each paragraph:
    
    ⚡ [POWER CUE]: (Simple layman advice to increase power/speed)
    
    🛡️ [SAFETY CUE]: (Simple layman advice to prevent pain or injury)
    
    🎯 [FORM CUE]: (Simple layman advice to improve balance or technique)

    - End with a final paragraph containing a single-sentence technical summary.
    
    Return the response strictly as a JSON object. The 'auraScore' is the master metric.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Video.includes(",") ? base64Video.split(",")[1] : base64Video,
            },
          },
          {
            text: "Coach me. Provide my Aura Score and coaching cues formatted with clear paragraph breaks.",
          },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            auraScore: { type: Type.NUMBER, description: "Total Aura performance score." },
            stability: { type: Type.NUMBER, description: "Stability score 0-100." },
            explosiveness: { type: Type.NUMBER, description: "Explosiveness score 0-100." },
            injuryPrevention: { type: Type.NUMBER, description: "Injury prevention score 0-100." },
            feedback: { type: Type.STRING, description: "Coach cues separated by double newlines." },
          },
          required: ["auraScore", "stability", "explosiveness", "injuryPrevention", "feedback"],
        },
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    
    return {
      auraScore: Number(data.auraScore) || 0,
      stability: Number(data.stability) || 0,
      explosiveness: Number(data.explosiveness) || 0,
      injuryPrevention: Number(data.injuryPrevention) || 0,
      feedback: String(data.feedback || "Awaiting sensor data...")
    };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
};
