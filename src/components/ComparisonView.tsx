import React, { useState } from "react";
import { Scale, Plus, Trash2, HelpCircle, ChevronRight, Sparkles, Trophy } from "lucide-react";
import { ComparisonAnalysis, ComparisonCriterion } from "../types";

interface ComparisonViewProps {
  analysis: ComparisonAnalysis;
  onUpdate: (updatedAnalysis: ComparisonAnalysis) => void;
}

export default function ComparisonView({ analysis, onUpdate }: ComparisonViewProps) {
  const [newCritName, setNewCritName] = useState("");
  const [newCritDesc, setNewCritDesc] = useState("");
  const [newCritExplanation, setNewCritExplanation] = useState("");
  const [initialScores, setInitialScores] = useState<Record<string, number>>({});

  // Calculate scores for each option
  const optionScores: Record<string, { total: number; count: number; avg: number }> = {};
  
  // Initialize option structures
  analysis.options.forEach(opt => {
    optionScores[opt] = { total: 0, count: 0, avg: 0 };
  });

  // Accumulate
  analysis.criteria.forEach((crit) => {
    crit.scores.forEach((scr) => {
      if (optionScores[scr.option]) {
        optionScores[scr.option].total += scr.score;
        optionScores[scr.option].count += 1;
      }
    });
  });

  // Calculate averages
  analysis.options.forEach((opt) => {
    const data = optionScores[opt];
    data.avg = data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0;
  });

  // Find winner
  let winner = "";
  let highestAvg = -1;
  let isTie = false;

  analysis.options.forEach((opt) => {
    const avg = optionScores[opt].avg;
    if (avg > highestAvg) {
      highestAvg = avg;
      winner = opt;
      isTie = false;
    } else if (avg === highestAvg && avg > 0) {
      isTie = true;
    }
  });

  // Handle slide score adjustment
  const handleScoreChange = (criteriaId: string, optionName: string, newScore: number) => {
    const updatedCriteria = analysis.criteria.map((crit) => {
      if (crit.id === criteriaId) {
        const updatedScores = crit.scores.map((scr) => {
          if (scr.option === optionName) {
            return { ...scr, score: newScore };
          }
          return scr;
        });
        return { ...crit, scores: updatedScores };
      }
      return crit;
    });

    onUpdate({
      ...analysis,
      criteria: updatedCriteria,
    });
  };

  // Add custom comparison metric
  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    const scoresList = analysis.options.map((opt) => ({
      option: opt,
      score: initialScores[opt] || 5, // default to mid-point
    }));

    const newCriterion: ComparisonCriterion = {
      id: "crit-" + Date.now(),
      name: newCritName.trim(),
      description: newCritDesc.trim() || `Comparison based on ${newCritName}`,
      scores: scoresList,
      explanation: newCritExplanation.trim() || `User injected evaluation metric.`,
    };

    onUpdate({
      ...analysis,
      criteria: [...analysis.criteria, newCriterion],
    });

    setNewCritName("");
    setNewCritDesc("");
    setNewCritExplanation("");
    setInitialScores({});
  };

  // Delete evaluation metric
  const handleDeleteCrit = (critId: string) => {
    const filtered = analysis.criteria.filter((c) => c.id !== critId);
    onUpdate({
      ...analysis,
      criteria: filtered,
    });
  };

  return (
    <div className="space-y-8 text-[#E5E5E5]">
      {/* Dynamic Summary Block */}
      <div className="bg-white/5 border border-white/10 rounded-sm p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[#D4AF37] uppercase tracking-[0.2em] text-[10px] font-bold">
              Multi-Alternative Matrix
            </span>
            <h3 className="font-serif text-3xl text-white tracking-tight">
              {analysis.decisionName}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed font-sans">
              {analysis.summary}
            </p>
          </div>

          {/* Actionable Winner Board */}
          <div className="w-full md:w-80 shrink-0">
            <div className="h-24 bg-[#D4AF37] text-[#0A0A0A] p-4 flex items-center justify-between shadow-lg">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#0A0A0A]/60">
                  Decision Leader
                </span>
                <span className="text-xl font-serif font-bold italic truncate max-w-[180px]">
                  {isTie ? "Even Tie" : winner || "No Option yet"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-serif font-black">
                  {isTie ? "=" : highestAvg > 0 ? highestAvg : "0"}<span className="text-sm">/10</span>
                </span>
                <div className="text-[9px] uppercase font-bold tracking-tighter text-[#0A0A0A]/60">
                  Rating index
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Verdict */}
      {analysis.recommendation && (
        <div className="border border-white/10 bg-white/5 p-5 rounded-sm flex gap-4 items-start">
          <div className="p-2 border border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5 rounded-sm shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-white tracking-wide text-sm uppercase">Tie Breaker Strategic Takeaway</h4>
            <p className="text-sm text-white/80 leading-relaxed mt-1.5 font-sans">{analysis.recommendation}</p>
          </div>
        </div>
      )}

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analysis.options.map((opt) => {
          const isCurrentWinner = winner === opt && !isTie;
          return (
            <div
              key={opt}
              className={`p-4 border rounded-sm transition-all ${
                isCurrentWinner
                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white"
                  : "bg-white/5 border-white/10 text-white/80"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[150px]">{opt}</span>
                {isCurrentWinner && (
                  <span className="text-[9px] bg-[#D4AF37] text-[#0A0A0A] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 font-mono">
                    <Trophy className="h-2.5 w-2.5" /> LEADER
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-white">{optionScores[opt]?.avg || 0}</span>
                <span className="text-xs text-white/40">/ 10 avg</span>
              </div>

              {/* Progress bar visualizer */}
              <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#D4AF37] h-full transition-all duration-500 ease-out"
                  style={{ width: `${(optionScores[opt]?.avg || 0) * 10}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-[#111111] border border-white/10 rounded-sm p-4 md:p-6 overflow-x-auto">
        <h3 className="text-sm font-serif text-[#D4AF37] uppercase tracking-[0.15em] mb-4 pb-2 border-b border-white/10">
          Criteria Score Matrix
        </h3>

        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider font-mono">
              <th className="py-3 px-4 w-1/3">Evaluation Metric</th>
              {analysis.options.map((opt) => (
                <th key={opt} className="py-3 px-4 text-center">{opt}</th>
              ))}
              <th className="py-3 px-4 w-1/4">AI Grounding Contrast</th>
              <th className="py-3 px-4 w-[60px] text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {analysis.criteria.map((crit) => (
              <tr key={crit.id} className="group hover:bg-white/[0.02] transition-colors text-sm">
                <td className="py-4 px-4 space-y-1">
                  <span className="font-bold text-white leading-tight font-sans tracking-tight block">{crit.name}</span>
                  <span className="text-xs text-white/60 leading-relaxed block">{crit.description}</span>
                </td>
                {analysis.options.map((opt) => {
                  const currentScore = crit.scores.find((s) => s.option === opt)?.score ?? 5;
                  return (
                    <td key={opt} className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center w-full max-w-[140px] space-y-2">
                        <div className="flex justify-between w-full text-[11px] font-mono text-white/40">
                          <span>Rate:</span>
                          <span className="font-bold text-[#D4AF37]">{currentScore}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={currentScore}
                          onChange={(e) => handleScoreChange(crit.id, opt, Number(e.target.value))}
                          className="w-full accent-[#D4AF37] bg-white/15 h-1 rounded-sm cursor-pointer"
                        />
                      </div>
                    </td>
                  );
                })}
                <td className="py-4 px-4 text-xs text-white/70 leading-relaxed italic pr-6">
                  {crit.explanation}
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => handleDeleteCrit(crit.id)}
                    className="text-white/30 hover:text-red-400 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete metric"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Custom Criterion Form */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-sm">
        <h3 className="font-serif text-white text-lg mb-4 uppercase tracking-wider text-[#D4AF37]">
          Add Custom Evaluation Metric
        </h3>

        <form onSubmit={handleAddCriterion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5">
                Metric Name
              </label>
              <input
                type="text"
                required
                value={newCritName}
                onChange={(e) => setNewCritName(e.target.value)}
                placeholder="e.g., Immediate out-of-pocket costs"
                className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 placeholder:text-white/30 outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5">
                Short Description
              </label>
              <input
                type="text"
                value={newCritDesc}
                onChange={(e) => setNewCritDesc(e.target.value)}
                placeholder="Why does this metric matter for this decision?"
                className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 placeholder:text-white/30 outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {analysis.options.map((opt) => (
              <div key={opt}>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">
                  Initial score for "{opt}" (1-10)
                </label>
                <select
                  value={initialScores[opt] || 5}
                  onChange={(e) => setInitialScores({ ...initialScores, [opt]: Number(e.target.value) })}
                  className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 outline-none focus:border-[#D4AF37] font-mono"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(v => (
                    <option key={v} value={v} className="bg-[#0A0A0A]">Score: {v}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="md:col-span-1 border border-transparent">
              <input
                type="text"
                value={newCritExplanation}
                onChange={(e) => setNewCritExplanation(e.target.value)}
                placeholder="Grounding comment e.g., EV saves gas but upfront is stiff."
                className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 placeholder:text-white/30 outline-none focus:border-[#D4AF37] h-[38px] mb-0.5"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!newCritName.trim()}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 disabled:bg-white/10 text-[#0A0A0A] disabled:text-white/40 text-xs uppercase font-bold tracking-widest px-6 py-2.5 transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Inject Comparison Criterion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
