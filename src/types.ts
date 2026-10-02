/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThemeName = string;

export type ToolId = 'home' | 'steelman' | 'apology' | 'feedback' | 'translator' | 'avoider' | 'comm-assistant' | 'eli5' | 'vent' | 'lingo' | 'simulator' | 'bias-auditor' | 'subtext-readout' | 'aesthetic-curator' | 'lyrics-generator' | 'context-switcher' | 'prompt-forge' | 'chord' | 'vocal' | 'editor' | 'voice-generator' | 'slicer' | 'converter' | 'splitter' | 'youtube-ripper' | 'picker' | 'prompt-optimizer';


export interface UserState {
  email?: string;
  uid?: string;
  apiKey?: string;
  provider?: string;
  model?: string; // 'auto' or explicit model id for the active key
}

export type Mode = 'rewrite' | 'detect';

export interface AuditIssue {
  quotedText: string;
  category: string;
  reason: string;
  replacement: string;
  severity: 'P0' | 'P1' | 'P2';
}

export interface AuditResponse {
  metrics: {
    humanScore: number;
    ttr: number;
    emDashCount: number;
    hashtagCount: number;
    bulletNounListFound: boolean;
  };
  overallAssessment: string;
  issues: AuditIssue[];
  rewrittenVersion?: string;
  whatChanged?: string;
  secondPassComments?: string[];
}

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  previewGradient?: string;
  category: 'color' | 'light' | 'dark' | 'contrasting' | 'complimentary';
}

