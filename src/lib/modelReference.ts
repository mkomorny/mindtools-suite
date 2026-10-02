/**
 * Model reference and auto-selection logic for MindTools Suite.
 * Central place for provider support, model lists, and "Auto (Task Based)" resolution.
 */

export type ProviderId = 'google' | 'anthropic' | 'xai' | 'custom';

export interface ModelOption {
  name: string;
  displayName: string;
  description?: string;
}

export const PROVIDERS: { id: ProviderId; name: string }[] = [
  { id: 'google', name: 'Google (Gemini)' },
  { id: 'anthropic', name: 'Anthropic (Claude)' },
  { id: 'xai', name: 'xAI (Grok)' },
  { id: 'custom', name: 'Custom' },
];

export function getDefaultModelsForProvider(provider: string): ModelOption[] {
  if (provider === 'google') {
    return [
      { name: 'models/gemini-3.5-flash', displayName: 'Gemini 3.5 Flash', description: 'General multipurpose flash model' },
      { name: 'models/gemini-3.1-pro-preview', displayName: 'Gemini 3.1 Pro Preview', description: 'Advanced reasoning and complex task model' },
      { name: 'models/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', description: 'Fast, cost-efficient model' },
    ];
  } else if (provider === 'anthropic') {
    return [
      { name: 'claude-3-5-sonnet-latest', displayName: 'Claude 3.5 Sonnet', description: 'Most intelligent Claude 3.5 model' },
      { name: 'claude-3-5-haiku-latest', displayName: 'Claude 3.5 Haiku', description: 'Fastest Claude 3.5 model' },
      { name: 'claude-3-opus-latest', displayName: 'Claude 3 Opus', description: 'Classic powerful reasoning model' },
    ];
  } else if (provider === 'xai') {
    return [
      { name: 'grok-4.3', displayName: 'Grok 4.3', description: 'Flagship Grok model' },
      { name: 'grok-beta', displayName: 'Grok Beta', description: 'Agentic / coding focused model' },
    ];
  } else {
    return [
      { name: 'custom-model', displayName: 'Custom Model' },
    ];
  }
}

/**
 * Task categories for intelligent "Auto" model selection.
 */
export type TaskCategory =
  | 'reasoning'   // Deep analysis, steelman, bias audit, simulation
  | 'creative'    // Writing, tone, apology, lyrics, story-like
  | 'fast'        // Quick explanations, lingo, ELI5, simple rewrites
  | 'translation' // Tone translation, comms
  | 'default';

/**
 * Best model per provider for each task category when "auto" is chosen.
 * These should be the actual identifiers sent to the provider's API.
 */
const AUTO_MODEL_BY_TASK: Record<ProviderId | 'default', Record<TaskCategory, string>> = {
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
  default: {
    reasoning: 'models/gemini-3.1-pro-preview',
    creative: 'models/gemini-3.5-flash',
    fast: 'models/gemini-2.5-flash',
    translation: 'models/gemini-3.5-flash',
    default: 'models/gemini-3.5-flash',
  },
};

/**
 * Resolve the concrete model id to send to the backend.
 * If requested is 'auto' (or falsy), pick best suited for the task.
 */
export function resolveModelForTask(
  provider: string | undefined,
  requestedModel: string | undefined,
  task: TaskCategory = 'default'
): string {
  const p = (provider as ProviderId) || 'google';
  const map = AUTO_MODEL_BY_TASK[p] || AUTO_MODEL_BY_TASK.default;
  if (!requestedModel || requestedModel === 'auto' || requestedModel.toLowerCase() === 'auto') {
    return map[task] || map.default;
  }
  // If user picked explicit, use it (but normalize common names)
  return requestedModel;
}

/**
 * Infer a good TaskCategory from a tool / api path hint.
 */
export function inferTaskCategory(hint: string): TaskCategory {
  const h = (hint || '').toLowerCase();
  if (h.includes('steelman') || h.includes('bias') || h.includes('simulate') || h.includes('context')) {
    return 'reasoning';
  }
  if (h.includes('eli5') || h.includes('lingo') || h.includes('vent') || h.includes('audit')) {
    return 'fast';
  }
  if (h.includes('translate') || h.includes('tone') || h.includes('comm') || h.includes('feedback')) {
    return 'translation';
  }
  if (h.includes('apology') || h.includes('lyrics') || h.includes('prompt') || h.includes('aesthetic') || h.includes('subtext')) {
    return 'creative';
  }
  return 'default';
}
