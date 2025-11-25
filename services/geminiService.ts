
import { GoogleGenAI, Type } from "@google/genai";
import { CSRDReport } from '../types';

export const analyzeCSRDReadiness = async (
  content: { text?: string; file?: { base64: string; mimeType: string } }
): Promise<CSRDReport> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // SCORING LOGIC DEFINITION
  // This prompt section tells the AI how to generate the score.
  const prompt = `
    You are Audit Crystal, an elite AI auditor specializing in CSRD (Corporate Sustainability Reporting Directive) and ESRS compliance.
    
    Analyze the provided input and generate a structured report following strictly defined JSON schemas.

    **Step 1: Extraction**
    Identify the entity, report type, and double materiality indicators (ESRS 1).

    **Step 2: Gap Analysis**
    Compare content against ESRS 2 (General Disclosures). List mandatory disclosures and missing sections.

    **Step 3: Scoring Rubric (Scoring Logic)**
    Evaluate the readiness based on these strict criteria:
    - **Ready**: Double materiality assessment is clearly documented AND all ESRS 2 general disclosures are present.
    - **Partially Ready**: Some sustainability reporting exists (e.g., GRI references), but lacks formal double materiality or comprehensive ESRS structure.
    - **Not Ready**: Missing fundamental elements, no double materiality mention, or purely marketing-focused content.

    **Step 4: Summary Report**
    Generate an executive summary and a prioritized action roadmap.
  `;

  const parts: any[] = [{ text: prompt }];

  if (content.text) {
    parts.push({ text: `Analyze this content:\n${content.text}` });
  }

  if (content.file) {
    parts.push({
      inlineData: {
        mimeType: content.file.mimeType,
        data: content.file.base64,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extraction: {
              type: Type.OBJECT,
              description: "Schema 1: PDF Extraction Data",
              properties: {
                companyName: { type: Type.STRING, description: "Name of the entity" },
                reportType: { type: Type.STRING, description: "Type of document" },
                doubleMaterialityIndicators: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Topics identified as material"
                }
              }
            },
            gapAnalysis: {
              type: Type.OBJECT,
              description: "Schema 2: Gap Analysis",
              properties: {
                mandatoryDisclosures: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      item: { type: Type.STRING },
                      status: { type: Type.STRING, enum: ["Met", "Missing"] },
                      notes: { type: Type.STRING }
                    }
                  }
                },
                missingKeySections: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            },
            scoring: {
              type: Type.OBJECT,
              description: "Schema 3: Scoring Rubric",
              properties: {
                readinessScore: { type: Type.STRING, enum: ["Ready", "Partially Ready", "Not Ready"] },
                scoreColor: { type: Type.STRING, description: "Hex color (e.g., #10b981)" },
                scoreReasoning: { type: Type.STRING },
                checklist: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      criterion: { type: Type.STRING },
                      met: { type: Type.BOOLEAN }
                    }
                  }
                }
              }
            },
            summary: {
              type: Type.OBJECT,
              description: "Schema 4: Summary Report",
              properties: {
                executiveSummary: { type: Type.STRING },
                roadmap: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                      action: { type: Type.STRING },
                      deadline: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as CSRDReport;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
