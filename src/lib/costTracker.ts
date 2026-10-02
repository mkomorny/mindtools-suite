// Cost and Token Tracker Utility for Gemini APIs
export interface CostLog {
  id: string;
  sessionId: string;
  sessionStartTime: number;
  timestamp: number;
  modelId: string;
  type: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  success: boolean;
  apiKeyId?: string;
  apiKeyName?: string;
  provider?: string;
}

export const PRICING_RATES: Record<string, { input: number; output: number; flatRate?: number; ratePerSecond?: number; name: string }> = {
  // Claude Models
  'claude-5-fable': { input: 10 / 1000000, output: 50 / 1000000, name: 'Claude Fable 5' },
  'claude-3-5-sonnet-latest': { input: 3 / 1000000, output: 15 / 1000000, name: 'Claude 3.5 Sonnet' },
  'claude-3-5-haiku-latest': { input: 0.8 / 1000000, output: 4 / 1000000, name: 'Claude 3.5 Haiku' },
  'claude-3-opus-latest': { input: 15 / 1000000, output: 75 / 1000000, name: 'Claude 3 Opus' },

  // Gemini Models
  'gemini-3.5-flash': { input: 1.50 / 1000000, output: 9.00 / 1000000, name: 'Gemini 3.5 Flash' },
  'models/gemini-3.5-flash': { input: 1.50 / 1000000, output: 9.00 / 1000000, name: 'Gemini 3.5 Flash' },
  'gemini-3.1-pro-preview': { input: 2.00 / 1000000, output: 12.00 / 1000000, name: 'Gemini 3.1 Pro Preview' },
  'models/gemini-3.1-pro-preview': { input: 2.00 / 1000000, output: 12.00 / 1000000, name: 'Gemini 3.1 Pro Preview' },
  'gemini-2.5-pro': { input: 1.25 / 1000000, output: 10.00 / 1000000, name: 'Gemini 2.5 Pro' },
  'models/gemini-2.5-pro': { input: 1.25 / 1000000, output: 10.00 / 1000000, name: 'Gemini 2.5 Pro' },
  'gemini-2.5-flash': { input: 0.30 / 1000000, output: 2.50 / 1000000, name: 'Gemini 2.5 Flash' },
  'models/gemini-2.5-flash': { input: 0.30 / 1000000, output: 2.50 / 1000000, name: 'Gemini 2.5 Flash' },

  // Grok Models
  'grok-4.3': { input: 1.25 / 1000000, output: 2.50 / 1000000, name: 'Grok 4.3' },
  'grok-4.20-0309-reasoning': { input: 1.25 / 1000000, output: 2.50 / 1000000, name: 'Grok 4.20 Reasoning' },
  'grok-beta': { input: 5 / 1000000, output: 15 / 1000000, name: 'Grok Beta' },
};

export function getOrCreateSessionId(): { id: string; startTime: number } {
  try {
    const cachedId = sessionStorage.getItem('mt_current_session_id');
    const cachedStart = sessionStorage.getItem('mt_current_session_start');
    if (cachedId && cachedStart) return { id: cachedId, startTime: Number(cachedStart) };
  } catch {}

  const newId = `session_${Math.random().toString(36).substring(2, 11)}`;
  const newStart = Date.now();
  try {
    sessionStorage.setItem('mt_current_session_id', newId);
    sessionStorage.setItem('mt_current_session_start', String(newStart));
  } catch {}
  return { id: newId, startTime: newStart };
}

