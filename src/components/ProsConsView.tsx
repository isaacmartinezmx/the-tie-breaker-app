import React, { useState } from "react";
import { Plus, Trash2, ArrowUpRight, ChevronUp, ChevronDown, Scale, PlusCircle, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProsConsAnalysis, ProConItem } from "../types";

interface ProsConsViewProps {
  analysis: ProsConsAnalysis;
  onUpdate: (updatedAnalysis: ProsConsAnalysis) => void;
}

export default function ProsConsView({ analysis, onUpdate }: ProsConsViewProps) {
  const [newText, setNewText] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newWeight, setNewWeight] = useState(3);
  const [newCategory, setNewCategory] = useState("Financial");
  const [targetType, setTargetType] = useState<"pro" | "con">("pro");

  // Calculate scores
  const prosSum = analysis.pros.reduce((sum, item) => sum + item.weight, 0);
  const consSum = analysis.cons.reduce((sum, item) => sum + item.weight, 0);
  const totalSum = prosSum + consSum;

  let pointerPercent = 50;
  if (totalSum > 0) {
    pointerPercent = Math.round((prosSum / totalSum) * 100);
  }

  // Adjust weighting
  const handleWeightChange = (itemId: string, type: "pro" | "con", direction: "up" | "down") => {
    const list = type === "pro" ? [...analysis.pros] : [...analysis.cons];
    const index = list.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    let nextWeight = list[index].weight;
    if (direction === "up" && nextWeight < 5) nextWeight += 1;
    if (direction === "down" && nextWeight > 1) nextWeight -= 1;

    list[index] = { ...list[index], weight: nextWeight };
    onUpdate({
      ...analysis,
      pros: type === "pro" ? list : analysis.pros,
      cons: type === "con" ? list : analysis.cons,
    });
  };

  // Delete item
  const handleDeleteItem = (itemId: string, type: "pro" | "con") => {
    const list = type === "pro" ? analysis.pros : analysis.cons;
    const filtered = list.filter((item) => item.id !== itemId);
    onUpdate({
      ...analysis,
      pros: type === "pro" ? filtered : analysis.pros,
      cons: type === "con" ? filtered : analysis.cons,
    });
  };

  // Add customized item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newItem: ProConItem = {
      id: "custom-" + Date.now(),
      text: newText.trim(),
      description: newDesc.trim() || "User added point",
      weight: newWeight,
      category: newCategory.trim() || "General",
    };

    if (targetType === "pro") {
      onUpdate({
        ...analysis,
        pros: [...analysis.pros, newItem],
      });
    } else {
      onUpdate({
        ...analysis,
        cons: [...analysis.cons, newItem],
      });
    }

    setNewText("");
    setNewDesc("");
    setNewWeight(3);
  };

  return (
    <div className="space-y-8 text-[#E5E5E5]">
      {/* Dynamic Tie Breaker Meter */}
      <div className="bg-[#111111] border border-white/10 rounded-sm p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 md:max-w-md">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] font-mono bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2.5 py-1 rounded-sm inline-block">
              Tie Breaker Indicator
            </span>
            <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
              {analysis.decisionName}
            </h3>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              {analysis.summary}
            </p>
          </div>

          <div className="w-full md:w-80 space-y-4 shrink-0">
            <div className="flex justify-between items-end text-xs font-mono">
              <div className="text-rose-400 flex flex-col">
                <span className="font-bold text-lg md:text-xl">{consSum}</span>
                <span>Cons Force</span>
              </div>
              <div className="text-center pb-1">
                <span className="px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-[#D4AF37]">
                  {prosSum === consSum
                    ? "⚖️ Even Tie"
                    : prosSum > consSum
                    ? "👍 Yes, proceed"
                    : "🛑 No, rethink"}
                </span>
              </div>
              <div className="text-emerald-400 flex flex-col items-end">
                <span className="font-bold text-lg md:text-xl">{prosSum}</span>
                <span>Pros Force</span>
              </div>
            </div>

            {/* Slider visualizer */}
            <div className="relative h-6 bg-[#0A0A0A] rounded-sm overflow-hidden p-1 border border-white/10">
              {/* Dynamic filling */}
              <div
                className="absolute inset-y-1 left-1 rounded-sm transition-all duration-500 ease-out bg-gradient-to-r from-rose-500 via-white/10 to-emerald-500"
                style={{ width: "calc(100% - 8px)" }}
              ></div>

              {/* Indicator scale needle */}
              <motion.div
                className="absolute top-0 bottom-0 w-2.5 -ml-1.25 bg-[#D4AF37] shadow-xl z-20"
                style={{ left: `${pointerPercent}%` }}
                animate={{ left: `${pointerPercent}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-white/40 font-mono tracking-wider uppercase">
              <span>Cons Leaning</span>
              <span>50/50 Balance</span>
              <span>Pros Leaning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Recommendation Box */}
      {analysis.recommendation && (
        <div className="border border-white/10 bg-[#111111] p-5 rounded-sm flex gap-4 items-start">
          <div className="p-2 border border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5 rounded-sm shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-white tracking-wide text-sm uppercase">AI Synthesized Recommendation</h4>
            <p className="text-sm text-white/85 leading-relaxed mt-1.5 font-sans">{analysis.recommendation}</p>
          </div>
        </div>
      )}

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pros card list */}
        <div className="bg-[#111111] border border-white/10 rounded-sm p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-serif text-sm uppercase tracking-wider text-white">Pros List</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-sm font-mono font-bold">
                {prosSum} Points
              </span>
            </div>
          </div>

          {analysis.pros.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-8 italic font-sans font-normal">
              No Positive Pros left. Add one below to customize!
            </p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {analysis.pros.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group border border-white/5 hover:border-emerald-500/20 bg-[#0A0A0A]/50 hover:bg-emerald-500/[0.02] p-3 rounded-sm transition-all flex items-start gap-4 relative"
                  >
                    {/* Dynamic weights adjuster */}
                    <div className="flex flex-col items-center bg-[#0A0A0A] px-1.5 py-1.5 rounded-sm border border-white/5 self-center shrink-0">
                      <button
                        onClick={() => handleWeightChange(item.id, "pro", "up")}
                        disabled={item.weight >= 5}
                        className="text-white/40 hover:text-emerald-400 disabled:opacity-20 p-0.5 transition-colors"
                        title="Increase weight"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white my-0.5" title="Importance Weight">
                        {item.weight}
                      </span>
                      <button
                        onClick={() => handleWeightChange(item.id, "pro", "down")}
                        disabled={item.weight <= 1}
                        className="text-white/40 hover:text-rose-400 disabled:opacity-20 p-0.5 transition-colors"
                        title="Decrease weight"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-1.5 pr-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded-sm border border-emerald-500/20 font-mono uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-tight leading-snug">{item.text}</h4>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-sans">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id, "pro")}
                      className="absolute right-3 top-3 text-white/20 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Pro"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Cons list */}
        <div className="bg-[#111111] border border-white/10 rounded-sm p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-serif text-sm uppercase tracking-wider text-white">Cons List</h3>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-sm font-mono font-bold">
                {consSum} Points
              </span>
            </div>
          </div>

          {analysis.cons.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-8 italic font-sans font-normal">
              No Negative Cons left. Add one below to customize!
            </p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {analysis.cons.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group border border-white/5 hover:border-rose-500/20 bg-[#0A0A0A]/50 hover:bg-rose-500/[0.02] p-3 rounded-sm transition-all flex items-start gap-4 relative"
                  >
                    {/* Weights adjuster */}
                    <div className="flex flex-col items-center bg-[#0A0A0A] px-1.5 py-1.5 rounded-sm border border-white/5 self-center shrink-0">
                      <button
                        onClick={() => handleWeightChange(item.id, "con", "up")}
                        disabled={item.weight >= 5}
                        className="text-white/40 hover:text-emerald-400 disabled:opacity-20 p-0.5 transition-colors"
                        title="Increase weight"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white my-0.5">
                        {item.weight}
                      </span>
                      <button
                        onClick={() => handleWeightChange(item.id, "con", "down")}
                        disabled={item.weight <= 1}
                        className="text-white/40 hover:text-rose-400 disabled:opacity-20 p-0.5 transition-colors"
                        title="Decrease weight"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-1.5 pr-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] bg-rose-500/10 text-rose-400 font-bold px-1.5 py-0.5 rounded-sm border border-rose-500/20 font-mono uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-tight leading-snug">{item.text}</h4>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-sans">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id, "con")}
                      className="absolute right-3 top-3 text-white/20 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Con"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Customize & Add New Items Form */}
      <div className="bg-white/5 border border-white/10 rounded-sm p-5 md:p-6">
        <h3 className="font-serif text-[#D4AF37] text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Introduce Custom Influential Factor
        </h3>

        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5 font-mono">
              Factor Alignment
            </label>
            <div className="flex p-0.5 bg-[#0A0A0A] border border-white/10 rounded-sm">
              <button
                type="button"
                onClick={() => setTargetType("pro")}
                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-sm transition-all uppercase tracking-wider font-mono ${
                  targetType === "pro" ? "bg-[#D4AF37] text-[#0A0A0A]" : "text-white/50 hover:text-white"
                }`}
              >
                PRO Point
              </button>
              <button
                type="button"
                onClick={() => setTargetType("con")}
                className={`flex-1 text-center py-1.5 text-xs font-bold rounded-sm transition-all uppercase tracking-wider font-mono ${
                  targetType === "con" ? "bg-rose-600 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                CON Point
              </button>
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5 font-mono">
              Factor Summary Statement
            </label>
            <input
              type="text"
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g., Offers stellar carbon-offset savings"
              className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 placeholder:text-white/30 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5 font-mono">
              Importance (1-5)
            </label>
            <select
              value={newWeight}
              onChange={(e) => setNewWeight(Number(e.target.value))}
              className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 outline-none focus:border-[#D4AF37] font-mono"
            >
              <option value={1} className="bg-[#0A0A0A]">1 (Minimal impact)</option>
              <option value={2} className="bg-[#0A0A0A]">2 (Minor concern)</option>
              <option value={3} className="bg-[#0A0A0A]">3 (Moderate force)</option>
              <option value={4} className="bg-[#0A0A0A]">4 (Major priority)</option>
              <option value={5} className="bg-[#0A0A0A]">5 (Critical dealbreaker)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-1.5 font-mono">
              Category Group
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 outline-none focus:border-[#D4AF37]"
            >
              <option value="Financial" className="bg-[#0A0A0A]">Financial</option>
              <option value="Lifestyle" className="bg-[#0A0A0A]">Lifestyle</option>
              <option value="Career" className="bg-[#0A0A0A]">Career</option>
              <option value="Convenience" className="bg-[#0A0A0A]">Convenience</option>
              <option value="Health" className="bg-[#0A0A0A]">Health/Safety</option>
              <option value="Time" className="bg-[#0A0A0A]">Time Tradeoff</option>
              <option value="Environment" className="bg-[#0A0A0A]">Environment</option>
              <option value="Other" className="bg-[#0A0A0A]">Other</option>
            </select>
          </div>

          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-10">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5 font-mono">
                Extended Elaboration (Optional)
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Give a short explanation sentence backing this up"
                className="w-full text-xs text-white bg-[#0A0A0A] border border-white/15 rounded-sm p-2.5 placeholder:text-white/30 outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={!newText.trim()}
                className="w-full h-10 bg-[#D4AF37] hover:bg-[#D4AF37]/90 disabled:bg-white/10 text-[#0A0A0A] disabled:text-white/40 font-bold text-xs uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Inject Point
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
