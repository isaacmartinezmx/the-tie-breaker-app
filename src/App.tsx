import React, { useState, useEffect } from "react";
import { Scale, Sparkles, Clock, Trash2, History, ChevronRight, HelpCircle } from "lucide-react";
import Header from "./components/Header";
import DecisionForm from "./components/DecisionForm";
import ProsConsView from "./components/ProsConsView";
import ComparisonView from "./components/ComparisonView";
import SWOTView from "./components/SWOTView";
import { AnalysisType, SavedDecision, ProsConsAnalysis, ComparisonAnalysis, SWOTAnalysis } from "./types";

export default function App() {
  const [historyList, setHistoryList] = useState<SavedDecision[]>([]);
  const [activeDecision, setActiveDecision] = useState<SavedDecision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load history list on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tiebreaker_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistoryList(parsed);
          // Set latest as active by default to show a loaded state
          if (parsed.length > 0) {
            setActiveDecision(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load history list:", e);
    }
  }, []);

  // Sync back to local storage
  const saveHistory = (newHistory: SavedDecision[]) => {
    setHistoryList(newHistory);
    localStorage.setItem("tiebreaker_history", JSON.stringify(newHistory));
  };

  // Submit trigger to backend express service
  const handlePerformAnalysis = async (decision: string, type: AnalysisType) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch("/api/decide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision, type }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to contact resolution engine.");
      }

      const data = await res.json();
      if (!data.result) {
        throw new Error("No usable decision analysis result returned.");
      }

      const newSavedItem: SavedDecision = {
        id: "dec-" + Date.now(),
        title: data.result.decisionName || "Resolution Matrix",
        userInput: decision,
        type,
        createdAt: new Date().toISOString(),
        analysis: data.result,
      };

      const updatedHistory = [newSavedItem, ...historyList];
      saveHistory(updatedHistory);
      setActiveDecision(newSavedItem);
    } catch (err: any) {
      console.error("Analysis trigger error:", err);
      setApiError(err.message || "An expected model handshake failure has occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time local item additions, weight adjust and deletion synchronization back to history
  const handleUpdateActiveAnalysis = (updatedAnalysis: any) => {
    if (!activeDecision) return;

    const updatedDecision: SavedDecision = {
      ...activeDecision,
      analysis: updatedAnalysis,
    };

    setActiveDecision(updatedDecision);

    const updatedHistory = historyList.map((item) =>
      item.id === activeDecision.id ? updatedDecision : item
    );
    saveHistory(updatedHistory);
  };

  // Delete individual saved entry
  const handleDeleteItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const filtered = historyList.filter((item) => item.id !== itemId);
    saveHistory(filtered);
    if (activeDecision?.id === itemId) {
      setActiveDecision(filtered.length > 0 ? filtered[0] : null);
    }
  };

  // Clear history action
  const handleClearHistory = () => {
    if (window.confirm("Perform irreversible purge of the local decision history ledger?")) {
      saveHistory([]);
      setActiveDecision(null);
    }
  };

  // Helper labels for analysis type indicators
  const typeLabels = {
    "pros-cons": "Pros & Cons list",
    "comparison": "Comparison Table",
    "swot": "SWOT Matrix",
  };

  return (
    <div className="bg-[#0A0A0A] text-[#E5E5E5] font-sans min-h-screen flex flex-col selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Absolute ambient grid layout backing */}
      <div className="absolute inset-0 bg-[#0A0A0A] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.07),rgba(255,255,255,0))] mix-blend-screen pointer-events-none z-0"></div>

      <div className="flex-grow z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col space-y-8">
        
        {/* Customized Sophisticated Dark Header */}
        <Header onClearHistory={handleClearHistory} hasHistory={historyList.length > 0} />

        {/* Core Layout Split */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: form configuration & history log */}
          <div className="lg:col-span-5 space-y-6">
            <DecisionForm onSubmit={handlePerformAnalysis} isLoading={isLoading} />

            {/* Local ledger history box */}
            <div className="bg-[#111111] border border-white/10 p-5 rounded-sm shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-bold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Decision Ledger History
                </h3>
                <span className="text-[10px] font-mono text-white/40 uppercase">
                  {historyList.length} Entries Recorded
                </span>
              </div>

              {historyList.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/30 italic">
                  No historical entries present in local ledger.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {historyList.map((item) => {
                    const isActive = activeDecision?.id === item.id;
                    const dateFormatted = new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveDecision(item);
                          setApiError(null);
                        }}
                        className={`flex justify-between items-center p-3 rounded-sm border cursor-pointer group transition-all ${
                          isActive
                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white"
                            : "bg-[#0A0A0A]/55 border-white/5 text-white/70 hover:border-white/15"
                        }`}
                      >
                        <div className="space-y-1 truncate pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold tracking-widest bg-white/5 border border-white/10 text-white/50 px-1.5 py-0.5 rounded-sm scale-95 font-mono">
                              {item.type === "pros-cons" ? "P&C" : item.type === "comparison" ? "COMP" : "SWOT"}
                            </span>
                            <h4 className="text-sm font-bold truncate tracking-tight font-serif">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-[10px] text-white/40 leading-none">
                            Made decisions on: {dateFormatted}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDeleteItem(e, item.id)}
                            className="text-white/20 hover:text-red-400 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-all scale-90"
                            title="Purge record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#D4AF37] transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active Framework workspace */}
          <div className="lg:col-span-7">
            
            {/* Show API Error Banner */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-5 rounded-sm mb-6 flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>🚨 Grounding Handshake Defect</span>
                </div>
                <p className="text-white/80 leading-relaxed font-sans">{apiError}</p>
                <div className="pt-2 border-t border-red-500/10 flex justify-end">
                  <button
                    onClick={() => setApiError(null)}
                    className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] hover:underline"
                  >
                    Acknowledge Fault
                  </button>
                </div>
              </div>
            )}

            {/* Render loading state */}
            {isLoading ? (
              <div className="bg-[#111111] border border-white/10 rounded-sm p-8 md:p-12 text-center shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col justify-center items-center gap-6">
                {/* Shimmer layout animation overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-shimmer"></div>
                
                <div className="relative flex h-14 w-14 items-center justify-center rounded-sm bg-[#D4AF37]/5 text-[#D4AF37] border border-[#D4AF37]/30">
                  <Scale className="h-7 w-7 animate-spin" />
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="font-serif text-2xl text-white tracking-widest uppercase">
                    Analyzing Parameters
                  </h3>
                  <p className="text-xs text-[#D4AF37] tracking-[0.1em] font-mono uppercase">
                    Engaging Gemini Intelligence Engine
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Calculating structural probability, assigning weighting metrics, and synthesizing final strategy recommendations...
                  </p>
                </div>

                {/* Shimmer bar representation */}
                <div className="w-full max-w-xs bg-white/5 h-1 border border-white/10 overflow-hidden">
                  <div className="h-full bg-[#D4AF37] w-1/2 animate-shimmer-progress rounded-sm"></div>
                </div>
              </div>
            ) : activeDecision ? (
              
              /* Render active visual framework */
              <div className="space-y-6">
                
                {/* Visual view controller indicator */}
                <div className="flex justify-between items-center bg-[#111111] border border-white/10 px-5 py-3 rounded-sm">
                  <span className="text-[11px] uppercase tracking-widest text-white/40 font-mono">
                    Active Workspace Framework
                  </span>
                  <span className="text-xs font-serif font-bold italic text-[#D4AF37]">
                    {typeLabels[activeDecision.type]}
                  </span>
                </div>

                {activeDecision.type === "pros-cons" && (
                  <ProsConsView
                    analysis={activeDecision.analysis as ProsConsAnalysis}
                    onUpdate={handleUpdateActiveAnalysis}
                  />
                )}

                {activeDecision.type === "comparison" && (
                  <ComparisonView
                    analysis={activeDecision.analysis as ComparisonAnalysis}
                    onUpdate={handleUpdateActiveAnalysis}
                  />
                )}

                {activeDecision.type === "swot" && (
                  <SWOTView
                    analysis={activeDecision.analysis as SWOTAnalysis}
                    onUpdate={handleUpdateActiveAnalysis}
                  />
                )}

                {/* Bottom workspace action utility */}
                <div className="flex justify-between items-center text-[11px] text-white/30 border-t border-white/10 pt-4 px-2 tracking-wider uppercase font-mono">
                  <span>Decision Key: {activeDecision.id}</span>
                  <button
                    onClick={() => setActiveDecision(null)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Clear Slate Viewing
                  </button>
                </div>
              </div>
            ) : (
              
              /* Empty Landing state */
              <div className="bg-[#111111] border border-white/10 rounded-sm p-8 md:p-12 text-center shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col justify-center items-center gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-white/5 text-white/30 border border-white/10">
                  <Scale className="h-6 w-6" />
                </div>

                <div className="space-y-2 max-w-md">
                  <h3 className="font-serif text-xl text-white tracking-wide">
                    The Decision Desk remains vacant.
                  </h3>
                  <p className="text-xs text-white/55 leading-relaxed">
                    Formulate your grounding dilemma situation on the left, choosing your analytical framework, to initiate the tie breaker matrix.
                  </p>
                </div>

                {/* Micro guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-lg mt-4 text-left">
                  <div className="p-3 border border-white/5 bg-white/[0.01]">
                    <span className="text-[#D4AF37] uppercase font-bold text-[9px] tracking-widest block mb-1 font-mono">01. Balance</span>
                    <p className="text-[10px] text-white/40 leading-snug">Weight and calculate emotional forces to extract core alignment biases.</p>
                  </div>
                  <div className="p-3 border border-white/5 bg-white/[0.01]">
                    <span className="text-[#D4AF37] uppercase font-bold text-[9px] tracking-widest block mb-1 font-mono">02. Compare</span>
                    <p className="text-[10px] text-white/40 leading-snug">Compare up to three choices across customized criteria benchmarks.</p>
                  </div>
                  <div className="p-3 border border-white/5 bg-white/[0.01]">
                    <span className="text-[#D4AF37] uppercase font-bold text-[9px] tracking-widest block mb-1 font-mono">03. Strategize</span>
                    <p className="text-[10px] text-white/40 leading-snug">Conduct quad-SWOT mappings of macro opportunities and liability risk.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Small design credit label conforming strictly to literal principles */}
      <footer className="py-6 border-t border-white/5 mt-auto bg-[#0a0a0a] text-center text-[10px] font-mono tracking-widest text-white/20 select-none">
        THE TIE BREAKER — DURABLE INTUITIVE AI COGNITION ENGINE
      </footer>
    </div>
  );
}
