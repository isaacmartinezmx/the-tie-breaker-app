import React, { useState } from "react";
import { motion } from "motion/react";
import { ThumbsUp, Scale, Table, BarChart4, Sparkles, AlertCircle } from "lucide-react";
import { AnalysisType } from "../types";

interface DecisionFormProps {
  onSubmit: (decision: string, type: AnalysisType) => Promise<void>;
  isLoading: boolean;
}

export default function DecisionForm({ onSubmit, isLoading }: DecisionFormProps) {
  const [decision, setDecision] = useState("");
  const [type, setType] = useState<AnalysisType>("pros-cons");
  const [error, setError] = useState("");

  const sampleDilemmas = [
    { text: "Should I buy an electric car or stay with a hybrid?", type: "comparison" as AnalysisType },
    { text: "Starting a side business selling custom graphic stickers", type: "swot" as AnalysisType },
    { text: "Moving away to New York City versus staying in Chicago", type: "pros-cons" as AnalysisType }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) {
      setError("Please describe the decision you need to make.");
      return;
    }
    setError("");
    onSubmit(decision.trim(), type);
  };

  const selectSample = (text: string, sampleType: AnalysisType) => {
    setDecision(text);
    setType(sampleType);
    setError("");
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-sm p-6 md:p-8 shadow-2xl">
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-white tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          What is your current dilemma?
        </h2>
        <p className="text-xs text-white/50 mt-1.5 font-sans">
          Describe the situation or choice you need to resolve, select an analytical methodology, and let AI dissect the options.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="decision" className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-2 font-mono">
            Grounding Dilemma Situation
          </label>
          <textarea
            id="decision"
            rows={3}
            value={decision}
            onChange={(e) => {
              setDecision(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g., Should I rent a smaller apartment in the city center or a larger one in the suburbs?"
            disabled={isLoading}
            className="w-full text-sm text-white bg-[#0A0A0A]/80 border border-white/10 focus:border-[#D4AF37] focus:bg-[#0A0A0A] rounded-sm p-4 placeholder:text-white/30 outline-none transition-all"
          />
          {error && (
            <p className="mt-2 text-xs text-rose-400 flex items-center gap-1 font-mono">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>

        {/* Analytical Style Picker */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-3 font-mono">
            Analytical Framework Methodology
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pros and Cons */}
            <button
              type="button"
              onClick={() => setType("pros-cons")}
              disabled={isLoading}
              className={`flex flex-col text-left p-4 rounded-sm border text-sm transition-all relative overflow-hidden ${
                type === "pros-cons"
                  ? "border-[#D4AF37] bg-[#D4AF37]/5 text-white"
                  : "border-white/10 bg-[#0A0A0A] text-white/70 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-sm ${type === "pros-cons" ? "bg-[#D4AF37] text-[#0A0A0A]" : "bg-white/5 text-white/40"}`}>
                  <Scale className="h-4 w-4" />
                </div>
                <span className="font-serif font-bold text-white tracking-wide">Pros & Cons List</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Assign importance weights (1-5) to positive and negative forces and calculate a dynamic alignment bias.
              </p>
              {type === "pros-cons" && (
                <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              )}
            </button>

            {/* Comparison Table */}
            <button
              type="button"
              onClick={() => setType("comparison")}
              disabled={isLoading}
              className={`flex flex-col text-left p-4 rounded-sm border text-sm transition-all relative overflow-hidden ${
                type === "comparison"
                  ? "border-[#D4AF37] bg-[#D4AF37]/5 text-white"
                  : "border-white/10 bg-[#0A0A0A] text-white/70 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-sm ${type === "comparison" ? "bg-[#D4AF37] text-[#0A0A0A]" : "bg-white/5 text-white/40"}`}>
                  <Table className="h-4 w-4" />
                </div>
                <span className="font-serif font-bold text-white tracking-wide">Comparison Table</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Examine 2 or 3 specific trade-off options across criteria (1-10) and calculate balanced scorecard averages.
              </p>
              {type === "comparison" && (
                <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              )}
            </button>

            {/* SWOT Analysis */}
            <button
              type="button"
              onClick={() => setType("swot")}
              disabled={isLoading}
              className={`flex flex-col text-left p-4 rounded-sm border text-sm transition-all relative overflow-hidden ${
                type === "swot"
                  ? "border-[#D4AF37] bg-[#D4AF37]/5 text-white"
                  : "border-white/10 bg-[#0A0A0A] text-white/70 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-sm ${type === "swot" ? "bg-[#D4AF37] text-[#0A0A0A]" : "bg-white/5 text-white/40"}`}>
                  <BarChart4 className="h-4 w-4" />
                </div>
                <span className="font-serif font-bold text-white tracking-wide">SWOT Matrix</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Map internal advantages/disadvantages alongside macro-level external growth paths and defensive risks.
              </p>
              {type === "swot" && (
                <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 flex items-center justify-center rounded-sm bg-[#D4AF37] hover:bg-[#D4AF37]/90 disabled:bg-white/5 text-[#0A0A0A] disabled:text-white/30 font-bold text-xs uppercase tracking-widest transition-all shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="h-4 w-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin"></span>
                <span>Resolving Ambiguities... Draft in Progress</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 font-mono">
                <Sparkles className="h-4 w-4" />
                Inquire Decision Matrix
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Samples */}
      {!isLoading && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-2.5 font-mono">
            Or select a standard dilemma format:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleDilemmas.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSample(sample.text, sample.type)}
                className="text-xs text-white/60 hover:text-white bg-white/5 hover:bg-[#D4AF37]/10 border border-white/10 hover:border-[#D4AF37]/30 px-3 py-1.5 rounded-sm transition-all text-left"
              >
                "{sample.text}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
