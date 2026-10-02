/**
 * Server-side model reference (used by the bundled server).
 * Mirrors src/lib/modelReference.ts for backend resolution.
 * Used to pick correct provider + model (especially "auto").
 */

const AUTO_MODEL_BY_TASK = {
  google: {
    reasoning: 'models/gemini-3.1-pro-preview',
    creative: 'models/gemini-3.5-flash',
    fast: 'models/gemini-2.5-flash',
    translation: 'models/gemini-3.5-flash',
    default: 'models/gemini-3.5-flash',
  },
  anthropic: {
    reasoning: 'claude-3-5-sonnet-latest',
    creative: 'claude-3-5-sonnet-latest',
    fast: 'claude-3-5-haiku-latest',
    translation: 'claude-3-5-sonnet-latest',
    default: 'claude-3-5-sonnet-latest',
  },
  xai: {
    reasoning: 'grok-4.3',
    creative: 'grok-4.3',
    fast: 'grok-beta',
    translation: 'grok-4.3',
    default: 'grok-4.3',
  },
  custom: {
    reasoning: 'custom-model',
    creative: 'custom-model',
    fast: 'custom-model',
    translation: 'custom-model',
    default: 'custom-model',
  },
};

function getProviderKey(provider) {
  const p = (provider || 'google').toLowerCase();
  if (p.includes('anthropic') || p.includes('claude')) return 'anthropic';
  if (p.includes('xai') || p.includes('grok')) return 'xai';
  if (p.includes('custom')) return 'custom';
  return 'google';
}

function getTaskCategory(hint) {
  const h = String(hint || '').toLowerCase();
  if (h.includes('steelman') || h.includes('bias-auditor') || h.includes('simulate') || h.includes('context-switch')) return 'reasoning';
  if (h.includes('eli5') || h.includes('lingo') || h.includes('vent') || h.includes('/audit')) return 'fast';
  if (h.includes('translate') || h.includes('tone') || h.includes('comm-assistant') || h.includes('feedback')) return 'translation';
  if (h.includes('apology') || h.includes('lyrics') || h.includes('prompt-forge') || h.includes('aesthetic') || h.includes('subtext')) return 'creative';
  return 'default';
}

function resolveModelForTask(provider, requestedModel, taskHint) {
  const p = getProviderKey(provider);
  const map = AUTO_MODEL_BY_TASK[p] || AUTO_MODEL_BY_TASK.google;
  const task = getTaskCategory(taskHint);
  if (!requestedModel || requestedModel === 'auto' || String(requestedModel).toLowerCase() === 'auto') {
    return map[task] || map.default;
  }
  return requestedModel;
}

// ESM + CJS dual for server bundle
export { resolveModelForTask, getTaskCategory, getProviderKey, AUTO_MODEL_BY_TASK };

module.exports = {
  resolveModelForTask,
  getTaskCategory,
  getProviderKey,
  AUTO_MODEL_BY_TASK,
};