export function resolveRate(modelId: string) {
  let rateKey = 'gemini-3.1-pro-preview';
  const modelIdLower = modelId ? modelId.toLowerCase() : '';
  if (modelId && modelId in PRICING_RATES) rateKey = modelId;
  else {
    const stripped = modelId?.startsWith('models/') ? modelId.substring(7) : modelId;
    if (stripped && stripped in PRICING_RATES) rateKey = stripped;
    else {
      const foundKey = Object.keys(PRICING_RATES).find(k => k.toLowerCase() === modelIdLower);
      if (foundKey) rateKey = foundKey;
      else if (modelIdLower.includes('opus')) rateKey = 'claude-3-opus-latest';
      else if (modelIdLower.includes('sonnet')) rateKey = 'claude-3-5-sonnet-latest';
      else if (modelIdLower.includes('haiku')) rateKey = 'claude-3-5-haiku-latest';
      else if (modelIdLower.includes('gemini-3.5')) rateKey = 'models/gemini-3.5-flash';
      else if (modelIdLower.includes('gemini-3.1')) rateKey = 'models/gemini-3.1-pro-preview';
      else if (modelIdLower.includes('gemini-2.5-pro')) rateKey = 'models/gemini-2.5-pro';
      else if (modelIdLower.includes('gemini-2.5-flash')) rateKey = 'models/gemini-2.5-flash';
      else if (modelIdLower.includes('grok-4')) rateKey = 'grok-4.3';
      else if (modelIdLower.includes('grok')) rateKey = 'grok-beta';
    }
  }
  return PRICING_RATES[rateKey] || PRICING_RATES['gemini-3.1-pro-preview'];
}

export function logTransaction(params: {
  modelId: string;
  type: string;
  promptText: string;
  responseText?: string;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; };
  success: boolean;
}): CostLog {
  const { id: sessionId, startTime: sessionStartTime } = getOrCreateSessionId();
  
  let apiKeyId = undefined, apiKeyName = undefined, provider = undefined;
  try {
    const selectedKeyId = localStorage.getItem('mt_selected_key_id');
    const savedKeysStr = localStorage.getItem('mt_api_keys');
    if (selectedKeyId && savedKeysStr) {
      const savedKeys = JSON.parse(savedKeysStr);
      const activeKey = savedKeys.find((k: any) => k.id === selectedKeyId);
      if (activeKey) {
        apiKeyId = activeKey.id;
        apiKeyName = activeKey.name;
        provider = activeKey.provider;
      }
    }
  } catch (e) {}
  
  let inputTokens = params.usageMetadata?.promptTokenCount || 0;
  let outputTokens = params.usageMetadata?.candidatesTokenCount || 0;
  
  if (params.success) {
    if (!inputTokens && params.promptText) inputTokens = Math.max(1, Math.round(params.promptText.length / 4));
    if (!outputTokens && params.responseText) outputTokens = Math.max(1, Math.round(params.responseText.length / 4));
  }

  const rate = resolveRate(params.modelId);
  let calculatedCost = 0;
  if (params.success && rate) {
    if (rate.flatRate !== undefined) calculatedCost = rate.flatRate;
    else calculatedCost = (inputTokens * rate.input) + (outputTokens * rate.output);
  }

  const logEntry: CostLog = {
    id: `cost_${Math.random().toString(36).substring(2, 9)}`,
    sessionId, sessionStartTime, timestamp: Date.now(),
    modelId: params.modelId, type: params.type,
    inputTokens, outputTokens, cost: Number(calculatedCost.toFixed(6)),
    success: params.success, apiKeyId, apiKeyName, provider
  };

  try {
    const logs = getStoredLogs();
    logs.push(logEntry);
    localStorage.setItem('mt_cost_logs', JSON.stringify(logs));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}

  return logEntry;
}

export function getStoredLogs(): CostLog[] {
  try {
    const rawLogs = localStorage.getItem('mt_cost_logs') || '[]';
    return JSON.parse(rawLogs);
  } catch { return []; }
}

export function clearStoredLogs() {
  try {
    localStorage.setItem('mt_cost_logs', '[]');
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export function formatUSD(value: number): string {
  if (value === 0) return '$0.0000';
  if (value < 0.001) return `$${value.toFixed(5)}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 5
  }).format(value);
}
