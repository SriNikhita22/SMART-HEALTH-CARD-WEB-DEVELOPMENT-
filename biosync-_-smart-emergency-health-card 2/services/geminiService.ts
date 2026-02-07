import { GoogleGenAI } from "@google/genai";
import { UserHealthData, TimelineEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Internal session cache to prevent redundant API calls
const insightCache = new Map<string, string>();
const summaryCache = new Map<string, string>();

/**
 * Utility for graceful retries on rate limits (429)
 */
async function callWithRetry(fn: () => Promise<any>, retries = 1, delay = 2000): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toUpperCase();
    const isQuotaError = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || (error?.status === 429);
    
    if (isQuotaError && retries > 0) {
      console.warn(`Gemini API Quota reached. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getHealthInsight(data: UserHealthData) {
  // Generate a key based on the primary medical indicators
  const cacheKey = `insight_${data.fullName}_${data.bloodGroup}_${data.allergies}_${data.chronicDiseases}_${data.currentMedications}`;
  
  if (insightCache.has(cacheKey)) {
    return insightCache.get(cacheKey)!;
  }

  try {
    const prompt = `Act as an Emergency Medicine Specialist. Based on the profile below, provide 3 critical ACTION-ORIENTED bullets for paramedics or responders. 
    Use direct, punchy commands (e.g., "Check glucose", "Avoid Ibuprofen"). Do not use complex jargon.
    
    Name: ${data.fullName}
    Gender: ${data.gender || 'Unknown'}
    Blood Group: ${data.bloodGroup}
    Physical: ${data.height ? data.height + 'cm' : 'N/A'}, ${data.weight ? data.weight + 'kg' : 'N/A'} (BMI: ${data.bmi || 'N/A'})
    Allergies: ${data.allergies}
    Chronic: ${data.chronicDiseases}
    Meds: ${data.currentMedications}
    
    Output 3 short lines max. Be decisive.`;

    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a specialized emergency medicine assistant providing instant, non-jargon life-saving instructions to responders.",
        temperature: 0.5,
      }
    }));

    const text = response.text || "No actionable insights available.";
    insightCache.set(cacheKey, text);
    return text;
  } catch (error: any) {
    console.error("Gemini Insight Error:", error);
    const errorStr = JSON.stringify(error).toUpperCase();
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      return "⚠️ PROTOCOL: SYSTEM CAPACITY REACHED.\n• CHECK ABC (AIRWAY, BREATHING, CIRCULATION)\n• VERIFY ALLERGIES MANUALLY\n• CONTACT POISON CONTROL IF APPLICABLE";
    }
    return "• Standard medical precautions advised\n• Check vital signs immediately\n• Review physical ID cards";
  }
}

export async function getCareChainSummary(events: TimelineEvent[]) {
  if (events.length === 0) return "• No records found\n• History empty\n• Monitoring required";
  
  // Cache key based on event IDs and last modified timestamps
  const cacheKey = `summary_${events.map(e => e.id + (e.lastModified || '')).join('_')}`;
  
  if (summaryCache.has(cacheKey)) {
    return summaryCache.get(cacheKey)!;
  }

  try {
    const eventsStr = events.map(e => `${e.date} - ${e.category}: ${e.title}`).join('\n');
    const prompt = `Review these medical records and provide a 'Current Health Snapshot'. 
    STRICT REQUIREMENT: MAXIMUM 3 bullet points total. 
    Each bullet must start with '•'. 
    Be extremely brief, punchy, and professional. Remove all introductory or concluding text.
    
    Example format:
    • 1 Pending Lab Result
    • No recent surgeries
    • 2 Active Medications
    
    Current Data:
    ${eventsStr}`;

    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an ultra-efficient clinical coordinator providing summarized health snapshots in exactly 3 bullet points.",
        temperature: 0.1,
      }
    }));

    const text = response.text || "• Status stable\n• No major updates\n• Review history";
    summaryCache.set(cacheKey, text);
    return text;
  } catch (error: any) {
    console.error("Gemini CareChain Error:", error);
    const errorStr = JSON.stringify(error).toUpperCase();
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      return "• Analysis service offline\n• Review individual logs\n• Quota limit reached";
    }
    return "• Review full history\n• AI summary temporarily unavailable\n• Check individual logs";
  }
}
