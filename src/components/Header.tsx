import { GitCompare, Sparkles, Scale, Info } from "lucide-react";

interface HeaderProps {
  onClearHistory: () => void;
  hasHistory: boolean;
}

export default function Header({ onClearHistory, hasHistory }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 mb-8 gap-4 w-full">
      <div className="flex flex-col">
        <span className="text-[#D4AF37] uppercase tracking-[0.3em] text-[10px] mb-2 font-bold block font-mono">
          Decision Intelligence Engine
        </span>
        <h1 className="text-4xl font-serif text-white tracking-tight flex items-center gap-3">
          Tie Breaker
          <span className="inline-flex items-center rounded-sm bg-[#D4AF37]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/25 font-mono">
            AI Powered
          </span>
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-4 md:gap-8 text-[10px] uppercase tracking-widest text-white/50 font-mono">
        {hasHistory && (
          <button
            onClick={onClearHistory}
            className="text-[#D4AF37] hover:text-[#D4AF37]/80 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 bg-[#D4AF37]/5 px-3 py-1.5 rounded-sm transition-colors uppercase font-mono tracking-widest text-[9px] font-bold"
          >
            Clear History
          </button>
        )}
        <div className="flex items-center gap-1.5 text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span>Status: Critical Path</span>
        </div>
        <div className="hidden sm:block text-white/40">
          Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </header>
  );
}
