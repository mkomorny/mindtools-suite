import { TargetModel, QuickStartTemplate, ActionMode } from "./types";

export const ACTION_MODES: { value: ActionMode; label: string; description: string }[] = [
  {
    value: "Translation",
    label: "Direct Format",
    description: "Converts your draft into your AI's optimal format without changing the meaning."
  },
  {
    value: "Expand",
    label: "Detailed Setup",
    description: "Adds step-by-step instructions, helpful roles, and reasoning structures."
  },
  {
    value: "Image Prompt",
    label: "AI Art Helper",
    description: "Adds rich details for image generation, including setting, lighting, and style."
  },
  {
    value: "Video Prompt",
    label: "Video Scene Planner",
    description: "Focuses on motion, camera angles, directions, and scene consistency."
  }
];

export const TARGET_MODELS: TargetModel[] = [
  {
    id: "grok-chat",
    name: "Grok Chat / Grok Research",
    provider: "xAI",
    description: "Best for deep lookups, smart reviews, and sorting out facts.",
    syntaxDescription: "Creates a clear goal up-front, a bulleted list of rules, and guidelines for word use.",
    iconType: "xai"
  },
  {
    id: "grok-imagine",
    name: "Grok Imagine",
    provider: "xAI",
    description: "Creates clean cinematic and artistic image layouts.",
    syntaxDescription: "Generates a detailed, descriptive single paragraph focused entirely on things you can see.",
    iconType: "xai"
  },
  {
    id: "gemini-chat",
    name: "Gemini Chat / Media",
    provider: "Google",
    description: "Our general-purpose helper tool for everyday conversation and tasks.",
    syntaxDescription: "Begins after defining a helpful character identity and clear step-by-step instructions.",
    iconType: "google"
  },
  {
    id: "gemini-research",
    name: "Gemini Deep Research",
    provider: "Google",
    description: "Great for finding rare facts and reviewing long lists of reports or documents.",
    syntaxDescription: "Organizes with clean section titles, helpful checklists, and research tips.",
    iconType: "google"
  },
  {
    id: "gemini-skills",
    name: "Gemini Skills",
    provider: "Google",
    description: "Handy presets and task templates you can trigger instantly with shortcuts.",
    syntaxDescription: "Groups tips into three simple sections: Main Goal, Steps to Take, and Success Marks.",
    iconType: "google"
  },
  {
    id: "claude-chat",
    name: "Claude Chat / Cowork",
    provider: "Anthropic",
    description: "Great for editing paragraphs, coding simple tasks, and comparing text.",
    syntaxDescription: "Includes background details, clear reasoning steps, and exact formatting guides.",
    iconType: "anthropic"
  },
  {
    id: "claude-artifacts",
    name: "Claude Artifacts",
    provider: "Anthropic",
    description: "Drafts code files, vector diagrams, and simple visual layouts.",
    syntaxDescription: "Groups instructions using simple tags and positive, clear dos and don'ts.",
    iconType: "anthropic"
  },
  {
    id: "claude-skills",
    name: "Claude Skills",
    provider: "Anthropic",
    description: "Creates reusable quick skills with custom phrase triggers.",
    syntaxDescription: "Adds quick note headers specifying triggering phrases and direct actions.",
    iconType: "anthropic"
  },
  {
    id: "google-flow-music",
    name: "Google Flow Music",
    provider: "Google",
    description: "Music and audio prompt writer.",
    syntaxDescription: "Organizes layout, song speed, general mood, main sound details, and story.",
    iconType: "music"
  },
  {
    id: "nano-banana-2",
    name: "Nano Banana 2 / 2 Pro",
    provider: "Custom",
    description: "Extra lightweight helper for smart devices and low-resource setups.",
    syntaxDescription: "Formats lists into categories detailing inputs, background, and steps.",
    iconType: "custom"
  },
  {
    id: "flova",
    name: "Flova Theme Schema",
    provider: "Custom",
    description: "Designed for storytelling, world setups, and simulation games.",
    syntaxDescription: "Generates a detailed scene setup outline before listing your text prompt.",
    iconType: "custom"
  }
];