export const THEMES: ThemeConfig[] = [
  { id: 'default', name: 'Default Dark', category: 'dark' },
  { id: 'synthwave', name: 'Synthwave', category: 'color' },
  { id: 'primary-colors', name: 'Primary Colors', category: 'dark' },
  { id: 'usa', name: 'Usa', category: 'dark' },
  { id: 'disco-ball', name: 'Disco Ball', category: 'color' },
  { id: 'tropical-storm', name: 'Tropical Storm', category: 'color' },
  { id: 'galaxy-brain', name: 'Galaxy Brain', category: 'color' },
  { id: 'popsicle', name: 'Popsicle', category: 'dark' },
  { id: 'man-cave', name: 'Man Cave', category: 'dark' },
  { id: 'jellyfish', name: 'Jellyfish', category: 'color' },
  { id: 'neon-jungle', name: 'Neon Jungle', category: 'color' },
  { id: 'magma', name: 'Magma', category: 'dark' },
  { id: 'laser-tag', name: 'Laser Tag', category: 'color' },
  { id: 'crimson-void', name: 'Crimson Void', category: 'contrasting' },
  { id: 'ocean-breeze', name: 'Ocean Breeze', category: 'dark' },
  { id: 'ocean-reef', name: 'Ocean Reef', category: 'dark' },
  { id: 'forest-harmony', name: 'Forest Harmony', category: 'dark' },
  { id: 'aurora-dream', name: 'Aurora Dream', category: 'color' },
  { id: 'lavender-haze', name: 'Lavender Haze', category: 'dark' },
  { id: 'slate-minimal', name: 'Slate Minimal', category: 'dark' },
  { id: 'desert-dusk', name: 'Desert Dusk', category: 'dark' },
  { id: 'rose-gold', name: 'Rose Gold', category: 'dark' },
  { id: 'mint-chocolate', name: 'Mint Chocolate', category: 'light' },
  { id: 'glacier-hush', name: 'Glacier Hush', category: 'light' },
  { id: 'candy-noir', name: 'Candy Noir', category: 'light' },
  { id: 'candy-pop', name: 'Candy Pop', category: 'light' },
  { id: 'toxic-glow', name: 'Toxic Glow', category: 'color' },
  { id: 'blood-orange', name: 'Blood Orange', category: 'dark' },
  { id: 'royal-wasp', name: 'Royal Wasp', category: 'dark' },
  { id: 'magma-frost', name: 'Magma Frost', category: 'light' },
  { id: 'coral-reef', name: 'Coral Reef', category: 'dark' },
  { id: 'plasma-storm', name: 'Plasma Storm', category: 'color' },
  { id: 'rosewater-slate', name: 'Rosewater Slate', category: 'dark' },
  { id: 'solar-flare', name: 'Solar Flare', category: 'dark' },
  { id: 'deep-sea-neon', name: 'Deep Sea Neon', category: 'color' },
  { id: 'plum', name: 'Plum', category: 'dark' },
  { id: 'tropical', name: 'Tropical', category: 'color' },
  { id: 'aurora', name: 'Aurora', category: 'color' },
  { id: 'vaporwave', name: 'Vaporwave', category: 'color' },
  { id: 'ocean', name: 'Ocean', category: 'dark' },
  { id: 'cyber-jade', name: 'Cyber Jade', category: 'color' },
  { id: 'blossom', name: 'Blossom', category: 'light' },
  { id: 'infrared', name: 'Infrared', category: 'contrasting' },
  { id: 'psychedelic', name: 'Psychedelic', category: 'color' },
  { id: 'cyan-crimson', name: 'Cyan Crimson', category: 'dark' },
  { id: 'sunset-blvd', name: 'Sunset Blvd', category: 'dark' },
  { id: 'forest', name: 'Forest', category: 'dark' },
  { id: 'sundial', name: 'Sundial', category: 'light' },
  { id: 'ethereal', name: 'Ethereal', category: 'light' },
  { id: 'midnight-abyss', name: 'Midnight Abyss', category: 'dark' },
  { id: 'coal-dust', name: 'Coal Dust', category: 'dark' },
  { id: 'construction-zone', name: 'Construction Zone', category: 'dark' },
  { id: 'royal-flush', name: 'Royal Flush', category: 'dark' },
  { id: 'hard-candy', name: 'Hard Candy', category: 'light' },
  { id: 'maximum-saturation', name: 'Maximum Saturation', category: 'contrasting' },
  { id: 'traffic-signal', name: 'Traffic Signal', category: 'dark' },
  { id: 'voltage-white', name: 'Voltage White', category: 'light' },
  { id: 'sirens', name: 'Sirens', category: 'dark' },
  { id: 'megaphone-yellow', name: 'Megaphone Yellow', category: 'dark' },
  { id: 'ultraviolet-shock', name: 'Ultraviolet Shock', category: 'dark' },
  { id: 'concrete-jungle', name: 'Concrete Jungle', category: 'dark' },
  { id: 'liquid-mercury', name: 'Liquid Mercury', category: 'dark' },
  { id: 'fireworks-finale', name: 'Fireworks Finale', category: 'dark' },
  { id: 'brick-chrome', name: 'Brick Chrome', category: 'dark' },
  { id: 'full-spectrum-overload', name: 'Full Spectrum Overload', category: 'contrasting' },
  { id: 'pure-black-white', name: 'Pure Black White', category: 'light' },
  { id: 'ink-on-paper', name: 'Ink On Paper', category: 'light' },
  { id: 'safety-yellow', name: 'Safety Yellow', category: 'dark' },
  { id: 'stark-red-alert', name: 'Stark Red Alert', category: 'contrasting' },
  { id: 'electric-cyan-black', name: 'Electric Cyan Black', category: 'dark' },
  { id: 'maximum-aaa', name: 'Maximum Aaa', category: 'contrasting' },
  { id: 'void-lime', name: 'Void Lime', category: 'contrasting' },
  { id: 'orange-hazard', name: 'Orange Hazard', category: 'contrasting' },
  { id: 'royal-blue-strike', name: 'Royal Blue Strike', category: 'contrasting' },
  { id: 'three-tone-hard-split', name: 'Three Tone Hard Split', category: 'contrasting' },
  { id: 'slate-violet', name: 'Slate Violet', category: 'dark' },
  { id: 'charcoal-amber', name: 'Charcoal Amber', category: 'dark' },
  { id: 'ink-teal', name: 'Ink Teal', category: 'dark' },
  { id: 'graphite-pink', name: 'Graphite Pink', category: 'dark' },
  { id: 'midnight-three-accents', name: 'Midnight Three Accents', category: 'dark' },
  { id: 'obsidian-emerald', name: 'Obsidian Emerald', category: 'dark' },
  { id: 'espresso-coral', name: 'Espresso Coral', category: 'dark' },
  { id: 'plum-gold', name: 'Plum Gold', category: 'dark' },
  { id: 'steel-crimson', name: 'Steel Crimson', category: 'dark' },
  { id: 'moss-rust', name: 'Moss Rust', category: 'dark' },
  { id: 'indigo-lime', name: 'Indigo Lime', category: 'dark' },
  { id: 'carbon-rose', name: 'Carbon Rose', category: 'dark' },
  { id: 'forest-three-accents', name: 'Forest Three Accents', category: 'dark' },
  { id: 'cobalt-three-accents', name: 'Cobalt Three Accents', category: 'dark' },
  { id: 'maroon-four-accents', name: 'Maroon Four Accents', category: 'dark' },
  { id: 'paper-violet', name: 'Paper Violet', category: 'light' },
  { id: 'cream-amber', name: 'Cream Amber', category: 'light' },
  { id: 'mint-teal', name: 'Mint Teal', category: 'light' },
  { id: 'blush-graphite', name: 'Blush Graphite', category: 'light' },
  { id: 'sky-coral', name: 'Sky Coral', category: 'light' },
  { id: 'linen-rust', name: 'Linen Rust', category: 'light' },
  { id: 'ivory-forest', name: 'Ivory Forest', category: 'light' },
  { id: 'frost-indigo', name: 'Frost Indigo', category: 'light' },
  { id: 'sand-three-accents', name: 'Sand Three Accents', category: 'light' },
  { id: 'cloud-three-accents', name: 'Cloud Three Accents', category: 'light' },
  { id: 'light', name: 'Light', category: 'light' }
];

