import React, { useState } from "react";
import { Plus, Trash2, ArrowUpRight, HelpCircle, Sparkles, PlusCircle } from "lucide-react";
import { SWOTAnalysis, SWOTItem } from "../types";

interface SWOTViewProps {
  analysis: SWOTAnalysis;
  onUpdate: (updatedAnalysis: SWOTAnalysis) => void;
}

export default function SWOTView({ analysis, onUpdate }: SWOTViewProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImpact, setNewImpact] = useState<"high" | "medium" | "low">("high");
  const [targetQuad, setTargetQuad] = useState<"strengths" | "weaknesses" | "opportunities" | "threats">("strengths");

  // Add customized item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: SWOTItem = {
      id: "swot-" + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || "User added aspect",
      impact: newImpact,
    };

    onUpdate({
      ...analysis,
      [targetQuad]: [...analysis[targetQuad], newItem],
    });

    setNewTitle("");
    setNewDesc("");
    setNewImpact("high");
  };

  // Delete item
  const handleDeleteItem = (itemId: string, quadKey: "strengths" | "weaknesses" | "opportunities" | "threats") => {
    const list = analysis[quadKey];
    const filtered = list.filter((item) => item.id !== itemId);
    onUpdate({
      ...analysis,
      [quadKey]: filtered,
    });
  };

  const impactColors = {
    high: "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/35",
    medium: "bg-white/10 text-white/80 border-white/15",
    low: "bg-white/5 text-white/50 border-white/5",
  };

  return (
    <div className="space-y-8 text-[#E5E5E5]">
      {/* Overview Block */}
      <div className="bg-white/5 border border-white/10 rounded-sm p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[#D4AF37] uppercase tracking-[0.2em] text-[10px] font-bold">
              Quadratic SWOT Matrix
            </span>
            <h3 className="font-serif text-3xl text-white tracking-tight">
              {analysis.decisionName}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed font-sans font-normal">
              {analysis.summary}
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end text-right shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">
              Quadrant count
            </span>
            <span className="text-3xl font-serif text-[#D4AF37] mt-1 font-bold">
              {analysis.strengths.length + analysis.weaknesses.length + analysis.opportunities.length + analysis.threats.length}
            </span>
            <span className="text-[10px] text-white/30 uppercase mt-0.5 tracking-lighter">Points plotted</span>
          </div>
        </div>
      </div>

      {/* Strategic Takeaways Box */}
      {analysis.strategicTakeaways && (
        <div className="border border-white/10 bg-[#111111] p-5 rounded-sm flex gap-4 items-start">
          <div className="p-2 border border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5 rounded-sm shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-white tracking-wide text-sm uppercase">Strategic Blueprint & Roadmap</h4>
            <p className="text-sm text-white/80 leading-relaxed mt-1.5 font-sans">{analysis.strategicTakeaways}</p>
          </div>
        </div>
      )}

      {/* 2x2 SWOT Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <section className="bg-[#111111] border border-white/10 p-6 rounded-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
              Strengths (Internal)
            </h3>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
              Prospective edge
            </span>
          </div>
          {analysis.strengths.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6 text-xs text-white/40 italic">
              No Internal Strengths currently listed.
            </div>
          ) : (
            <div className="space-y-3.5 flex-1">
              {analysis.strengths.map((item) => (
                <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 p-3 rounded-sm flex items-start gap-3">
                  <div className="flex-1 space-y-1 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 border font-mono rounded-sm ${impactColors[item.impact]}`}>
                        {item.impact} impact
                      </span>
                      <h4 className="text-sm font-bold text-white font-serif">{item.title}</h4>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id, "strengths")}
                    className="absolute right-3 top-3 text-white/30 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Weaknesses */}
        <section className="bg-[#111111] border border-white/10 p-6 rounded-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
              Weaknesses (Internal)
            </h3>
            <span className="text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-sm">
              Liability risk
            </span>
          </div>
          {analysis.weaknesses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6 text-xs text-white/40 italic">
              No Internal Weaknesses currently listed.
            </div>
          ) : (
            <div className="space-y-3.5 flex-1">
              {analysis.weaknesses.map((item) => (
                <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 p-3 rounded-sm flex items-start gap-3">
                  <div className="flex-1 space-y-1 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 border font-mono rounded-sm ${impactColors[item.impact]}`}>
                        {item.impact} impact
                      </span>
                      <h4 className="text-sm font-bold text-white font-serif">{item.title}</h4>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id, "weaknesses")}
                    className="absolute right-3 top-3 text-white/30 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Opportunities */}
        <section className="bg-[#111111] border border-white/10 p-6 rounded-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
              Opportunities (External)
            </h3>
            <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-sm">
              Growth Catalysts
            </span>
          </div>
          {analysis.opportunities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6 text-xs text-white/40 italic">
              No External Opportunities currently listed.
            </div>
          ) : (
            <div className="space-y-3.5 flex-1">
              {analysis.opportunities.map((item) => (
                <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 p-3 rounded-sm flex items-start gap-3">
                  <div className="flex-1 space-y-1 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 border font-mono rounded-sm ${impactColors[item.impact]}`}>
                        {item.impact} impact
                      </span>
                      <h4 className="text-sm font-bold text-white font-serif">{item.title}</h4>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id, "opportunities")}
                    className="absolute right-3 top-3 text-white/30 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Threats */}
        <section className="bg-[#111111] border border-white/10 p-6 rounded-sm flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
              Threats (External)
            </h3>
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-sm">
              Macro threats
            </span>
          </div>
          {analysis.threats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6 text-xs text-white/40 italic">
              No External Threats currently listed.
            </div>
          ) : (
            <div className="space-y-3.5 flex-1">
              {analysis.threats.map((item) => (
                <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 p-3 rounded-sm flex items-start gap-3">
                  <div className="flex-1 space-y-1 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 border font-mono rounded-sm ${impactColors[item.impact]}`}>
                        {item.impact} impact
                      </span>
                      <h4 className="text-sm font-bold text-white font-serif">{item.title}</h4>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id, "threats")}
                    className="absolute right-3 top-3 text-white/30 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Add SWOT Factor Form */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-sm">
        <h3 className="font-serif text-white text-lg mb-4 uppercase tracking-wider text-[#D4AF37]">
          Add Customized SWOT Aspect
        </h3>

        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5">
              Quadrant Target
            </label>
            <select
              value={targetQuad}
              onChange={(e: any) => setTargetQuad(e.target.value)}
              className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 outline-none focus:border-[#D4AF37]"
            >
              <option value="strengths" className="bg-[#0A0A0A]">Strength (Internal)</option>
              <option value="weaknesses" className="bg-[#0A0A0A]">Weakness (Internal)</option>
              <option value="opportunities" className="bg-[#0A0A0A]">Opportunity (External)</option>
              <option value="threats" className="bg-[#0A0A0A]">Threat (External)</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5">
              Aspect Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Unparalleled direct visibility to regional board"
              className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 placeholder:text-white/30 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5">
              Impact Level
            </label>
            <select
              value={newImpact}
              onChange={(e: any) => setNewImpact(e.target.value)}
              className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 outline-none focus:border-[#D4AF37] font-mono"
            >
              <option value="high" className="bg-[#0A0A0A]">High</option>
              <option value="medium" className="bg-[#0A0A0A]">Medium</option>
              <option value="low" className="bg-[#0A0A0A]">Low</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="w-full h-[38px] bg-[#D4AF37] hover:bg-[#D4AF37]/90 disabled:bg-white/10 text-[#0A0A0A] disabled:text-white/40 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Inject Factor
            </button>
          </div>

          <div className="md:col-span-12">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
              Extended Context / Backing Detail (Optional)
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Give a short explanatory detail statement mapping this aspect..."
              className="w-full text-xs text-[#E5E5E5] bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 placeholder:text-white/30 outline-none focus:border-[#D4AF37]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
