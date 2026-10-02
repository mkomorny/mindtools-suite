import { useState } from "react";
import { HistoryItem } from "./types";
import { History, Trash2, ArrowUpRight, Award, Trash, Star } from "lucide-react";

interface HistoryListProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryList({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearAll,
}: HistoryListProps) {
  const [activeTab, setActiveTab] = useState<"history" | "favorites">("history");

  const displayedItems = activeTab === "favorites" ? history.filter(item => item.isFavorite) : history;

  if (history.length === 0) {
    return (
      <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-2xl p-8 text-center space-y-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
        <div className="bg-slate-900/60 border border-[var(--border)] w-11 h-11 rounded-xl flex items-center justify-center mx-auto text-[var(--text2)] shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
          <History className="w-5 h-5 text-cyan-400/80 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-xs uppercase tracking-[0.15em] text-[var(--text)] font-mono">No Saved History</h4>
          <p className="text-[11px] text-[var(--text2)] font-sans max-w-xs mx-auto leading-relaxed">
            Your saved prompts will appear here automatically when you optimize your drafts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header details */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 p-1 bg-[var(--bg2)] rounded-lg border border-[var(--border)]">
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider font-mono rounded transition cursor-pointer uppercase flex items-center gap-1.5 ${
                activeTab === "history" 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-xs" 
                  : "text-[var(--text2)] hover:text-[var(--text)] border border-transparent"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-3 py-1.5 text-[10px] font-bold tracking-wider font-mono rounded transition cursor-pointer uppercase flex items-center gap-1.5 ${
                activeTab === "favorites" 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs" 
                  : "text-[var(--text2)] hover:text-[var(--text)] border border-transparent"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Favorites Board
            </button>
          </div>
          <span className="bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 text-[9px] font-mono px-2 py-0.5 rounded-md hidden sm:block">
            {displayedItems.length} PROMPT{displayedItems.length !== 1 ? "S" : ""}
          </span>
        </div>
        <button
          onClick={onClearAll}
          type="button"
          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold tracking-wider font-mono flex items-center gap-1 cursor-pointer transition uppercase"
        >
          <Trash2 className="w-3 h-3" />
          <span className="hidden sm:inline">Clear All</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-[360px] overflow-y-auto select-scrollbar pr-1 board-card-scroll">
        {displayedItems.length === 0 ? (
          <div className="py-8 text-center text-[var(--text3)] text-[11px] font-mono italic">
            {activeTab === "favorites" ? "No favorite prompts saved yet." : "No history available."}
          </div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className={`group relative border ${item.isFavorite ? 'border-amber-500/30 bg-amber-950/10' : 'border-[var(--border)] bg-[var(--bg3)]'} hover:border-[var(--border)] rounded-xl p-3.5 flex flex-col justify-between transition gap-2.5`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[9px] font-mono text-[var(--text2)] flex items-center gap-1.5">
                    {item.timestamp}
                    {item.isFavorite && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-[var(--text2)] bg-slate-900 border border-[var(--border)] px-1.5 py-0.5 rounded uppercase">
                      {item.actionMode}
                    </span>
                    <span className="font-mono text-[9px] text-cyan-400 font-bold bg-[var(--bg3)] border border-cyan-800/40 px-1.5 py-0.5 rounded">
                      {item.targetModel.toUpperCase().replace("-", " ")}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text2)] font-sans line-clamp-2 leading-relaxed italic border-l-2 border-[var(--border)] pl-2.5 py-0.5">
                  "{item.rawInput}"
                </p>
              </div>

              <div className="flex items-center justify-between mt-1 pt-2 border-t border-[var(--border)] text-xs font-mono">
                <span className="text-[9px] text-[var(--text2)] font-semibold flex items-center gap-1 uppercase">
                  <Award className="w-3 h-3 text-cyan-400" /> Score: <strong className="text-white">{item.structuralScore}%</strong>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onDeleteHistory(item.id)}
                    title="Delete saved prompt"
                    className="text-[var(--text2)] hover:text-rose-400 p-1 rounded hover:bg-rose-950/20 cursor-pointer transition opacity-50 group-hover:opacity-100"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectHistory(item)}
                    className="text-cyan-400 font-mono group-hover:text-cyan-300 font-bold text-[9px] tracking-widest uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>Edit Prompt</span>
                    <ArrowUpRight className="w-3 h-3 text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
