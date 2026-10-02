import React, { useState, useEffect, useMemo } from 'react';
import { 
  getStoredLogs, 
  clearStoredLogs, 
  formatUSD, 
  getOrCreateSessionId, 
  PRICING_RATES,
  resolveRate,
  CostLog 
} from '../lib/costTracker';
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  Activity, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  RefreshCw,
  AlertTriangle,
  Award,
  Trash2
} from 'lucide-react';

export function CostTrackerDashboard() {
  const [logs, setLogs] = useState<CostLog[]>([]);
  const { id: currentSessionId } = getOrCreateSessionId()

  // Filters state
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [endDateStr, setEndDateStr] = useState<string>('');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  // Clear confirm state
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  // Budget cap state
  const [budgetCap, setBudgetCap] = useState<number>(() => {
    const saved = localStorage.getItem('mt_budget_cap');
    return saved ? parseFloat(saved) : 10.0;
  });

  const handleBudgetCapChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setBudgetCap(num);
      localStorage.setItem('mt_budget_cap', String(num));
    } else if (val === '') {
      setBudgetCap(0);
      localStorage.setItem('mt_budget_cap', '0');
    }
  };

  const totalCostThisMonth = useMemo(() => {
    const today = new Date()
    return logs.reduce((sum, l) => {
      const logDate = new Date(l.timestamp);
      const isThisMonth = logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear()
      return sum + (isThisMonth && l.success ? l.cost : 0);
    }, 0);
  }, [logs]);

  const percentSpent = budgetCap > 0 ? (totalCostThisMonth / budgetCap) * 100 : 0;
  const budgetProgress = Math.min(100, percentSpent);
  const isBudgetExceeded = budgetCap > 0 && totalCostThisMonth >= budgetCap;
  const isAt99Percent = budgetCap > 0 && percentSpent >= 99 && !isBudgetExceeded;
  const isAt90Percent = budgetCap > 0 && percentSpent >= 90 && percentSpent < 99;
  const isAt75Percent = budgetCap > 0 && percentSpent >= 75 && percentSpent < 90;

  const [dismissedWarnings, setDismissedWarnings] = useState<Record<string, boolean>>({});

  const loadLogs = () => {
    setLogs(getStoredLogs());
  };

  useEffect(() => {
    loadLogs
    window.addEventListener('storage', loadLogs);
    return () => window.removeEventListener('storage', loadLogs);
  }, []);

  const currentSessionLogs = logs.filter(l => l.sessionId === currentSessionId);

  const filteredLogs = logs.filter(l => {
    if (selectedModelFilter !== 'all') {
      const selectedName = resolveRate(selectedModelFilter).name;
      const logName = resolveRate(l.modelId).name;
      if (selectedName !== logName) return false;
    }
    const logDate = new Date(l.timestamp);
    logDate.setHours(0, 0, 0, 0);
    if (startDateStr) {
      const start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
      if (logDate < start) return false;
    }
    if (endDateStr) {
      const end = new Date(endDateStr);
      end.setHours(0, 0, 0, 0);
      if (logDate > end) return false;
    }
    return true;
  });

  const totalCostOverall = logs.reduce((sum, l) => sum + (l.success ? l.cost : 0), 0);
  const totalCostCurrentSession = currentSessionLogs.reduce((sum, l) => sum + (l.success ? l.cost : 0), 0);
  const totalCostFiltered = filteredLogs.reduce((sum, l) => sum + (l.success ? l.cost : 0), 0);
  
  const totalInputTokensFiltered = filteredLogs.reduce((sum, l) => sum + l.inputTokens, 0);
  const totalOutputTokensFiltered = filteredLogs.reduce((sum, l) => sum + l.outputTokens, 0);
  const totalCallsFiltered = filteredLogs.length;
  const successCallsFiltered = filteredLogs.filter(l => l.success).length;

  const logsByApiKey = useMemo(() => {
    const grouped: Record<string, { name: string; provider: string; logs: CostLog[]; totalCost: number; totalTokens: number }> = {};
    filteredLogs.forEach(log => {
      const keyId = log.apiKeyId || 'unknown';
      const keyName = log.apiKeyName || 'Unknown Key';
      const provider = log.provider || 'Unknown Provider';
      
      if (!grouped[keyId]) {
        grouped[keyId] = { name: keyName, provider: provider, logs: [], totalCost: 0, totalTokens: 0 };
      }
      grouped[keyId].logs.push(log);
      if (log.success) {
        grouped[keyId].totalCost += log.cost;
        grouped[keyId].totalTokens += log.inputTokens + log.outputTokens;
      }
    });
    return grouped;
  }, [filteredLogs]);

  const handleApplyPreset = (preset: 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'reset') => {
    const today = new Date
    today.setHours(0, 0, 0, 0);

    if (preset === 'today') {
      const dateStr = today.toISOString().split('T')[0];
      setStartDateStr(dateStr); setEndDateStr(dateStr);
    } else if (preset === 'yesterday') {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      setStartDateStr(dateStr); setEndDateStr(dateStr);
    } else if (preset === 'last7') {
      const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);
      setStartDateStr(lastWeek.toISOString().split('T')[0]); setEndDateStr(today.toISOString().split('T')[0]);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDateStr(firstDay.toISOString().split('T')[0]); setEndDateStr(today.toISOString().split('T')[0]);
    } else if (preset === 'reset') {
      setStartDateStr(''); setEndDateStr(''); setSelectedModelFilter('all');
    }
  };

  const handleClearLogs = () => {
    if (confirmClear) {
      clearStoredLogs(); setLogs([]); setConfirmClear(false);
    } else {
      setConfirmClear(true); setTimeout(() => setConfirmClear(false), 4000);
    }
  };

  return (
    <div className="bg-[var(--bg3)] border border-[var(--border)]/80 rounded-2xl p-5 mb-6 text-[var(--text)] relative select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border)]/70 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
            <DollarSign size={18} />
          </div>
          <div>
            <h2 className="font-sans text-[15px] font-normal uppercase tracking-wide text-[var(--text)]">
              Approx API Cost & Token Analytics
            </h2>
            <p className="text-[10px] text-[var(--text3)] font-sans uppercase">
              Real-time transaction metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={loadLogs}
            className="p-1.5 rounded-lg bg-[var(--bg2)] hover:opacity-80 text-[var(--text3)] hover:text-[var(--text)] transition-colors border border-[var(--border)] cursor-pointer text-xs flex items-center gap-1 font-mono uppercase font-black"
          >
            <RefreshCw size={11} />
            <span>Sync</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className={`p-1.5 px-3 rounded-lg text-xs font-black uppercase font-mono tracking-wider transition-all duration-200 border cursor-pointer flex items-center gap-1.5 ${
                confirmClear 
                  ? 'bg-danger/20 border-danger/40 text-danger animate-pulse' 
                  : 'bg-[var(--bg2)] border-[var(--border)] hover:border-danger/40 hover:bg-danger/20 hover:text-danger text-[var(--text3)]'
              }`}
            >
              <Trash2 size={11} />
              <span>{confirmClear ? 'Confirm Reset' : 'Reset History'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Budget cap visualizer */}
      <div className="bg-[var(--bg2)]/40 border border-[var(--border)]/60 rounded-xl p-4 mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-normal uppercase tracking-wider text-[var(--text)] font-sans">📅 Monthly Budget Cap</span>
          </div>
          <p className="text-[12px] text-[var(--text3)] font-sans leading-relaxed uppercase">
            MTD SPENDING: <strong className="text-[var(--text)] font-normal">{formatUSD(totalCostThisMonth)}</strong> OF <strong className="text-[var(--text)] font-normal">{budgetCap > 0 ? formatUSD(budgetCap) : 'UNLIMITED'}</strong> ({budgetProgress.toFixed(1)}%)
          </p>
          
          <div className="w-full bg-[var(--bg3)] rounded-full h-2 mt-2.5 overflow-hidden border border-[var(--border)]/40 relative">
            <div 
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                isBudgetExceeded 
                  ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                  : percentSpent >= 90
                      ? 'bg-gradient-to-r from-amber-500 to-rose-400'
                      : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]'
              }`}
              style={{ width: `${budgetProgress}%` }}
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-[var(--bg3)]/60 p-3 rounded-xl border border-[var(--border)]/60 justify-between md:justify-start">
          <div className="text-left">
            <label className="block text-[9px] font-sans font-normal uppercase tracking-wider text-[var(--text3)] mb-1">
              Monthly Limit (USD)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[var(--text3)]">$</span>
              <input
                type="number"
                step="1"
                min="0"
                value={budgetCap || ''}
                onChange={(e) => handleBudgetCapChange(e.target.value)}
                className="w-24 bg-[var(--bg2)] border border-[var(--border)]/80 rounded-lg p-1.5 px-2 text-xs font-mono font-normal text-[var(--text)] focus:outline-none focus:border-[var(--accent)] text-right cursor-text"
                placeholder="0.00"
              />
              <span className="text-[9px] font-sans text-[var(--text3)] shrink-0">USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="p-4 bg-[var(--bg2)]/60 border border-[var(--border)]/50 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-normal tracking-wider uppercase text-[var(--text3)] font-sans">Session Cost</span>
            <span className="text-[9px] font-bold text-[var(--success)] bg-[var(--success)]/10 px-1.5 py-0.5 rounded-full font-sans uppercase">Active</span>
          </div>
          <div>
            <p className="text-[21px] font-sans text-[var(--text)] font-normal leading-tight">
              {formatUSD(totalCostCurrentSession)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-[var(--bg2)]/60 border border-[var(--border)]/50 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-normal tracking-wider uppercase text-[var(--text3)] font-sans">Selected Cost</span>
            <span className="text-[9px] font-normal text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded-full font-sans uppercase">Filter</span>
          </div>
          <div>
            <p className="text-[21px] font-sans text-[var(--accent)] font-normal leading-tight">
              {formatUSD(totalCostFiltered)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-[var(--bg2)]/60 border border-[var(--border)]/50 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-normal tracking-wider uppercase text-[var(--text3)] font-sans">Calculated Tokens</span>
            <Activity size={10} className="text-[var(--text3)] font-sans" />
          </div>
          <div>
            <p className="text-[21px] font-sans text-[var(--text2)] font-normal leading-tight">
              {new Intl.NumberFormat('en-US').format(totalInputTokensFiltered + totalOutputTokensFiltered)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-[var(--bg2)]/60 border border-[var(--border)]/50 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-normal tracking-wider uppercase text-[var(--text3)] font-sans">Accumulated Total</span>
            <Award size={11} className="text-[var(--accent2)] font-sans" />
          </div>
          <div>
            <p className="text-[21px] font-sans text-[var(--accent2)] font-normal leading-tight">
              {formatUSD(totalCostOverall)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg2)]/25 border border-[var(--border)]/50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[11px] font-normal uppercase tracking-wider text-[var(--text3)] font-sans flex items-center gap-1.5">
            <FileText size={11} className="text-[var(--accent)]" />
            Transactional Session History ({filteredLogs.length} Entries)
          </h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text3)] font-sans font-normal border border-dashed border-[var(--border)]/50 rounded-lg">
            No API transaction logs found. Connect an API Key profile above and run generation cards to capture cost analytics.
          </div>
        ) : (
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {Object.entries(logsByApiKey).map(([keyId, groupVal]) => {
              const group = groupVal as { name: string; provider: string; logs: any[]; totalCost: number; totalTokens: number };
              return (
                <div key={keyId} className="space-y-2">
                  <div className="flex items-center justify-between sticky top-0 bg-[var(--bg2)]/95 backdrop-blur z-10 p-2 px-3 rounded-lg border border-[var(--border)]/50 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider">{group.name}</span>
                      <span className="text-[9px] text-[var(--text3)] font-mono">{group.provider}</span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[11px] font-bold text-[var(--success)]">{formatUSD(group.totalCost)}</span>
                      <span className="text-[9px] text-[var(--text3)] font-mono">{new Intl.NumberFormat('en-US').format(group.totalTokens)} tokens</span>
                    </div>
                  </div>

                  {group.logs.slice().reverse().map((log) => {
                  const rateDetails = resolveRate(log.modelId);
                  const isCurrentSession = log.sessionId === currentSessionId;
                  const formattedTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const formattedDate = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <div 
                      key={log.id}
                      className={`bg-[var(--bg2)]/80 rounded-lg border p-3 hover:border-[var(--border)] transition-all ml-2 ${
                        log.success ? 'border-[var(--border)]/40' : 'border-danger/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          {log.success ? (
                            <CheckCircle size={12} className="text-[var(--success)] shrink-0" />
                          ) : (
                            <XCircle size={12} className="text-[var(--danger)] shrink-0" />
                          )}
                          <div className="truncate text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-bold text-[var(--text)] truncate">{rateDetails.name}</span>
                              <span className="text-[9px] font-black uppercase font-mono px-1.5 bg-[var(--bg3)] rounded text-[var(--text3)]">{log.type}</span>
                            </div>
                            <p className="text-[9px] font-mono text-[var(--text3)] mt-0.5">{formattedDate} @ {formattedTime}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-right font-mono">
                          <div className="text-[10px] text-[var(--text3)]"><span>{log.inputTokens + log.outputTokens} tkn</span></div>
                          <div>
                            {log.success ? (
                              <span className="text-xs font-bold text-[var(--success)]">{formatUSD(log.cost)}</span>
                            ) : (
                              <span className="text-[10px] font-black uppercase text-danger">Failed</span>
                            )}
                          </div>
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="text-[var(--text3)] hover:text-[var(--text)] p-0.5 rounded cursor-pointer"
                          >
                            <ChevronDown size={11} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)]/30 text-[10px] font-mono text-[var(--text2)] space-y-2 bg-black/20 p-2.5 rounded-lg animate-in slide-in-from-top-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[var(--text3)] text-[8px] uppercase font-black">Prompt length</p>
                              <p>{log.inputTokens} est. tokens</p>
                            </div>
                            <div>
                              <p className="text-[var(--text3)] text-[8px] uppercase font-black">Outputs size</p>
                              <p>{log.success ? `${log.outputTokens} est. tokens` : 'Empty'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
