import React, { useState } from "react";
import { TARGET_MODELS, ACTION_MODES } from "./data";
import { ActionMode, TargetModel } from "./types";
import { Check, Shield, Code, Sparkles, Image as ImageIcon, Video } from "lucide-react";

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  selectedActionMode: ActionMode;
  onSelectActionMode: (mode: ActionMode) => void;
}

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
  selectedActionMode,
  onSelectActionMode,
}: ModelSelectorProps) {
  const [providerFilter, setProviderFilter] = useState<"All" | "Google" | "Anthropic" | "xAI" | "Custom">("All");

  const filteredModels = TARGET_MODELS.filter((model) => {
    if (providerFilter === "All") return true;
    return model.provider === providerFilter;
  });

  const selectedModelObj = TARGET_MODELS.find((m) => m.id === selectedModelId);

  const getProviderBadgeColor = (provider: TargetModel["provider"], isSelected: boolean) => {
    if (isSelected) {
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    }
    switch (provider) {
      case "Google":
        return "bg-blue-950/40 text-blue-400 border-blue-900/60";
      case "Anthropic":
        return "bg-orange-950/40 text-orange-400 border-orange-900/60";
      case "xAI":
        return "bg-slate-900 text-[var(--text)] border-[var(--border)]";
      default:
        return "bg-purple-950/40 text-purple-400 border-purple-900/60";
    }
  };

  const getActionModeIcon = (mode: ActionMode) => {
    switch (mode) {
      case "Translation":
        return <Code className="w-3.5 h-3.5" />;
      case "Expand":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "Image Prompt":
        return <ImageIcon className="w-3.5 h-3.5" />;
      case "Video Prompt":
        return <Video className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: ACTION MODE */}
      <div>
        <h3 
          className="text-xs font-bold text-[var(--text2)] tracking-[0.2em] flex items-center gap-2 uppercase mb-3"
          style={{ fontFamily: 'system-ui', marginRight: '0px', marginBottom: '12px', marginLeft: '7px', marginTop: '10px' }}
        >
          <span className="text-cyan-400 font-bold">01.</span> Choose a Writing Goal
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ACTION_MODES.map((mode, index) => {
            const isSelected = selectedActionMode === mode.value;
            const buttonStyle: React.CSSProperties = {};
            if (index === 0) {
              buttonStyle.height = '89.1806px';
              buttonStyle.width = '391.505px';
              buttonStyle.marginLeft = '5px';
            } else if (index === 2) {
              buttonStyle.width = '391.505px';
              buttonStyle.marginLeft = '5px';
            }

            return (
              <button
                key={mode.value}
                onClick={() => onSelectActionMode(mode.value)}
                type="button"
                style={buttonStyle}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-cyan-500/50 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "border-[var(--border)] bg-[var(--bg3)] text-[var(--text)] hover:border-[var(--border)] hover:bg-[var(--bg3)]"
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 tracking-tight text-[var(--text)] uppercase" style={{ fontFamily: 'system-ui' }}>
                    {getActionModeIcon(mode.value)}
                    {mode.value}
                  </span>
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isSelected ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" : "border border-[var(--border)]"}`}></div>
                </div>
                <p className={`text-[11px] leading-relaxed ${isSelected ? "text-[var(--text)]" : "text-[var(--text2)]"}`} style={{ fontFamily: 'system-ui' }}>
                  {mode.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: TARGET AI SPECIFICATION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-bold text-[var(--text2)] tracking-[0.2em] flex items-center gap-2 uppercase" style={{ fontFamily: 'system-ui', marginLeft: '5px' }}>
            <span className="text-cyan-400 font-bold">02.</span> Choose your AI Model
          </h3>

          {/* Provider Pill Selectors */}
          <div className="flex flex-wrap gap-1 bg-[var(--bg3)] p-1 rounded-lg border border-[var(--border)]">
            {(["All", "Google", "Anthropic", "xAI", "Custom"] as const).map((prov) => {
              const active = providerFilter === prov;
              return (
                <button
                  key={prov}
                  onClick={() => setProviderFilter(prov)}
                  type="button"
                  className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md transition cursor-pointer ${
                    active 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                      : "text-[var(--text2)] hover:text-[var(--text)] border border-transparent"
                  }`}
                  style={{ fontFamily: 'system-ui' }}
                >
                  {prov}
                </button>
              );
            })}
          </div>
        </div>

        {/* Models Dropdown Selection */}
        <div className="relative group rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg3)] p-1 mt-1" style={{ width: '801px', marginLeft: '5px' }}>
          <select
            value={selectedModelId}
            onChange={(e) => onSelectModel(e.target.value)}
            className="w-full bg-transparent border-0 px-3 py-3 text-xs text-cyan-400 focus:outline-none focus:ring-0 cursor-pointer appearance-none select-scrollbar"
            style={{ fontFamily: 'system-ui' }}
          >
            {filteredModels.map((model) => (
              <option key={model.id} value={model.id} className="bg-[var(--bg3)] text-[var(--text)]">
                [{model.provider.toUpperCase()}] {model.name} — {model.syntaxDescription}
              </option>
            ))}
            {!filteredModels.some(m => m.id === selectedModelId) && selectedModelObj && (
              <option value={selectedModelObj.id} className="bg-[var(--bg3)] text-[var(--text)]">
                [{selectedModelObj.provider.toUpperCase()}] {selectedModelObj.name} — {selectedModelObj.syntaxDescription}
              </option>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-cyan-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Selected Syntax Focus Banner */}
      {selectedModelObj && (
        <div className="bg-[var(--bg3)] border border-cyan-500/20 rounded-xl p-4 flex gap-3 shadow-[0_0_20px_rgba(6,182,212,0.02)]" style={{ marginLeft: '5px', width: '800.995px' }}>
          <div className="bg-cyan-950/40 border border-cyan-800 text-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5 font-display" style={{ fontFamily: 'system-ui', fontWeight: 'bold' }}>
              AI Guidelines Used:
            </h5>
            <p className="text-[11px] text-[var(--text2)] mt-1 leading-relaxed" style={{ fontFamily: 'system-ui' }}>
              We will format your prompt like this: <strong className="text-[var(--text)]">{selectedModelObj.syntaxDescription}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
