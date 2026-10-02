export type ActionMode = "Translation" | "Expand" | "Image Prompt" | "Video Prompt";

export interface TargetModel {
  id: string;
  name: string;
  provider: "Google" | "Anthropic" | "xAI" | "Custom";
  description: string;
  syntaxDescription: string;
  iconType: "google" | "anthropic" | "xai" | "custom" | "music";
}

export interface QuickStartTemplate {
  title: string;
  subtitle: string;
  targetModel: string;
  actionMode: ActionMode;
  rawInput: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  targetModel: string;
  actionMode: ActionMode;
  rawInput: string;
  finalPrompt: string;
  explanation: string;
  structuralScore: number;
  adherenceMetrics: string[];
  isFavorite?: boolean;
}
