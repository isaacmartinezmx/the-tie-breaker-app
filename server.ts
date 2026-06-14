import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client to prevent crashing on boot if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API for decision creation
app.post("/api/decide", async (req, res): Promise<any> => {
  try {
    const { decision, type } = req.body;

    if (!decision || typeof decision !== "string") {
      return res.status(400).json({ error: "A clear decision description is required." });
    }

    if (!type || !["pros-cons", "comparison", "swot"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing decision analysis type." });
    }

    const ai = getGeminiClient();

    let responseSchema: any;
    let systemInstruction = "";

    if (type === "pros-cons") {
      systemInstruction = `You are "The Tie Breaker" decision specialist.
A user has input a decision dilemma. Your task is to generate a comprehensive Pros and Cons list.
Break down the choice, identify the main target action, and extract 4-6 balanced Pros and 4-6 Cons.
Give each point:
- 'text': Short elegant summary of the point
- 'weight': scale of 1 to 5 (importance score, where 5 is critical, 1 is minor)
- 'category': e.g., Financial, Lifestyle, Health, Career, Time, etc.
- 'description': Short explanation of the point
Provide a comprehensive overview of the dilema in 'summary' and a smart 'recommendation' based on values.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          decisionName: { 
            type: Type.STRING, 
            description: "A refined, short, catchy, action-oriented title for the decision" 
          },
          summary: { 
            type: Type.STRING, 
            description: "A comprehensive, empathetic, 2-sentence summary illustrating the user's psychological or physical trade-off." 
          },
          pros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The active pro statement (e.g., 'Lower operational fuel costs')" },
                weight: { type: Type.INTEGER, description: "Importance score from 1 to 5" },
                category: { type: Type.STRING, description: "Group categorizer (e.g. Financial, Environment, Comfort)" },
                description: { type: Type.STRING, description: "One-sentence grounding description" }
              },
              required: ["text", "weight", "category", "description"]
            }
          },
          cons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The active con statement (e.g., 'Higher initial battery-related purchase price')" },
                weight: { type: Type.INTEGER, description: "Negative importance score from 1 to 5" },
                category: { type: Type.STRING, description: "Group categorizer" },
                description: { type: Type.STRING, description: "One-sentence grounding description" }
              },
              required: ["text", "weight", "category", "description"]
            }
          },
          recommendation: { 
            type: Type.STRING, 
            description: "A highly specific, insightful recommendation weighing these exact metrics to nudge the user to clear action." 
          }
        },
        required: ["decisionName", "summary", "pros", "cons", "recommendation"]
      };

    } else if (type === "comparison") {
      systemInstruction = `You are "The Tie Breaker" decision specialist.
A user is trying to choose between competing alternatives.
Extrapolate the exact 2 or 3 distinct options/solutions from the user's prompt (e.g. if prompt is 'Hybrid vs EV car', options is ['Hybrid Car', 'Electric Car']).
Then, define 4-6 logical comparison criteria (e.g., 'Upfront Investment', 'Weekly Maintenance', 'Enjoyment', 'Convenience').
For each criterion, assign a score (1 to 10) for each of the options, with a short contrastive comparison explanation.
Provide a refined name in 'decisionName', an overview in 'summary', and a tailored synthesized 'recommendation'.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          decisionName: { 
            type: Type.STRING, 
            description: "A short Action-oriented Title comparing these options" 
          },
          summary: { 
            type: Type.STRING, 
            description: "Introductory 2-sentence breakdown of the options" 
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of exactly 2 or 3 distinct alternative options under comparison."
          },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The evaluation metric label (e.g., Cost, Accessibility, Long-term Value)" },
                description: { type: Type.STRING, description: "A high-level explanation of why this metric matters for this decision" },
                scores: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      option: { type: Type.STRING, description: "Must EXACTLY match one of the options defined above" },
                      score: { type: Type.INTEGER, description: "Rating score of this option from 1 (terrible) to 10 (perfect)" }
                    },
                    required: ["option", "score"]
                  }
                },
                explanation: { type: Type.STRING, description: "A sentence explaining why one option got an edge over the other under this metric." }
              },
              required: ["name", "description", "scores", "explanation"]
            }
          },
          recommendation: { 
            type: Type.STRING, 
            description: "A calculated recommendation based on high-performing metrics and strategic alignment." 
          }
        },
        required: ["decisionName", "summary", "options", "criteria", "recommendation"]
      };

    } else { // swot
      systemInstruction = `You are "The Tie Breaker" decision specialist.
A user provided a specific project, path, or key choice (e.g., 'Should I start a side hustle selling custom mugs?').
Conduct a pristine SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis of this choice.
Generate 3-5 tactical points for each SWOT quadrant.
Each point has:
- 'title': Clear focal point title
- 'description': One-sentence grounding detail
- 'impact': 'high' | 'medium' | 'low' (importance weight of this quadrant card)
Provide strategic takeaways in 'strategicTakeaways' indicating how to capitalize on Advantages and guard against external/internal blockers.`;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          decisionName: { 
            type: Type.STRING, 
            description: "Short catchy title of the SWOT analysis" 
          },
          summary: { 
            type: Type.STRING, 
            description: "A brief, highly professional 2-sentence background on conducting this SWOT analysis." 
          },
          strengths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, description: "Must be 'high', 'medium', or 'low'" }
              },
              required: ["title", "description", "impact"]
            }
          },
          weaknesses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, description: "Must be 'high', 'medium', or 'low'" }
              },
              required: ["title", "description", "impact"]
            }
          },
          opportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, description: "Must be 'high', 'medium', or 'low'" }
              },
              required: ["title", "description", "impact"]
            }
          },
          threats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, description: "Must be 'high', 'medium', or 'low'" }
              },
              required: ["title", "description", "impact"]
            }
          },
          strategicTakeaways: { 
            type: Type.STRING, 
            description: "Actionable strategy outline combining these SWOT metrics into a path forward." 
          }
        },
        required: ["decisionName", "summary", "strengths", "weaknesses", "opportunities", "threats", "strategicTakeaways"]
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform an intelligent analysis for the following user decision request: "${decision}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 1.0,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No analysis response content was generated.");
    }

    const decisionResult = JSON.parse(text.trim());
    return res.json({ result: decisionResult });

  } catch (error: any) {
    console.error("Decision generation failure:", error);
    return res.status(500).json({ 
      error: error.message || "An unexpected error occurred during AI analysis." 
    });
  }
});

// Configure Vite or Serve SPA
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Tie Breaker dev server running on http://localhost:${PORT}`);
  });
}

startServer();