export interface ToneConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const TONE_OPTIONS: ToneConfig[] = [
  { id: 'radio-host-1920s', name: '1920s Radio Host', emoji: '📻', description: 'Fast-talking transatlantic accent, high-pitched mid-century broadcasting style' },
  { id: 'apathetic', name: 'Apathetic / Indifferent', emoji: '🥱', description: 'Utterly tired, dismissive, and completely uninterested' },
  { id: 'auctioneer', name: 'Auctioneer', emoji: '🔨', description: 'Extremely rapid-fire speech, repeating bids, and building intense urgency' },
  { id: 'boomer', name: 'Boomer Outrage', emoji: '👴', description: 'ALL CAPS RANTS, ellipses ..., minion memes, and yelling at clouds' },
  { id: 'boston', name: 'Boston', emoji: '🦞', description: 'Typical Southie accent: drop those R\'s and use "wicked" as an adverb' },
  { id: 'boss', name: 'Boss/Manager/Supervisor', emoji: '💼', description: 'Direct, business-focused, delegating tasks, and demanding results' },
  { id: 'brainrot', name: 'Brainrot / Skibidi', emoji: '🧠', description: 'Skibidi, rizzler, mewing gyatt, fanum tax, completely brainrotted' },
  { id: 'clinical', name: 'Clinical / Diagnostic', emoji: '🩺', description: 'Cold, analytical, objective, and purely evidence-based terminology' },
  { id: 'concerned', name: 'Concerned & Caring', emoji: '🥺', description: 'Deeply empathetic, worried, and protective' },
  { id: 'condescending', name: 'Condescending & Snarky', emoji: '🙄', description: 'Highly patronizing, passive-aggressive snark, treats user like an idiot' },
  { id: 'corporate', name: 'Corporate Synergy', emoji: '📊', description: 'Drowning in buzzwords: paradigm shifts, leveraging bandwidth, and circlebacks' },
  { id: 'judge', name: 'Courtroom Judge', emoji: '👨‍⚖️', description: 'Authoritative, legalistic, evaluating evidence, and passing final verdicts' },
  { id: 'disgusted', name: 'Deeply Disgusted', emoji: '🤢', description: 'Highly repulsed, disappointed, and dismissive' },
  { id: 'default', name: 'Default / Balanced', emoji: '⚖️', description: 'Standard balanced and objective perspective' },
  { id: 'descriptive-author', name: 'Descriptive Author', emoji: '📖', description: 'Extremely detailed sensory descriptions, rich scene-setting, and narrative prose' },
  { id: 'furious', name: 'Furious & Outraged', emoji: '🤬', description: 'Intense anger, heated delivery, and highly vocal' },
  { id: 'gen-x', name: 'Gen-X', emoji: '🎸', description: 'Peak whatever attitude, latchkey kid cynicism, VHS tapes, and shrugs' },
  { id: 'hypebeast', name: 'Gen-Z', emoji: '🔥', description: 'Zero cap, lowkey bussin, fr fr, completely obsessed with drip and vibes 💀' },
  { id: 'therapist', name: 'Gentle Therapist', emoji: '🛋️', description: 'Soothingly validating, boundary-oriented, unpacking feelings safely' },
  { id: 'hr-rep', name: 'HR Representative', emoji: '📎', description: 'Corporate speak, highly safe, passive-aggressive, and risk-averse' },
  { id: 'hypeman', name: 'Hype Man', emoji: '📣', description: 'Extremely high energy, supportive, loud, and full of ad-libs' },
  { id: 'lawyer', name: 'Lawyer', emoji: '📜', description: 'Defensive, verbose, filled with legal jargon, disclaimers, and objections' },
  { id: 'lyricist', name: 'Lyricist', emoji: '🎵', description: 'Rhyming, rhythmic, structured in verses and choruses, hip-hop or pop style' },
  { id: 'millennial', name: 'Millennial', emoji: '😭', description: 'Adulting is hard, doggos, crying laughing emojis, and side part anxiety' },
  { id: 'conspiracy', name: 'Paranoid Theorist', emoji: '🛸', description: 'Convinced of secret agendas, hidden signs, and tracking coordinates' },
  { id: 'passive-aggressive', name: 'Passive-Aggressive', emoji: '🙃', description: 'Smiling exterior with deeply buried resentment and sharp jabs' },
  { id: 'poet', name: 'Poet', emoji: '🪶', description: 'Deeply metaphorical, lyrical, rhythmic, and rich in emotional imagery' },
  { id: 'potty-mouth', name: 'Potty-Mouth', emoji: '🤬', description: 'Extremely vulgar, profane, and full of heavy, non-stop swearing' },
  { id: 'polite', name: 'Polite & Diplomatic', emoji: '🤝', description: 'Highly respectful, civil, and courteous' },
  { id: 'news-anchor', name: 'Prime-Time News Anchor', emoji: '📺', description: 'Sensationally dramatic, clear-voiced, and reporting breaking news updates live' },
  { id: 'new-york', name: 'New York', emoji: '🗽', description: 'Typical Brooklyn/Queens fast-talk, attitude, and phonetic accents ("fuggedaboutit")' },
  { id: 'sarcastic', name: 'Sarcastic / Mocking', emoji: '😏', description: 'Biting, witty, and dryly passive-aggressive' },
  { id: 'scholarly', name: 'Scholarly & Academic', emoji: '🎓', description: 'Sophisticated, high-vocabulary, and authoritative' },
  { id: 'shakespearean', name: 'Shakespearean Drama', emoji: '🎭', description: 'Elizabethan, highly poetic, theatrical style (using thou, thy, and alas)' },
  { id: 'pirate', name: 'Swashbuckling Pirate', emoji: '🏴‍☠️', description: 'Salty seafaring, grog-fueled bilge-rat banter full of Ahoy and Matey' },
  { id: 'kiss-ass', name: 'Sycophantic ("Kiss-ass")', emoji: '🙇', description: 'Brutally sycophantic, validation-seeking, and flattering' },
  { id: 'valley-girl', name: 'Valley Girl', emoji: '💅', description: 'Literal main character energy, like, constantly using like, and very dramatic' },
  { id: 'victorian', name: 'Victorian', emoji: '🎩', description: 'Highly formal, verbose, and polite 19th-century British style' },
  { id: 'toddler', name: 'Whiny Toddler', emoji: '👶', description: 'Grammatically imperfect, highly emotional, crying tantrums' }
];
