export type AnalysisType = "pros-cons" | "comparison" | "swot";

export interface ProConItem {
  id: string;
  text: string;
  weight: number; // 1 to 5
  category: string;
  description: string;
}

export interface ProsConsAnalysis {
  decisionName: string;
  summary: string;
  pros: ProConItem[];
  cons: ProConItem[];
  recommendation: string;
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  description: string;
  scores: {
    option: string;
    score: number; // 1 to 10
  }[];
  explanation: string;
}

export interface ComparisonAnalysis {
  decisionName: string;
  summary: string;
  options: string[];
  criteria: ComparisonCriterion[];
  recommendation: string;
}

export interface SWOTItem {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface SWOTAnalysis {
  decisionName: string;
  summary: string;
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  strategicTakeaways: string;
}

export interface SavedDecision {
  id: string;
  title: string;
  userInput: string;
  type: AnalysisType;
  createdAt: string;
  analysis: ProsConsAnalysis | ComparisonAnalysis | SWOTAnalysis;
}