export const QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  // SLIDE 1: General Writing & Planning
  {
    title: "Email Draft Assistant",
    subtitle: "Draft a polite sick leave request",
    targetModel: "claude-chat",
    actionMode: "Translation",
    rawInput: "Write a polite and professional sick leave email to my supervisor because I caught a bad cold, requesting two days off."
  },
  {
    title: "Travel Itinerary Planner",
    subtitle: "3-day weekend trip to Tokyo",
    targetModel: "grok-chat",
    actionMode: "Expand",
    rawInput: "Plan a relaxing 3-day weekend travel itinerary for a couple visiting Tokyo for the first time, prioritizing historic shrines and delicious local street food."
  },
  {
    title: "Healthy Recipe Organizer",
    subtitle: "Quick vegetarian pasta sheet",
    targetModel: "claude-artifacts",
    actionMode: "Translation",
    rawInput: "Create a simple, cleanly structured recipe outline for a healthy 15-minute garlic and tomato vegetarian pasta dish with step-by-step instructions."
  },
  {
    title: "Creative Story Starter",
    subtitle: "Atmospheric rainy cabin mystery",
    targetModel: "flova",
    actionMode: "Expand",
    rawInput: "Begin a mysterious short fiction story set in a cozy wooden cabin in the mountains on a heavily rainy autumn evening, starting with a knock on the window."
  },
  {
    title: "Workout Schedule Maker",
    subtitle: "Weekly beginner fitness plan",
    targetModel: "gemini-chat",
    actionMode: "Expand",
    rawInput: "Draft a simple, highly encouraging 5-day home workout routine for absolute beginners focusing on lightweight cardio and core strength, no equipment needed."
  },

  // SLIDE 2: Simple Coding & Layouts
  {
    title: "To-Do List HTML Page",
    subtitle: "Render complete frontend code",
    targetModel: "claude-artifacts",
    actionMode: "Translation",
    rawInput: "Build a beautiful single-file HTML/CSS todo list page where users can type tasks, check them off, and filter completed items."
  },
  {
    title: "Personal Budget Tool",
    subtitle: "A flexible savings spreadsheet",
    targetModel: "gemini-research",
    actionMode: "Expand",
    rawInput: "Explain the best rules of thumb for budgeting monthly personal expenses, and write a structured schema comparing 50/30/20 partitioning rules."
  },
  {
    title: "Birthday Bash Ideas",
    subtitle: "Theme & activity brainstormer",
    targetModel: "grok-chat",
    actionMode: "Expand",
    rawInput: "Brainstorm 5 fun, budget-friendly and highly memorable theme ideas for a 30th birthday party with active outdoor games and food options."
  },
  {
    title: "Python Calculator Script",
    subtitle: "Create addition & subtract functions",
    targetModel: "claude-chat",
    actionMode: "Translation",
    rawInput: "Write a clean, basic Python calculator script containing separate functions for adding, subtracting, multiplying, and dividing user input inputs."
  },
  {
    title: "Slack Alert Flow",
    subtitle: "Simple status notification webhook",
    targetModel: "gemini-skills",
    actionMode: "Translation",
    rawInput: "Define a basic webhook format to alert a general team channel when a simple web server goes offline or has failed to load."
  },

  // SLIDE 3: Relaxed Media & Creative
  {
    title: "Calm Beach Portrait",
    subtitle: "Peaceful warm sunset visual prompt",
    targetModel: "grok-imagine",
    actionMode: "Image Prompt",
    rawInput: "A cinematic wide shot of a peaceful sandy beach at sunset, warm orange rays reflecting on gentle ocean waves, tall green palm trees swaying softly."
  },
  {
    title: "Chill Cafe Lo-Fi Song",
    subtitle: "Mellow coffee shop audio formula",
    targetModel: "google-flow-music",
    actionMode: "Image Prompt",
    rawInput: "A slow, cozy lo-fi track with warm electric piano chords, soft crackle vinyl records noise, and a very mellow jazzy saxophone playing."
  },
  {
    title: "Cozy Study Checklist",
    subtitle: "Productive school exam scheduler",
    targetModel: "gemini-skills",
    actionMode: "Translation",
    rawInput: "Set up a clean step-by-step study schedule layout for a student preparing for a biology exam over the course of one intensive week."
  },
  {
    title: "Apology Reply Draft",
    subtitle: "Polite client service response",
    targetModel: "gemini-chat",
    actionMode: "Translation",
    rawInput: "Draft a warm, extremely polite client communication message apologizing for a shipping delay and offering a direct 20% discount coupon for future bookings."
  },
  {
    title: "Nature Forest Walk",
    subtitle: "Relaxing rain soundscape sound",
    targetModel: "google-flow-music",
    actionMode: "Image Prompt",
    rawInput: "A relaxing audio composition of soft summer rain falling on pine trees in a deep forest, birds chirping in the distance, and wind rustling the branches."
  }
];
