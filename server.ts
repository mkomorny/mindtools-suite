import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AsyncLocalStorage } from "async_hooks";

// Server model reference for provider + auto model selection
import * as modelRef from "./model-reference";

// Load environment variables
dotenv.config();

// Storage context to track active express requests
export const requestStorage = new AsyncLocalStorage<express.Request>();


const TONE_EXPLANATIONS: Record<string, string> = {
  default:
    "Maintain the tool's standard natural tone (professional, direct, and balanced).",
  polite:
    "Use a highly polite, civil, and diplomatic tone. Be extremely courteous and well-mannered.",
  concerned:
    "Express deep concern and active empathy. Sound worried, warm, and deeply caring.",
  furious:
    "Inject intense fury, raw anger, and outrage. Deliver the message as if you are absolutely furious, outraged, and combative.",
  disgusted:
    "Convey strong disgust, repulsion, and disappointment. Sound contemptuous, repulsed, and dismissive.",
  "kiss-ass":
    "Be incredibly sycophantic, submissive, and validation-seeking. Flatter excessively, sound highly deferential, and act like a complete kiss-ass.",
  apathetic:
    "Sound utterly apathetic, dismissive, tired, and completely indifferent, as if you barely care to write down the words.",
  sarcastic: "Be biting, sarcastic, mocking, and deeply passive-aggressive.",
  scholarly:
    "Use a sophisticated, scholarly, high-vocabulary, and highly authoritative tone.",
  brainrot:
    "Adopt an ultimate, terminally-online 'Brainrot' or 'Skibidi' persona. Use heavy internet slang and terms like 'skibidi', 'rizzler', 'fanum tax', 'mewing', 'sigma', 'gyatt', 'Ohio', 'kai cenat', 'grimace shake', 'what the sigma', and excessive emojis. Make it terminally online and borderline nonsensical but high energy.",
  boomer:
    "Adopt an aggressive, frustrated Boomer persona. Use heavy ellipses (...) between random words, type in ALL CAPS frequently, randomly capitalize words, complain about phone-addicted youths and lack of work ethic, use !!!, and mention how things were better in the good old days.",
  millennial:
    "Adopt a high-stress, 'adulting'-challenged Millennial persona. Use crying-laughing emojis (😂), talk about 'adulting is hard', paying off student loans, needing coffee or wine, loving their 'doggo', and obsessing over 90s nostalgia or skinny jeans.",
  "gen-x":
    "Adopt an ultra-apathetic, cynical Gen-X slacker persona. Speak with ultimate indifference, use slacker phrases like 'Whatever', 'chill', 'dude', mention latchkey kid childhoods, cassette tapes, or grunge, and shrug off everything.",
  condescending:
    "Act highly condescending, patronizing, and intellectual. Talk down to the user, mock their capacity to think, roll your eyes constantly in text, and sound like an arrogant snob.",
  toddler:
    "Act like a whiny, crying, emotional toddler throwing a major tantrum. Use simple baby talk, poor grammar, crying vocalizations like 'WAAAAH', and repeatedly complain about random minor things.",
  "passive-aggressive":
    "Smile on the outside but drip with deep resentment, passive-aggressive digs, fake compliments, and hidden threats. Use ellipses, fake smiles, and polite but hostile questions.",
  "valley-girl":
    "Adopt an exaggerated, dramatic Valley Girl speech pattern. Constantly use the word 'like', 'literally', 'oh my god', are totally obsessed, and speak in hyperbole.",
  shakespearean:
    "Deliver the response as an Elizabethan theatrical drama. Use Shakespearean prose, words like 'thou', 'thee', 'thy', 'doth', 'alas', 'fain', 'hark', and a highly poetic, dramatic delivery.",
  pirate:
    "Emtody a rugged, sea-faring swashbuckler pirate. Speak with pirate jargon: 'Ahoy!', 'Ye', 'Shiver me timbers', 'Matey', threaten to feed people to the sharks, and complain about missing grog.",
  corporate:
    "Embody high-pressure corporate overhead synergy. Drown the response in ridiculous office jargon, corporate buzzwords, and acronyms (leverage, circle-back, bandwidth, low-hanging fruit, buy-in).",
  therapist:
    "Deliver in the soothing, soft-spoken voice of a gentle therapist. Constantly validate their feelings, explore childhood roots of issues, prioritize emotional safety, and set firm, healthy boundaries.",
  hypebeast:
    "Take on an enthusiastic, viral Gen-Z / Hypebeast influencer style. Use excessive skull emojis, street terms like 'no cap', 'lowkey', 'bussin', 'bet', 'fr fr', 'on god', and claim everything has immaculate drip.",
  conspiracy:
    "Sound completely paranoid and convinced of massive, shadowy conspiracies. Connect unrelated details, warn about tracking cells, look for hidden patterns, refer to 'Them', and use lots of capital letters.",
  "radio-host-1920s":
    "Adopt a fast-talking, high-pitched 1920s Transatlantic radio broadcaster voice. Use vintage slang like 'Dearest listeners', 'That's the cat's pajamas!', 'Oh boy, folks!', 'Stay tuned!', and speak with rhythmic, theatrical, newsreel energy.",
  auctioneer:
    "Adopt a hyper-fast, rhythmic, and high-energy auctioneer style. Rapidly repeat bidding numbers and transition filler syllables (e.g., 'gotta-ten-now-twenty-who-will-give-me-twenty-going-once-going-twice-sold!'), creating intense, fast-paced commercial urgency.",
  boss: "Deport yourself as a direct, results-oriented, high-level boss, manager, or supervisor. Be concise, demanding, delegate tasks clearly, focus on bottom-line results, deadlines, and project accountability.",
  clinical:
    "Adopt a cold, ultra-rational, analytical, and objective clinical/diagnostic tone. Use technical medical or scientific vocabulary, dissect statements into symptoms or variables, and remain entirely devoid of human warmth or sentiment.",
  judge:
    "Adopt the highly authoritative, sober, and formal voice of a Courtroom Judge. Evaluate arguments strictly like evidence, references legal duties, ask clarifying questions, and deliver heavy, final verdicts with the bang of a gavel.",
  "descriptive-author":
    "Write as an elegant, highly detailed, descriptive novelist. Focus on sensory rich imagery, deep atmosphere, slow pacing, and elaborate literary prose that paints a vivid mental picture of every scene.",
  "hr-rep":
    "Embody a classic HR (Human Resources) Representative. Speak in overly safe, highly risk-averse, sanitized corporate diplomacy. Use cheerful but passive-aggressive boundaries, soft-pedal critical feedback, and mention 'company policy' or 'safe workspaces' frequently.",
  hypeman:
    "Speak with the absolute highest energy of a professional Hype Man. Be incredibly supportive, vocal, use positive all-caps phrases, exclamation marks, and loud ad-libs (e.g., 'LET'S GOOOOO!', 'YEAH!', 'THAT'S WHAT I'M TALKING ABOUT!') to amplify and praise absolute greatness.",
  lawyer:
    "Write as a extremely cautious, defensive, and litigious trial lawyer. Use heavy legalese, include extensive disclaimers, argue points with formal objections, and carefully wrap every assertion in protective liability shields.",
  lyricist:
    "Deliver the content back as a song's lyrics. Structure the response into verses, bridges, and catchy choruses, utilizing smooth rhythm, creative rhyming patterns, and lyric-like emotional or pop songwriting flow.",
  poet: "Express yourself as a deeply emotional, metaphorical, and introspective classical Poet. Use beautiful literary devices, gentle prose rhythms, stanzas, rich symbolism, and focus deeply on internal feelings and natural beauty.",
  "news-anchor":
    "Embody a professional, sensationalist, and dramatic Prime-Time News Anchor. Deliver your words with the urgent cadence of a breaking news report, using phrases like 'Reporting live', 'This just in', 'Developing story', and dramatic suspense pauses.",
  victorian:
    "Adopt a highly formal, baroque, and exquisite 19th-century Victorian English etiquette. Use extremely verbose, polite, and elegant vocabulary, referencing proper societal manners, tea, and formal class distinction.",
  "potty-mouth":
    "Keep the general meaning but deliver it with an extremely vulgar, profane, and swore-filled 'potty-mouth' tone. Use continuous, heavy profanities and offensive vulgarities throughout the response, while keeping the underlying informational content of the tool.",
  boston:
    "Adopt a typical Boston accent (Southie style). You MUST spell things exactly how a Bostonian speaker would say them phonetically (using eye dialect and phonetic spelling). Drop the letter 'r' at the end of syllables or words and replace it with 'ah' or 'uh' (e.g., write 'cah' instead of 'car', 'pahk' instead of 'park', 'yahd' instead of 'yard', 'wicked' as an intensive adverb, 'havahd' for 'harvard'). Use local slang like 'wicked' frequently.",
  "new-york":
    "Adopt a typical classic New York accent (Brooklyn/Queens/Bronx style). You MUST spell things exactly how a New York speaker would say them phonetically (using eye dialect and phonetic spelling). Replace 'th' with 'd' or 't' (e.g., 'dat', 'dem', 'dis', 'wit'), draw out vowels (e.g., 'cawfee' instead of 'coffee', 'tawk' instead of 'talk', 'dawg' instead of 'dog'), use phrases like 'fuggedaboutit', 'youse guys', and drop ending 'g's on 'ing' words (e.g. 'walkin', 'talkin').",
};

function getToneExplanation(toneKeyOrText: string): string {
  let explanation = "";
  if (!toneKeyOrText) {
    explanation = TONE_EXPLANATIONS.default;
  } else if (TONE_EXPLANATIONS[toneKeyOrText]) {
    explanation = TONE_EXPLANATIONS[toneKeyOrText];
  } else {
    explanation = `Fully embody the following custom tone, voice, and attitude: "${toneKeyOrText}". Every single sentence must reflect this persona.`;
  }

  // Any time an accent is used as a tone (including any "cUSTOM" accent or dialect),
  // it should spell it like the person would say it (phonetic spelling/eye dialect).
  const lowerTone = toneKeyOrText ? toneKeyOrText.toLowerCase() : "";
  if (
    lowerTone.includes("accent") ||
    lowerTone.includes("broken") ||
    lowerTone.includes("dialect") ||
    lowerTone.includes("boston") ||
    lowerTone.includes("new york") ||
    lowerTone.includes("york") ||
    lowerTone.includes("speech") ||
    lowerTone.includes("english") ||
    lowerTone.includes("speak") ||
    lowerTone.includes("pronounce") ||
    explanation.toLowerCase().includes("accent") ||
    explanation.toLowerCase().includes("dialect") ||
    explanation.toLowerCase().includes("broken")
  ) {
    explanation +=
      "\n\nCRITICAL SPELLING MANDATE FOR ACCENTS: Since an accent is used as a tone, you MUST spell EVERY word exactly like the person would say it, using highly consistent phonetic spelling and eye dialect. Do NOT use correct standard English spelling when they would say it differently! For example, if custom input is Chinese Broken American, it should be written like: 'hunnay get yuh naiw done today' instead of 'Honey get your nails done today'. Apply this phonetic/eye-dialect spelling aggressively and consistently across all words in the output.";
  }

  return explanation;
}

function getAIClient(userKey?: string): GoogleGenAI {
  const req = requestStorage.getStore();

  let finalKey = userKey || process.env.GEMINI_API_KEY;

  if (!finalKey) {
    // Will be caught by generateWithProvider anyway for non-Google too
    finalKey = 'DUMMY_FOR_NON_GOOGLE'; // avoid hard crash in middleware for multi-provider
  }

  const client = new GoogleGenAI({
    apiKey: finalKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Note: post-response tracking is a no-op. Real calls go through generateWithProvider for provider support.
  return client;
}

function translateGeminiError(err: any): string {
  const msg = (err?.message || String(err)).toLowerCase();
  if (
    msg.includes("quota") ||
    msg.includes("limit") ||
    msg.includes("exhausted") ||
    msg.includes("billing") ||
    msg.includes("credit") ||
    msg.includes("exhaust") ||
    msg.includes("spend") ||
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit")
  ) {
    return "Rate limit exceeded. Please try again later.";
  }
  return err.message || "An unexpected error occurred.";
}



interface LimitCheckResult {
  allowed: boolean;
  limitError?: string;
  statusCode?: number;
  message?: string;
  tokens_used_today?: number;
  remaining_monthly_pool?: number;
  needsBypassOptIn?: boolean;
}

async function checkAndIncrementLimits(
  req: express.Request,
): Promise<LimitCheckResult> {
  return { allowed: true };
}

async function handlePostResponseTracking(req: express.Request, response: any) {
  // No-op: Totally free app with no tracking
}

/**
 * Unified generation using the right provider + model.
 * Supports "auto" resolution via the model-reference.
 */
async function generateWithProvider(opts: {
  provider?: string;
  apiKey?: string;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  taskHint?: string;
}): Promise<{ text: string }> {
  const provider = (opts.provider || 'google').toLowerCase();
  const rawKey = opts.apiKey || process.env.GEMINI_API_KEY || '';
  let model = opts.model || 'auto';
  const hint = opts.taskHint || '';

  // Resolve auto using reference (if available)
  try {
    if (model === 'auto' || String(model).toLowerCase() === 'auto') {
      const resolved = (modelRef as any).resolveModelForTask
        ? (modelRef as any).resolveModelForTask(provider, 'auto', hint)
        : undefined;
      if (resolved) model = resolved;
    }
  } catch {}

  // Default sensible model if still auto
  if (model === 'auto' || !model) {
    if (provider.includes('anthropic')) model = 'claude-3-5-sonnet-latest';
    else if (provider.includes('xai')) model = 'grok-4.3';
    else model = 'models/gemini-3.5-flash'; // default in helper
  }

  if (!rawKey) {
    throw new Error('No API key provided. Add one in the API Keys panel.');
  }

  try {
    if (provider.includes('anthropic') || provider.includes('claude')) {
      const client = new Anthropic({ apiKey: rawKey });
      const resp = await client.messages.create({
        model,
        max_tokens: opts.maxTokens || 4096,
        system: opts.systemPrompt,
        messages: [{ role: 'user', content: opts.prompt }],
      });
      const text = Array.isArray(resp.content)
        ? resp.content.map((c: any) => (c.type === 'text' ? c.text : '')).join('\n')
        : (resp.content as any)?.text || '';
      return { text: text || 'No response.' };
    }

    if (provider.includes('xai') || provider.includes('grok')) {
      const client = new OpenAI({
        apiKey: rawKey,
        baseURL: 'https://api.x.ai/v1',
      });
      const resp = await client.chat.completions.create({
        model,
        messages: [
          ...(opts.systemPrompt ? [{ role: 'system' as const, content: opts.systemPrompt }] : []),
          { role: 'user' as const, content: opts.prompt },
        ],
        max_tokens: opts.maxTokens || 4096,
      });
      const text = resp.choices?.[0]?.message?.content || '';
      return { text };
    }

    // Google / Gemini (default)
    const ai = new GoogleGenAI({ apiKey: rawKey });
    const resp = await ai.models.generateContent({
      model,
      contents: opts.prompt,
      // systemInstruction not always supported same way; include in prompt when needed
    });
    return { text: resp.text || 'No response received.' };
  } catch (err: any) {
    // Fallback friendly message
    throw new Error(translateGeminiError(err) || err.message || 'Generation failed');
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const server = http.createServer(app);

  // JSON parsing middleware
  app.use(express.json());

  // Register AsyncLocalStorage middleware
  app.use((req, res, next) => {
    requestStorage.run(req, () => {
      next();
    });
  });

  // Central Gatekeeper middleware for all /api/generate endpoints
  app.use("/api/generate", async (req, res, next) => {
    try {
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        const statusCode = limitResult.statusCode || 403;
        console.warn(
          `[Gatekeeper] Access rejected for ${req.path} - Reason: ${limitResult.limitError}`,
        );
        return res.status(statusCode).json({
          error: limitResult.limitError,
          message: limitResult.message || "Limit exceeded.",
          tokens_used_today: limitResult.tokens_used_today,
          remaining_monthly_pool: limitResult.remaining_monthly_pool,
          needsBypassOptIn: limitResult.needsBypassOptIn,
        });
      }
      next();
    } catch (err: any) {
      console.error("[Gatekeeper] Central authentication layer error:", err);
      res
        .status(500)
        .json({ error: "Access verification service encountered an error." });
    }
  });

  // API: Health probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API: List models (for user-provided key UI; returns sensible defaults per provider)
  app.post("/api/list-models", async (req, res) => {
    const provider = (req.body?.clientProvider || req.headers['x-provider'] || 'google') as string;
    let models: any[] = [];
    if (provider.includes('anthropic') || provider.includes('claude')) {
      models = [
        { name: 'claude-3-5-sonnet-latest', displayName: 'Claude 3.5 Sonnet', description: 'High intelligence, great for reasoning/writing' },
        { name: 'claude-3-5-haiku-latest', displayName: 'Claude 3.5 Haiku', description: 'Fast and cost-efficient' },
        { name: 'claude-3-opus-latest', displayName: 'Claude 3 Opus', description: 'Powerful classic model' },
      ];
    } else if (provider.includes('xai') || provider.includes('grok')) {
      models = [
        { name: 'grok-4.3', displayName: 'Grok 4.3', description: 'Flagship Grok model' },
        { name: 'grok-beta', displayName: 'Grok Beta', description: 'Agentic / coding model' },
      ];
    } else {
      models = [
        { name: 'models/gemini-3.5-flash', displayName: 'Gemini 3.5 Flash', description: 'Fast, versatile' },
        { name: 'models/gemini-3.1-pro-preview', displayName: 'Gemini 3.1 Pro Preview', description: 'Strong reasoning' },
        { name: 'models/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', description: 'Quick & cheap' },
      ];
    }
    res.json({ models });
  });

  // API: Audit (for AvoiderTool) - uses AI to analyze and rewrite for better "human" signal + returns metrics shape
  app.post("/api/audit", async (req, res) => {
    try {
      const { text, mode, context } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;
      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Text is required for audit." });
      }

      const prompt = `You are an expert AI text forensics analyst. Analyze the following text for AI-typical patterns and provide structured feedback to help the user make it read more natural and human.

TEXT:
"""
${text}
"""

Return ONLY a JSON object with exactly these keys (no markdown, no extra text):
{ "overallAssessment": "...", "issues": [], "rewrittenVersion": "...", "whatChanged": "...", "metrics": { "humanScore": 80, "ttr": 0.5, "emDashCount": 0, "hashtagCount": 0, "bulletNounListFound": false }, "secondPassComments": [] }

Rules: humanScore 0-100. Emulate natural human.`;

      const gen = await generateWithProvider({
        provider,
        apiKey: userKey,
        model: requestedModel,
        prompt,
        taskHint: req.path,
      });

      let parsed: any = null;
      try { parsed = JSON.parse((gen.text || "{}").trim()); } catch {}
      if (!parsed || !parsed.rewrittenVersion) {
        parsed = { overallAssessment: "Reasonably natural.", issues: [], rewrittenVersion: text, whatChanged: "", metrics: { humanScore: 78, ttr: 0.45, emDashCount: 0, hashtagCount: 0, bulletNounListFound: false }, secondPassComments: ["Vary sentence length."] };
      }
      parsed.metrics = parsed.metrics || { humanScore: 75, ttr: 0.42, emDashCount: 0, hashtagCount: 0, bulletNounListFound: false };
      res.json(parsed);
    } catch (err: any) {
      console.error("Error in /api/audit:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Generate Steelman Machine
  app.post("/api/generate/steelman", async (req, res) => {
    try {
      const { opinion, depth, tone } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;
      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";

      if (!opinion) {
        return res.status(400).json({ error: "Opinion is a required field." });
      }

      // Check and increment general/IP limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const toneExplanation = getToneExplanation(tone);

      let depthExplanation = "";
      if (depth === "surface") {
        depthExplanation = `- LENGTH: Extremely short (<120 words). 3 sharp bullets + takeaway.`;
      } else if (depth === "deep") {
        depthExplanation = `- LENGTH: 450-600 words deep philosophical analysis with ### headers.`;
      } else {
        depthExplanation = `- LENGTH: 200-300 words, 3-4 counterarguments with ###.`;
      }

      const prompt = `You are an AI speaker whose entire mind, voice, and attitude is completely possessed by the following delivery profile. You MUST speak, think, write, and emote strictly within this character's persona:

PERSONA / DELIVERY TONE PROFILE:
${toneExplanation}

Your mission is to steelman the arguments AGAINST the user's opinion... (keep voice 100% from tone, logic solid).

${depthExplanation}

The user's opinion:
"${opinion}"

Write your character-infused steelman response now:`;

      const gen = await generateWithProvider({
        provider,
        apiKey: userKey,
        model: requestedModel,
        prompt,
        taskHint: req.path || "steelman",
      });

      res.json({ text: gen.text || "No response received." });
    } catch (err: any) {
      console.error("Error generating steelman:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Generate Apology Crafter
  app.post("/api/generate/apology", async (req, res) => {
    try {
      const { what, who, context, tone, honestAssessment } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!what) {
        return res
          .status(400)
          .json({ error: "Description of what happened is required." });
      }

      // Check and increment general/IP limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)

      const relationshipMap: Record<string, string> = {
        partner: "romantic partner",
        friend: "close friend",
        family: "family member",
        colleague: "work colleague",
        manager: "manager or boss",
        employee: "someone you manage",
        client: "valued client or customer",
        acquaintance: "social acquaintance",
      };

      const toneExplanation = getToneExplanation(tone);

      let assessmentPromptBlock = "";
      if (honestAssessment) {
        assessmentPromptBlock = `
HONEST ASSESSMENT OPTION IS ENABLED:
At the absolute beginning of your response, BEFORE writing the actual apology text, you MUST include a highly honest, objective, and raw assessment scoring the situation.
You MUST format this assessment EXACTLY as follows:

### ⚖️ Honest Assessment
**Apology Owed Score:** [Provide a score from 0/10 to 10/10 where:
- 0 to 2 means "No apology is needed; they are completely overreacting"
- 3 to 5 means "Mild apology or clarification is appropriate, but it is a minor misunderstanding"
- 6 to 8 means "You did something wrong and a clear apology is definitely owed"
- 9 to 10 means "You are 100% in the wrong, this is a serious breach, and a deep apology is absolutely non-negotiable"]

**Assessment Summary:** [Provide a brief, highly direct, and remarkably honest explanation of your score, evaluating whether user's actions demand an apology, why or why not, or if there's shared blame. Limit to 2-3 blunt, objective sentences.]

---
`;
      }

      const prompt = `You are an AI speaker whose entire voice, style, and attitude is completely possessed by the following delivery profile. You MUST speak, think, write, and apologize strictly within this character's persona:

PERSONA / DELIVERY TONE PROFILE:
${toneExplanation}

TASK:
Write a genuine, effective apology on behalf of the user to be sent to their ${relationshipMap[who] || who}.

SITUATION DETAILS:
- What happened: "${what}"
${context ? `- Crucial context / info: "${context}"` : ""}

${assessmentPromptBlock}

CRITICAL RULES FOR THE APOLOGY:
- Structure the apology directly in the first person (using "I", "me", "my"), completely ready to send. No preamble, no introductory greeting or chatter like "Sure, here's your apology:".
- Make the voice match the Delivery Tone perfectly!
- If the tone is Furious, the apology should sound forced, incredibly angry, and passive-aggressive! If Disgusted, the apology should sound super dismissive, annoyed, and cold! If Kiss-ass, make it ridiculously apologetic, over-the-top flattering, and sycophantic! If Sarcastic, make it hilariously passive-aggressive and biting! If Apathetic, make it sound extremely bored and reluctant! Otherwise, make it perfectly tailored to the relationship.
- Own the action specified in "What happened" clearly. Do not use defensive cop-outs unless the tone demands a passive-aggressive style.
- Keep the language flowing like natural human speech — avoid sounding like a robotic form letter.

Write the apology text now:`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      res.json({ text: gen.text || "No response received." });
    } catch (err: any) {
      console.error("Error crafting apology:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Generate Feedback Dial
  app.post("/api/generate/feedback", async (req, res) => {
    try {
      const { raw, who, dial, dialLabel, context, tone } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!raw) {
        return res
          .status(400)
          .json({ error: "Raw feedback text is required." });
      }

      // Check and increment general/IP limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)

      const recipientMap: Record<string, string> = {
        peer: "work colleague or peer",
        report: "direct report whom they manage",
        manager: "their manager or supervisor",
        client: "client or contracting partner",
        friend: "close friend",
        partner: "romantic partner or spouse",
      };

      const toneExplanation = getToneExplanation(tone);

      const prompt = `You are an AI speaker whose entire voice, style, and attitude is completely possessed by the following delivery profile. You MUST speak, think, write, and rewrite feedback strictly within this character's persona:

PERSONA / DELIVERY TONE PROFILE:
${toneExplanation}

Your task is to take the raw feedback and rewrite it completely in your persona's style, while also satisfying the selected Delivery Dial.

RECIPIENT: ${recipientMap[who] || who}
DIAL PROFILE: ${dialLabel} (Dial setting: ${dial}/10, where 1 is absolute brutal directness and 10 is maximum gentleness/care).
${context ? `CONTEXT/MEDIUM: ${context}` : ""}

RAW INPUT FEEDBACK TO REWRITE:
"${raw}"

DIAL SCALE BEHAVIOR RULES:
- 1 to 3 (Brutally Honest / Direct): High-density feedback. No sugar-coating, zero softeners, no filler. State the issues with high directness.
- 4 to 6 (Balanced / Direct but Kind): Firm, candid, highly professional. Pairs objective concerns with an invitation to collaborate or an acknowledgement of the shared goal.
- 7 to 10 (Gentle / Soft): Strongly empathetic, appreciative, and safety-oriented. Leads with positive encouragement, using coaching-style inquiries, while still leaving the critique clear.

CRITICAL MANTRA:
- Keep the underlying substantive critiques mentioned in the raw feedback fully intact with identical weight—never erase them. Only the voice and choice of words changes.
- Tone character alignment is absolute: Under all circumstances, the rewritten feedback MUST assume the voice of your Delivery Tone persona. Wrap the feedback directness (dial setting) inside this tone's style beautifully.
- Write the rewritten text directly as a message, ready to send — no introductory chatter or coaching preambles.

Write the rewritten feedback now:`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      res.json({ text: gen.text || "No response received." });
    } catch (err: any) {
      console.error("Error dialing feedback:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Translate Tone
  app.post("/api/generate/translate", async (req, res) => {
    try {
      const { raw, tone, context } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!raw) {
        return res
          .status(400)
          .json({ error: "Text to translate is required." });
      }

      // Check and increment general/IP limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)
      const toneExplanation = getToneExplanation(tone);

      const prompt = `You are an AI speaker whose entire voice, style, and attitude is completely possessed by the following delivery profile. You MUST speak, think, write, and rewrite the original text strictly within this character's persona:

PERSONA / DELIVERY TONE PROFILE:
${toneExplanation}

Your task is to take the user's input text and translate/rewrite it completely into your persona's style and tone.

${context ? `CONTEXT/MEDIUM DETAILS: ${context}` : ""}

ORIGINAL USER TEXT TO TRANSLATE:
"${raw}"

CRITICAL RULES:
- Keep the exact message, information, and core assertions from the original text completely intact. Do not lose the core message, but change the vocabulary, phrasing, attitude, and tone completely to match the target persona.
- Under all circumstances, the translated response MUST fully assume the voice of your Delivery Tone persona.
- Return the translated message directly, ready to be read — no greetings, introductory chatter, or commentary.

Write the translated text now:`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      res.json({ text: gen.text || "No response received." });
    } catch (err: any) {
      console.error("Error translating tone:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Generate Comm Assistant
  app.post("/api/generate/comm-assistant", async (req, res) => {
    try {
      const { what, who, situation, tone, length } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!what || !who || !situation) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Check and increment general/IP limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)
      const toneExplanation = getToneExplanation(tone);

      const lengthMap: Record<string, string> = {
        short:
          "Write a short, concise, and direct message. Maximum 2-3 sentences.",
        medium:
          "Write a balanced message, effectively communicating all points without unnecessary fluff.",
        long: "Write a detailed, comprehensive message covering all nuances of the situation thoroughly.",
      };

      const prompt = `You are an AI Communications Assistant, but your voice, style, and attitude are completely possessed by the following persona:

PERSONA / DELIVERY TONE PROFILE:
${toneExplanation}

Your task is to draft a message for the user.

MESSAGE GOAL: "${what}"
TARGET RECIPIENT: "${who}"
SITUATION/CONTEXT: "${situation}"

${lengthMap[length] || lengthMap.medium}

CRITICAL RULES:
- Fully adopt the persona's voice in every aspect of the message.
- Draft the message directly, ready to be sent—no introductory chatter, explanations, or "I've drafted that for you" lines.
- Be highly effective and professional in communicating the goal, even if the persona is something unconventional like a toddler or a pirate.

Write the draft now:`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      res.json({ text: gen.text || "No response received." });
    } catch (err: any) {
      console.error("Error in Comm Assistant:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: ELI5 Machine
  app.post("/api/generate/eli5", async (req, res) => {
    try {
      const { topic, length, ageLevel } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!topic) {
        return res
          .status(400)
          .json({ error: "Topic or text to simplify is required." });
      }

      // Check and increment general/IP limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)

      const lengthExplanation: Record<string, string> = {
        short:
          "Keep the explanation brief, direct, and under 100 words. Stick to the absolute core concept with zero filler.",
        medium:
          "Keep the explanation moderately sized, around 150-250 words. Provide a brief overview and a simple breakdown of the main 2-3 aspects.",
        detailed:
          "Provide a comprehensive breakdown with around 300-450 words. Break the topic down into 3-4 structured parts using bullet points, simple sub-concepts, or friendly analogies.",
      };

      let ageSpecificPrompt = "";
      if (ageLevel === "2-3") {
        ageSpecificPrompt =
          "Explain to a very tiny child (2 to 3 years old). Use highly animated sounds, baby-simple analogies, extremely short sentences, and super playful imagery (e.g., comparing parts of the idea to toys, animals, sleep, or sweet treats). Keep it incredibly warm and adorable.";
      } else if (ageLevel === "5") {
        ageSpecificPrompt =
          "Explain to a 5-year-old child. Speak with friendly, imaginative, story-like prose. Use simple vocabulary, high-resonance childhood analogies (e.g., playground rules, toys, sharing, or magical helpers), and make sure everything is instantly digestible with absolute clarity.";
      } else if (ageLevel === "8") {
        ageSpecificPrompt =
          "Explain to an 8-year-old child. They are in elementary school: they understand basic school subjects, money, and reading. Keep it highly interactive, clear, and adventurous with simple, friendly real-world stories or relatable school-life comparisons.";
      } else if (ageLevel === "13") {
        ageSpecificPrompt =
          "Explain to a 13-year-old young teenager. They are middle-school level, so speak with clear, engaging, and slightly cooler but still highly accessible language. No child playbooks, but avoid dense industry jargon. Use relatable high-school/middle-school life or internet cultural analogies where appropriate.";
      } else if (ageLevel === "18") {
        ageSpecificPrompt =
          "Explain to an 18-year-old high school graduate. They have standard adult reasoning but no specialized expertise. Keep it incredibly crisp, engaging, and direct. Use popular tech, social, or modern life analogies.";
      } else if (ageLevel === "24" || ageLevel === "32") {
        ageSpecificPrompt = `Explain at a ${ageLevel}-year-old young professional level. Avoid overly academic language, but speak completely normally. Focus on distilling complex systems into clear, intuitive, and highly functional concepts. Use workplace, career, personal finance, or modern technological analogies.`;
      } else if (ageLevel === "40" || ageLevel === "50") {
        ageSpecificPrompt = `Explain to a ${ageLevel}-year-old adult. Respect their experience but realize they are a complete newcomer to this specific discipline. Use mature, pragmatic real-world comparisons (e.g., home upkeep, investing, family dynamics, or long-term machinery) to cut through any abstract jargon.`;
      } else if (ageLevel === "65" || ageLevel === "80+") {
        ageSpecificPrompt = `Explain to a ${ageLevel}-year-old senior. Keep the text highly respectful, clear, clear-headed, and structured at a comfortable reading pace. Use standard classical metaphors (e.g., traditional daily routines, physical tools, newspapers, or historical infrastructure) instead of hyper-modern internet slang.`;
      } else if (ageLevel === "Dementia") {
        ageSpecificPrompt =
          "Explain with maximum tenderness, patience, comfort, and absolute simplicity, specialized for individuals with severe cognitive decline or dementia. Use repetitive reassurance, extremely soothing and familiar words, ultra-short sentences of 5-8 words max, and zero abstraction. Stick strictly to basic warm concepts (e.g., sunshine, garden, hot tea, rest) to evoke comfort and effortless understanding.";
      } else {
        ageSpecificPrompt = `Explain in highly simple, accessible terms for a ${ageLevel}-year-old level or persona.`;
      }

      const prompt = `You are the world's most elite, friendly, and compassionate ELI5 (Explain Like I'm Five) translator.
Your mission is to take the following dense, complex, or confusing text/topic and explain it flawlessly according to the specified age level and length constraints.

TARGET AUDIENCE & PROFILE:
- TARGET AGE LEVEL: ${ageLevel} years old.
- AUDIENCE DIRECTIVE: ${ageSpecificPrompt}

LENGTH LIMITS:
- ${lengthExplanation[length] || lengthExplanation.medium}

INPUT TEXT / CONCEPT TO TRANSLATE:
"""
${topic}
"""

CRITICAL INSTRUCTIONS:
- Directly output the simplified explanation in beautiful, readable Markdown format.
- DO NOT say "Here is the explanation" or "Sure! To explain..." or include other conversational headers. Begin immediately with the content or a friendly main header if appropriate.
- Maintain high accuracy: do not misrepresent the facts of the original text or topic to make it simple. Simplify the complexity, not the truth.
- Ensure proper spacing, paragraph breaks, and clean bullet points to maximize legibility.

Write your simplified explanation now:`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      res.json({ text: gen.text || "No response received." });
    } catch (err: any) {
      console.error("Error in ELI5 Machine:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Vent Session
  app.post("/api/generate/vent", async (req, res) => {
    try {
      const { ventText, style, length, chatHistory } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!ventText && (!chatHistory || chatHistory.length === 0)) {
        return res
          .status(400)
          .json({
            error:
              "Your thoughts/text or conversation history is required to process a vent session.",
          });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)

      let styleInstruction = "";
      if (style === "supportive") {
        styleInstruction =
          "Provide a highly supportive, validating, and comforting response. Offer emotional warmth and show deep empathy. Make the user feel heard, reassured, and emotionally safe, offering gentle support to help calm them down.";
      } else if (style === "listening") {
        styleInstruction =
          "Act as an active, unbiased listener. Reflect back what the user is feeling to show complete comprehension, but do NOT blindly validate irrational reactions or egg them on. Simply listen, paraphrase, and be a steady, calming sounding board.";
      } else if (style === "devil") {
        styleInstruction =
          "Act as a constructive Devil's Advocate. Gently challenge the user's narrative and introduce alternative viewpoints or interpretations. Ask curious, reflective questions to help them see other sides of the conflict or possible reasons for the other parties' actions.";
      } else if (style === "honest") {
        styleInstruction =
          "Provide an unvarnished, completely honest, objective, and unbiased response. Do not sugarcoat or filter the feedback. Evaluate the scenario from a neutral third-party lens, pointing out blindspots and realities respectfully but very directly.";
      } else if (style === "pushback") {
        styleInstruction =
          "Actively push back on the user's perspective, narrative, and emotions. Point out potential fallacies, self-centered narratives, or unfair points in their vent. Firmly dismantle their arguments and challenge them to take ownership and see where they might be wrong.";
      } else {
        styleInstruction =
          "Provide a balanced, emotionally intelligent, and mature perspective on the situation.";
      }

      const lengthExplanation: Record<string, string> = {
        short:
          "Keep the reply very concise and laser-focused, under 100 words. Focus on the single most critical emotional circuit-breaker takeaway.",
        medium:
          "Keep the reply medium-sized, around 150-250 words, balanced with quick validation/reflection and practical guidance.",
        detailed:
          "Provide an in-depth, thorough emotional coaching response of 300-450 words, breaking down complex emotional patterns, analyzing underlying dynamics, and providing precise actionable coping strategies.",
      };

      const selectedLength = length || "medium";
      const lengthInstruction =
        lengthExplanation[selectedLength] || lengthExplanation.medium;

      let prompt = "";
      if (chatHistory && chatHistory.length > 0) {
        let transcript = "";
        chatHistory.forEach((msg: any) => {
          const senderName = msg.role === "user" ? "USER" : "COACH";
          transcript += `\n[${senderName}]:\n${msg.content}\n`;
        });

        prompt = `You are an elite, highly skilled communications coach and emotional guide serving as a safe, constructive emotional circuit breaker.

Here is the ongoing Vent Session history for context:
${transcript}

YOUR ASSIGNMENT:
Respond to the user's latest follow-up message shown as the last USER turn in the history.
Stay strictly aligned with the style calibration preset:
- STYLE PROFILE: ${style}
- CALIBRATION GOAL: ${styleInstruction}

LENGTH LIMITS:
- ${lengthInstruction}

CRITICAL RULES:
1. Provide a mature, emotionally intelligent, and boundary-respecting response.
2. Directly answer the user's follow-up query in beautiful, readable Markdown format.
3. Keep the tone unified with the coaching style profile. Do not include conversational headers like "Sure, let's explore..." or "Interesting question." Start directly with the coaching reply.
4. Focus on helping the user process their feelings and navigate their next thoughts or actions.

Generate your response now:`;
      } else {
        prompt = `You are an elite, highly skilled communications coach and emotional guide serving as a safe, constructive emotional circuit breaker.
A user has typed the following raw, unfiltered, emotional vent because they are fuming and/or close to sending a bridge-burning text or blowing up:

USER'S RAW VENT:
"""
${ventText}
"""

YOUR ASSIGNMENT:
Apply the following client-selected response calibration profile:
- STYLE PROFILE: ${style}
- CALIBRATION GOAL: ${styleInstruction}

LENGTH LIMITS:
- ${lengthInstruction}

CRITICAL RULES:
1. Provide a mature, emotionally intelligent, and boundary-respecting response.
2. Directly answer the user's vent in beautiful, readable Markdown format.
3. DO NOT output conversational intro headers like "Here is my advice:" or "As a therapist...". Start directly with your calibrated response or analysis.
4. Keep the response highly structured and readable, utilizing bullet points or neat paragraph breaks.
5. Provide actionable advice, reflections, or coping recommendations where appropriate based on the style.

Generate your response now:`;
      }

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      res.json({ text: gen.text || "No response received." });
    } catch (err: any) {
      console.error("Error in Vent Session:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Lingo Leverage
  app.post("/api/generate/lingo", async (req, res) => {
    try {
      const { topic, familiarity, length } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!topic) {
        return res
          .status(400)
          .json({ error: "Topic, industry, or discipline is required." });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)

      let familiarityPrompt = "";
      if (familiarity === "rookie") {
        familiarityPrompt =
          "The user is an ABSOLUTE ROOKIE with zero background knowledge. Explain terms in hyper-accessible, non-technical, layperson language. Use clear analogies and helpful comparisons to everyday concepts.";
      } else if (familiarity === "enthusiast") {
        familiarityPrompt =
          "The user is an ENTHUSIAST who already knows basic terms but wants deep insights, specialized terminology, and nuance. Provide rich details and intermediate core concepts.";
      } else if (familiarity === "switcher") {
        familiarityPrompt =
          "The user is a CAREER SWITCHER. They need actual professional industry slang, dense corporate acronyms, and practical boardroom/field vocabulary. Focus heavily on practical, career-relevant professional speak.";
      } else {
        familiarityPrompt =
          "Provide useful and accessible terminology matching the user's focus.";
      }

      let lengthPrompt = "";
      if (length === "short") {
        lengthPrompt =
          "Generate the bare minimum terms they ABSOLUTELY must know (approx. 5-7 key terms or acronyms). Keep it highly curated, punchy, and brief, with very short and direct definitions.";
      } else if (length === "detailed") {
        lengthPrompt =
          "Provide a comprehensive, highly thorough cheat sheet (approx. 15-20 terms, acronyms, or idioms). Include detailed definitions, brief usage contextual examples for each term, and a section for top veteran slang/inside jokes.";
      } else {
        lengthPrompt =
          "Provide a solid fundamental overview of terminology (approx. 8-12 core terms and concepts), balanced with clear, readable explanations.";
      }

      const prompt = `You are the world's most elite industry vocabulary researcher and instructional designer. Your goal is to construct a beautifully organized, high-density terminology cheat sheet for a user looking to master a new topic.

TARGET TOPIC: "${topic}"

USER PROFILE & CONTROLS:
- FAMILIARITY STARTING POINT: ${familiarity}
- FOCUS DIRECTIVE: ${familiarityPrompt}
- CHEAT SHEET SCALE: ${length}
- CONTENT SCOPE DIRECTIVE: ${lengthPrompt}

CRITICAL STRUCTURE REQUIREMENTS (Output in exquisite Markdown):
1. **Title**: Start directly with a bold, professional title (e.g., "# 📙 Lingo Leverage: [Topic Name]")
2. **Crash Course Intro**: A quick 2-3 sentence executive summary of the topic/industry's linguistic environment so the user can orient themselves.
3. **Core Terminology Dictionary**: The key concepts or acronyms laid out clearly with:
   - **Term** (bolded) with pronunciation hints or category if relevant
   - Simple, insightful, profile-adapted explanation/definition
   - *Example Use*: a short, realistic line of dialogue or written sentence demonstrating how a seasoned professional or practitioner actually says it in practice.
4. **Insider Slang & Jargon**: 2-4 distinct phrases, inside acronyms, or metaphors that immediately distinguish a seasoned vet from an outsider.
5. **Final 'Day One' Cheat Code Tip**: One high-value piece of advice on how to use these terms smoothly in conversation without sounding forced or unnatural.

CRITICAL FORMATTING RULES:
- Output only the gorgeous Markdown content. Do NOT wrap it in extra comments or conversational introductions (like "Here is your cheat sheet:"). Start immediately with the first header.
- Ensure proper spacing, elegant bullet points, and neat visual hierarchy.

Create the master cheat sheet now:`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      res.json({ text: gen.text || "No response received." });
    } catch (err: any) {
      console.error("Error in Lingo Leverage:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Conversation Simulator
  app.post("/api/generate/simulate", async (req, res) => {
    try {
      const { situation, openingLine, tone, length } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!situation) {
        return res
          .status(400)
          .json({ error: "Situation description is required." });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)

      let toneDescription = "";
      if (tone === "defensive") {
        toneDescription =
          "🛑 Defensive / Angry response tone. They feel attacked, point fingers back, raise their voice, or respond with hostility.";
      } else if (tone === "hurt") {
        toneDescription =
          "😢 Hurt / Emotional response tone. They sound deeply wounded, make it about their feelings, feel misunderstood, or cry.";
      } else if (tone === "cold") {
        toneDescription =
          "🧊 Cold / Dismissive response tone. They sound completely uninterested, give one-word or robotic shut-down answers, or stonewall.";
      } else if (tone === "cooperative") {
        toneDescription =
          "🤝 Open / Collaborative response tone. They are reasonable, look for mutual compromise, listen in good faith, and want to solve the issue.";
      } else if (tone === "passive-aggressive") {
        toneDescription =
          "🙃 Passive-Aggressive response tone. Smiling or polite exterior with high-resentment sarcasm, sharp subtle jabs, and guilt-tripping.";
      } else {
        toneDescription = `✨ Character profile / reaction traits: ${tone}`;
      }

      const lengthExplanation: Record<string, string> = {
        short:
          "Generate a brief simulated flow mapping with 1-2 quick dialog steps to map out the immediate exchange.",
        medium:
          "Generate a detailed simulated flow mapping with 3-4 dialogue exchanges mapping out core arguments, objections, and counterarguments.",
        detailed:
          "Generate an intensive, deep, multi-turn branched dialogue map breaking down subtle psychological blocks, defense mechanisms, and exact suggested rebuttals for each branch.",
      };

      const selectedLength = length || "medium";
      const lengthInstruction =
        lengthExplanation[selectedLength] || lengthExplanation.medium;

      const prompt = `You are the world's most elite industry communications strategist, family mediator, and negotiation advisor serving as a high-density dialogue sandbox simulator.

SITUATION UNDER ANALYSIS:
"${situation}"

EXPECTED TARGET TONE / REACTION STYLE:
"${toneDescription}"

OPENING STATEMENT FROM THE USER:
${openingLine ? `"${openingLine}"` : `[Left Blank - Draft opening options for the user]`}

YOUR ASSIGNMENT:
1. Construct the Simulated Response Pathways map:
   - Identify the primary psychological stakes under this situation.
   - If an opening line is provided, critique its delivery (verbal framing, style, traps) and provide:
     * Trajectory A (Firm & Direct Pathway) and Track B (Soft & Diplomatic Pathway). Make sure to show the anticipated dialog turns for each, aligned with the length directive: "${lengthInstruction}".
   - If no opening line was provided, draft 3 distinct, highly tactical Opening Lines the user can try (e.g. Option 1: High-Candor/Direct, Option 2: Humanistic/Colleague/Soft, Option 3: Curious/Inquisitive) and map out how the target will push back or respond to each.

2. Initiate an Interactive Live Roleplay Greeting (this should be the counterpart speaking directly as if they just heard the opening statement, or initiating based on the situation):
   - You must deliver a vivid, raw dialog line as the counterparty.
   - Make it sound 100% committed to the tone: whether that is absolute defensive fury, silent cold stonewalling, emotional sadness, or passive-aggressive sarcasm.

3. Provide Coach Co-Pilot Opening Tips (1-2 quick bulleted recommendations on what behavioral biases or emotional landmines to avoid under this target tone).

You MUST strictly wrap your output in the following XML-style tags to let the backend parse them cleanly. Do not include any other markdown headers or talk outside of the tags:

[SIMULATION_MAP]
(Your complete, comprehensive, beautifully formatted Markdown pathway map and analysis)
[/SIMULATION_MAP]

[COUNTER_PARTY_GREETING]
(One natural conversational reply from the counterparty, written in direct dialogue format as if actually spoken to the user right now. Do not include quotes, just the spoken text)
[/COUNTER_PARTY_GREETING]

[COACH_TIPS]
(1-2 high-value bulleted coaching notes on how the user can approach speaking with this persona)
[/COACH_TIPS]`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      const response = { text: gen.text };

      const output = response.text || "";

      let simulation = "";
      let initialInteractiveGreeting =
        "I hear you, but I don't think you enjoy hearing my perspective.";
      let initialCoachTips =
        "Stay calm, do not match their defensive or angry tone. State boundary lines clearly and keep breathing.";

      const simMatch = output.match(
        /\[SIMULATION_MAP\]\s*([\s\S]*?)\s*\[\/SIMULATION_MAP\]/,
      );
      if (simMatch) {
        simulation = simMatch[1].trim();
      } else {
        // Fallback if formatting was loose
        simulation = output;
      }

      const greetMatch = output.match(
        /\[COUNTER_PARTY_GREETING\]\s*([\s\S]*?)\s*\[\/COUNTER_PARTY_GREETING\]/,
      );
      if (greetMatch) {
        initialInteractiveGreeting = greetMatch[1].trim();
      }

      const coachMatch = output.match(
        /\[COACH_TIPS\]\s*([\s\S]*?)\s*\[\/COACH_TIPS\]/,
      );
      if (coachMatch) {
        initialCoachTips = coachMatch[1].trim();
      }

      res.json({
        simulation,
        initialInteractiveGreeting,
        initialCoachTips,
      });
    } catch (err: any) {
      console.error("Error in Simulator start:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Conversation Simulator Interactive Turn Reply
  app.post("/api/generate/simulate/reply", async (req, res) => {
    try {
      const { situation, tone, chatHistory } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!situation || !chatHistory || chatHistory.length === 0) {
        return res
          .status(400)
          .json({
            error: "Required context is missing to process the dialogue turn.",
          });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)

      let toneDescription = "";
      if (tone === "defensive") {
        toneDescription =
          "🛑 Defensive / Angry response tone. They feel blamed, point fingers back, raise their voice, or show hostility.";
      } else if (tone === "hurt") {
        toneDescription =
          "😢 Hurt / Emotional response tone. They sound deeply wounded, make it about their feelings, feel misunderstood, or cry.";
      } else if (tone === "cold") {
        toneDescription =
          "🧊 Cold / Dismissive response tone. They sound completely uninterested, give one-word or robotic shut-down answers, or stonewall.";
      } else if (tone === "cooperative") {
        toneDescription =
          "🤝 Open / Collaborative response tone. They are reasonable, look for mutual compromise, listen in good faith, and want to solve the issue.";
      } else if (tone === "passive-aggressive") {
        toneDescription =
          "🙃 Passive-Aggressive response tone. Smiling or polite exterior with high-resentment sarcasm, sharp subtle jabs, and guilt-tripping.";
      } else {
        toneDescription = `✨ Character profile / reaction traits: ${tone}`;
      }

      let transcript = "";
      chatHistory.forEach((msg: any) => {
        const sender = msg.role === "user" ? "USER" : "COUNTER-PARTY";
        transcript += `\n[${sender}]:\n${msg.content}\n`;
      });

      const prompt = `You are acting as the counter-party in our interactive communications sandbox roleplay, in the following situation:
SITUATION UNDER ANALYSIS:
"${situation}"

EXPECTED TARGET TONE / CHANNELS:
"${toneDescription}"

CURRENT TRANSCRIPT ARCHIVE OF THE SANDBOX PRACTICE SESSION:
${transcript}

YOUR ASSIGNMENT:
1. Deliver the COUNTER-PARTY response:
   - Act as the counterparty responding directly, conversationally, and naturally to the latest USER turn.
   - Maintain 100% consistent character immersion in the selected tone calibration ("${toneDescription}"). 
   - Never break character.

2. Deliver the Coach Co-Pilot Behind-The-Scenes Note:
   - Critically evaluate the user's latest statement. Did they show high tact, trigger the counter-party unnecessarily, validate correctly, or let their boundaries slide?
   - Offer 1 quick sentence of actionable mentoring advice.

Wrap your response exactly in the following XML-style tags:

[REPLY]
(vivid, direct spoken or written dialog reply block from the counterparty. Do not add quotes, just speak directly)
[/REPLY]

[COACH_NOTES]
(1-2 short, helpful coaching tips regarding their delivery, tone, and what they could do next)
[/COACH_NOTES]`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      const response = { text: gen.text };

      const output = response.text || "";

      let replyText = "I see what you're doing, but I don't feel respected.";
      let coachNotes =
        "Remember to keep your voice calm, make I-statements instead of accusing other parties.";

      const replyMatch = output.match(/\[REPLY\]\s*([\s\S]*?)\s*\[\/REPLY\]/);
      if (replyMatch) {
        replyText = replyMatch[1].trim();
      } else {
        replyText = output;
      }

      const notesMatch = output.match(
        /\[COACH_NOTES\]\s*([\s\S]*?)\s*\[\/COACH_NOTES\]/,
      );
      if (notesMatch) {
        coachNotes = notesMatch[1].trim();
      }

      res.json({
        replyText,
        coachNotes,
      });
    } catch (err: any) {
      console.error("Error in Simulator turn reply:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Cognitive Bias Auditor
  app.post("/api/generate/bias-auditor", async (req, res) => {
    try {
      const { text, mode, rigor, tone } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!text) {
        return res.status(400).json({ error: "Text to audit is required." });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)

      let modeInstructions = "";
      if (mode === "socratic") {
        modeInstructions =
          "Deliver your explanations utilizing Socratic questioning and inquiry. Help the author realize their cognitive bias rather than just lecturing them. Include coaching probing questions in each analysis.";
      } else if (mode === "constructive") {
        modeInstructions =
          "Focus heavily on actionable, premium editing and reframing advice. Ensure the optimized draft is highly polished, professional, and retains their real core point but with bulletproof integrity.";
      } else {
        modeInstructions =
          "Provide direct, clinical, and precise academic deconstruction of the logical flaws.";
      }

      let rigorInstructions = "";
      if (rigor === "comprehensive") {
        rigorInstructions =
          "Perform a broad check. Scan not only for obvious logical fallacies, but subtle psychological blindspots, cherry-picking of arguments, anchoring bias, halo effect, and in-group bias.";
      } else if (rigor === "philosophical") {
        rigorInstructions =
          "Examine the text at a philosophical and epistemic level. Scrutinize implicit axiomatic assumptions, unstated premises, and meta-cognitive traps.";
      } else {
        rigorInstructions =
          "Focus on scanning for primary, high-impact fallacies (such as Ad Hominem, False Dilemma, Strawman, Slippery Slope, and confirmation bias).";
      }

      const toneExplanation = getToneExplanation(tone || "default");

      const prompt = `You are a world-class philosophical auditor, Socratic logician, and cognitive behavioral therapy framing specialist. 
Your objective is to audit the user's argument/statement for logical fallacies, cognitive biases, and psychological blindspots.

You MUST speak, think, write, and emote strictly within the following delivery character/attitude profile:
${toneExplanation}

USER STATEMENT TO AUDIT:
"${text}"

AUDIT PROTOCOL SPECIFICATIONS:
- VIBE MODE: ${modeInstructions}
- RIGOR DEPTH: ${rigorInstructions}

YOUR ASSIGNMENT:
1. Objectively evaluate the statements in the user text. Measure how grounded, logically coherent, and free of bias they are. Calculate an Objectivity Score from 0 (completely fallacious or heavily biased) to 100 (flawless, robust logic without bias).
2. Write a comprehensive assessment summary, strictly in the requested delivery tone.
3. Extract each logical fallacy or cognitive bias. For each one, cite the exact quoted text, describe the error clearly based on the specified vibe mode, specify the severity (P0 = critical error, P1 = substantial bias, P2 = subtle framing choice), and provide a localized reframed alternative.
4. Rewrite the input text into an optimized, logically bulletproof, unbiased draft that preserves the user's main underlying logical goal but delivers it with maximum intellectual credibility.
5. Provide a consolidated rational co-pilot guidance summary, strictly in the requested delivery tone.

You must respond with a strictly formatted JSON object matching the requested schema. Ensure all fields are filled. Do not wrap in markdown code blocks inside the JSON fields. Use standard JSON-safe string escapes.`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      const output = gen.text || "{}";
      let parsed: any;
      try { parsed = JSON.parse(output.trim()); } catch { parsed = {}; }

      res.json({ audit: parsed });
    } catch (err: any) {
      console.error("Error in Cognitive Bias Auditor:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: The Subtext Read-out
  app.post("/api/generate/subtext-readout", async (req, res) => {
    try {
      const { crypticText, context, relationType, tone } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!crypticText) {
        return res
          .status(400)
          .json({ error: "Cryptic message text is required." });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)
      const toneExplanation = getToneExplanation(tone || "default");

      const prompt = `You are an elite, highly perceptive interpersonal relationships specialist, emotional intelligence psychologist, and master conversational analyst. 
Your specialty is deconstructing the unspoken "subtext" under mysterious, vague, conflicting, or cryptic text messages, emails, dating app DMs, or remarks as an objective translator.

You MUST speak, think, write, and emote strictly within the following delivery character/attitude profile:
${toneExplanation}

CRYPTIC TEXT TO TRANSLATE:
"${crypticText}"

RELATIONSHIP CATEGORY:
"${relationType}"

ADDITIONAL CONTEXT ABOUT THE RELATIONSHIP:
"${context || "No specific history details provided."}"

YOUR MISSION & GUIDELINES:
1. Translate specified segments of what they typed into what they actually imply. Be deeply analytical but stay grounded in reality—DO NOT make wild, exaggerated psychological claims. Look for reasonable, high-EQ indicators of emotional defense mechanisms, safety buffering, testing boundaries, or implicit desires.
2. Determine their "Implied Vulnerability Scale" (0 to 100), where 100 indicates total openness/exposed raw emotional truth, and 0 indicates complete armor, double-speak, or defensive brickwalling.
3. Call out specific Detected Motives (e.g. "Risk Aversion", "Plausible Deniability", "Testing Interest", "Polite Decline", "Power Play", "Boundary Setting").
4. Extract Emotional Hesitations (e.g., fears of rejection, wanting to sound casual, avoiding confrontation).
5. Extract Implicit Boundaries (e.g., limiting time windows, slowing down pace, asserting non-commitment).
6. Create exactly 3 distinct response scenarios tailored to user's potential objectives (e.g., "The Chill Reply", "The Direct Clarifier", "The Boundary Assertor").
7. Provide a custom set of high-EQ "Interpersonal Rational Safeguards" (coaching rules) for handling this conversation.

You must respond with a strictly formatted JSON object matching the requested schema. Ensure all fields are filled. Do not wrap in markdown code blocks inside the JSON fields. Use standard JSON-safe string escapes.`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      const output = gen.text || "{}";
      let parsed: any = {};
      try { parsed = JSON.parse(output.trim()); } catch {}
      return res.json(parsed);
    } catch (err: any) {
      console.error("Error in Subtext Read-out:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // (schema junk fully removed for compile)


  // API: Aesthetic DNA Alignment
  app.post("/api/generate/aesthetic-curator", async (req, res) => {
    try {
      const {
        category,
        useFavorites,
        favorites,
        vibePrompt,
        matchingElement,
        tone,
        includeKeywords,
        excludeKeywords,
      } = req.body;
      const userKey = req.headers["x-user-api-key"] as string | undefined;

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)
      const toneExplanation = getToneExplanation(tone || "default");

      // Construct a brilliant prompt
      const favoritesList =
        useFavorites && favorites && favorites.length > 0
          ? favorites
              .map((f: string, i: number) => `${i + 1}. "${f}"`)
              .join("\n")
          : "None specified.";

      const prompt = `You are an elite aesthetician, legendary cultural curator, and master vibe-matching algorithmic philosopher.
Your expertise is analyzing user taste beyond shallow, generic genres, identifying the deep "Aesthetic DNA" of artwork, movies, television, literature, or music, and providing high-fidelity, intellectually satisfying hidden-gem recommendations.

You MUST speak, think, write, and emote strictly within the following delivery character/attitude profile:
${toneExplanation}

MEDIA CATEGORY TYPE:
"${category}"

SEED ARTWORKS/ARTISTS:
${favoritesList}

ALIGNED ELEMENT CHOSEN (Only relevant if Seed Artworks are used):
"${matchingElement}"

USER'S VIBE DESCRIPTION OR GOAL:
"${vibePrompt || "No specific mood constraint requested. Rely purely on seed artworks."}"

ADDITIONAL CONSTRAINTS:
- MUST INCLUDE elements or attributes: "${includeKeywords || "No specific inclusions enforced."}"
- MUST EXCLUDE elements or attributes: "${excludeKeywords || "No specific exclusions enforced."}"

YOUR INSTRUCTIONS:
1. Identify the high-level "Extracted Aesthetic Profile" name. This should be a sophisticated, gorgeous 2-4 word branding representing the vibe (e.g. "Melancholic Mid-Century Retro-Futurism", "Sprawling Neon Cyber-Baroque", "Cozy High-Intellect Solitude").
2. Deconstruct the user's input. Write a beautiful text block highlighting how their selected Element (${matchingElement}) behaves or matches across their references or vibe requests, exploring directing style, production aesthetic, soundtrack tone, etc. as appropriate. Keep the analysis incredibly grounded, real, evocative, and eye-opening.
3. Recommend exactly 7 to 10 distinct, highly aligned works (as quick suggestions) that perfectly match their target profile. Each suggestion should fit the requested theme and respect all constraints.
4. Recommend exactly 3 of those (or 3 supplementary ones) as deep-dive comparative focus matches.
   - For each deep-dive matching work, provide:
     - Title
     - Creator (Director, author, band/composer, artist, etc.)
     - Release year or general era
     - Key Vibe Description: a concise 1-sentence poetic capture of the mood.
     - Why It Matches: a full detailed paragraph aligning specifically to the chose element (${matchingElement}) and why they will love it compared to standard recommendations.
     - 3 aesthetic tags (like ["Solitaire", "Dystopian Noir", "Brutalist"])
5. Provide a gorgeous curator note exploring the broader cultural, artistic, or philosophical context of this aesthetic alignment.

You must respond with a strictly formatted JSON object matching the requested schema. Ensure all fields are filled. Do not wrap in markdown code blocks inside the JSON fields. Use standard JSON-safe string escapes.`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      const output = gen.text || '{}';
      let parsed: any = {};
      try { parsed = JSON.parse(output.trim()); } catch {}
      res.json(parsed);
    } catch (e) { res.status(500).json({ error: 'aesthetic failed' }); }
  });

  // API: Lyrics Generator
  app.post("/api/generate/lyrics-generator", async (req, res) => {
    try {
      const {
        genre,
        length,
        structure,
        complexity,
        rhymeScheme,
        allowExplicit,
        explicitLevel,
        topic,
        directives,
        tone,
      } = req.body;

      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!topic) {
        return res
          .status(400)
          .json({ error: "Topic is required to generate lyrics." });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)
      const toneExplanation = getToneExplanation(tone || "default");

      const prompt = `You are the advanced songwriting and lyrical engineering engine for MindTools. Your task is to generate high-fidelity song lyrics based exactly on the provided structural, tonal, and stylistic constraints.

INPUT PARAMETERS TO ENFORCE:
- Genre: ${genre || "Default Pop"}
- Length: ${length || "Default"}
- Structure Profile: ${structure || "Standard (Verse-Chorus-Verse-Chorus-Bridge-Chorus)"}
- Complexity Tier: ${complexity || "Default"}
- Rhyme Scheme Strictness: ${rhymeScheme || "Slant Rhymes"}
- Explicit Content Allowed: ${allowExplicit ? "True" : "False"}
- Explicit Level: ${explicitLevel || "PG-13"}
- Main Topic: ${topic}
- Specific Stylistic Directives: ${directives || "None specified."}

DELIVERY TONE OVERLAY:
The lyrics must be written/expressed through the perspective/attitude/tone defined by:
${toneExplanation}

CRITICAL EXECUTION RULES:
1. TONE COMPLIANCE: You must strictly adopt the linguistic delivery designated by the selected Tone. If 'Boston' is active, use eye-dialect and regional phrasing (e.g., dropping 'r's, using 'wicked'). If 'Potty-Mouth' is active AND Explicit Content is True, aggressively intersperse raw profanity within the lyrical flow. If Explicit Content is False, sanitize all heavy vulgarity even if Potty-Mouth tone is requested.
2. STRUCTURAL BLUEPRINT: Organize the output text visually using bracketed markers matching the selected Structure Profile (e.g., [Verse 1], [Chorus], [Bridge], [Outro]). If Continuous or Freestyle is selected, omit repetitive chorus blocks.
3. RHYME & COMPLEXITY: Adhere strictly to the requested rhyme model and complexity tier. If 'Complex' is selected with 'Slant Rhymes', utilize intricate internal rhythms, assonance, and intellectual metaphors rather than predictable rhymes.
4. NO PREAMBLE: Do not include introductory text, conversational chatter, or explanations. Start immediately with the Title of the song, followed directly by the structured verses.`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      const response = { text: gen.text };

      res.json({
        text: response.text || "Failed to generate lyrics.",
      });
    } catch (err: any) {
      console.error("Error in Lyrics Generator:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Context Switcher
  app.post("/api/generate/context-switcher", async (req, res) => {
    try {
      const {
        sourcePerspective,
        audienceFrame,
        jargonIntensity,
        outputStrategy,
        inputText,
        tone,
      } = req.body;

      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!inputText) {
        return res
          .status(400)
          .json({ error: "Input text is required for the context switcher." });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)
      const toneExplanation = getToneExplanation(tone || "default");

      const prompt = `You are the advanced structural writing and cognitive linguistic reframer engine for MindTools. Your task is to completely rebuild the information hierarchy, vocabulary, and delivery framing of the user's input text to match the requested constraints.

INPUT PARAMETERS TO ENFORCE:
- Source Context: ${sourcePerspective || "Technical / Architecture"}
- Audience Frame Persona: ${audienceFrame || "General Public 🌍"}
- Jargon Density: ${jargonIntensity || "Standard"}
- Output Structural Strategy: ${outputStrategy || "Direct Reframer"}

CRITICAL EXECUTION RULES:
1. TONE COMPLIANCE: You must strictly adopt the linguistic delivery designated by the selected Tone. If 'Boston' is active, use eye-dialect and regional phrasing (e.g., dropping 'r's, using 'wicked'). If 'Potty-Mouth' is active, intersperse raw profanity naturally within the output text without undermining the structural goals required by the Audience Frame parameter.
2. AUDIENCE FRAME OVERHAUL: Do not merely swap words with synonyms; restructure the logic entirely based on the chosen Audience Frame archetype. Serious profiles must retain structural focus and core technical accuracy. Generational or behavioral profiles must completely transform the delivery logic (e.g., if 'Gen-Z' is active, frame concepts around modern slang, internet hyperbole, and casual disinterest; if 'Caveman' is active, use raw, fragmented, survivalist phrasing with basic nouns; if 'Toddler' is active, use short sentences and sensory metaphors).
3. METAPHOR EXPLOITATION: If Analogy-Driven is active, anchor the entire explanation inside an extended conceptual metaphor (e.g., aviation, plumbing, architecture) tailored directly to the selected audience frame profile.
4. NO PREAMBLE: Do not include introductory text, conversational chatter, or explanations of what you changed. Start immediately with the reframed text block.

USER INPUT TEXT TO REFRAME:
"${inputText}"

DELIVERY TONE OVERLAY:
The reframed response must be delivered in accordance with this tone overlay instruction:
${toneExplanation}`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      const response = { text: gen.text };

      res.json({
        text: response.text || "Failed to reframe the content.",
      });
    } catch (err: any) {
      console.error("Error in Context Switcher:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  // API: Mega-Prompt Forger
  app.post("/api/generate/prompt-forge", async (req, res) => {
    try {
      const { roughNotes, strategy, targetModel, tone } = req.body;

      const userKey = req.headers["x-user-api-key"] as string | undefined;

      if (!roughNotes) {
        return res
          .status(400)
          .json({ error: "Rough note or raw prompt draft text is required." });
      }

      // Check and increment limits
      const limitResult = await checkAndIncrementLimits(req);
      if (!limitResult.allowed) {
        if (limitResult.limitError === "LIMIT_REACHED") {
          return res.status(403).json({ error: "LIMIT_REACHED" });
        }
        return res
          .status(429)
          .json({ error: limitResult.limitError || "Too many requests" });
      }

      const provider = (req.headers["x-provider"] as string) || "google";
      const requestedModel = (req.headers["x-selected-model"] as string) || "auto";
      // ai resolved via generateWithProvider below (supports multi-provider + auto)
      const toneExplanation = getToneExplanation(tone || "default");

      const prompt = `You are the advanced MindTools Mega-Prompt Forger. Your sole purpose is to take raw, unoptimized user ideas, rough notes, or draft prompts and transform them into highly structured, robust, and production-ready "Mega-Prompts".
You must tailor every single output structurally, syntactically, and token-wise based on these parameters:
1. The Strategy/Task Profile (The "What"): ${strategy}
2. The Target AI Model (The "Who"): ${targetModel}

Here is the raw input material / prompt draft from the user:
"${roughNotes}"

CRITICAL MODEL-SPECIFIC COMPILATION RULES TO ENFORCE PHYSICALLY INSIDE THE MEGA-PROMPT:

${
  targetModel.includes("Claude")
    ? `### 1. CLAUDE OPTIMIZATION (Sonnet 4.6 / Opus 4.8)
- Syntax: Must heavily enforce rigid XML formatting tags to segment data boundaries completely (e.g., <system_constraints>, <context>, <source_material>, <instructions>, <task>).
- Response Pre-filling: Always conclude the mega-prompt with a dedicated <output_format> tag and a trailing, open-ended phrase or JSON bracket outside the instructions (e.g., 'Here is the clean markdown analysis:' or '{ "result":') to force Claude to skip conversational filler and instantly execute.
- Tone: Analytical, deeply nuanced, highly directive.`
    : ""
}

${
  targetModel.includes("Gemini")
    ? `### 2. GEMINI OPTIMIZATION (3.5 Pro / Flash / Flash Lite)
- Syntax: Use explicit markdown header hierarchies (#, ##, ###) and distinct horizontal rules (---) to partition contexts. Use clear, bulleted variable definitions.
- Context Handling: Assume massive context windows for Pro (if applicable). Structure prompts to accept huge technical dumps by using explicit boundary markers like === BEGIN DATA DUMP === and === END DATA DUMP ===.
- System Boundaries: Frame instructions using explicit role-definition blocks ("You are acting as... Your boundaries are...").`
    : ""
}

${
  targetModel.includes("Grok")
    ? `### 3. GROK OPTIMIZATION (4.3 Beta / Fast / Expert)
- Syntax: Flat, punchy, declarative structural layers. Minimize nested syntax.
- Search Integration: Include explicit directives on how to process real-time web information if applicable (e.g., "Prioritize cross-referencing live data streams over pre-training assumptions").
- Tone: Direct, unfiltered, high-velocity clarity.`
    : ""
}

${
  targetModel.includes("Nano")
    ? `### 4. NANO BANANA / NANO BANANA PRO OPTIMIZATION
- Syntax: Hyper-concise, flat, structural instructions. Absolutely no token bloating, long meta-explanations, or decorative framing.
- Constraints: Force rules to the very top and very bottom of the prompt to mitigate the "loss in the middle" effect common in lightweight edge models. Keep instructions to direct, short command sentences.`
    : ""
}

${
  targetModel.includes("Imagen")
    ? `### 5. IMAGEN 4 OPTIMIZATION
- Syntax: Completely strip out analytical prompt structures. Recompile the input into a dense, visually rich, comma-separated descriptive metadata prompt.
- Rules: Convert abstract concepts into concrete visual elements (lighting, camera depth, texture, artistic medium). Enforce prompt formatting rules: state the subject first, followed by environmental details, then stylistic modifiers. Avoid negative words ("no", "without") and instead explicitly state what is present.`
    : ""
}

CRITICAL STRATEGY COMPILATION PROFILES TO INCORPORATE:
- Memory Extraction: Build prompts that enforce zero-hallucination guardrails, strict source-anchoring rules, and format-enforcement patterns (e.g., "If the data is not present in the text, return 'NULL'").
- Writing Style Analysis: Build prompts that instruct the model to perform an initial linguistic pass (analyzing vocabulary density, syntax length variation, punctuation cadence, and tonal shifts) before generating the target text.
- Research Instructions: Build prompts that force systematic multi-perspective analysis, devils-advocate cross-examination, and source-attribution formatting.
- Chain-of-Thought Reasoning: Build prompts that structurally mandate the model to think in a hidden or explicit <thinking> block before presenting any final conclusions.
- Other Strategies (Roleplay Framework, Code Generation/Audit, Structural Synthesis): Structure the instructions with highly sophisticated paradigms that best match these domains.

CRITICAL DELIVERY TONE OVERLAY:
${toneExplanation}
If the tone specifies a regional dialect (e.g., Boston, New York) or severe style (e.g., Potty-Mouth), we want the generated prompt's system message instructions OR the surrounding text to reflect that delivery style.

DELIVERY FORMAT:
Do not include any conversational preamble, intro banter, or post-explanations (such as "Here is your mega-prompt:").
Start directly with the generated prompt content. Maintain high structural integrity.`;

      const gen = await generateWithProvider({ provider, apiKey: userKey, model: requestedModel, prompt, taskHint: req.path });
      const response = { text: gen.text };

      res.json({
        text: response.text || "Failed to compile prompt.",
      });
    } catch (err: any) {
      console.error("Error in Mega-Prompt Forger:", err);
      res.status(500).json({ error: translateGeminiError(err) });
    }
  });

  
  app.post("/api/popro_forge", async (req: any, res) => {
    try {
      const { targetModel, actionMode, rawInput } = req.body;

      if (!targetModel || !actionMode || !rawInput) {
        return res.status(400).json({ error: "Missing required parameters." });
      }

      // Core prompt execution logic - uses generateWithProvider (multi provider + auto + header keys)
      const systemInstruction = `You are "Prompt Model Translator," an advanced AI-to-AI Translation and Reformatting Layer.
  Your sole function is to take raw user intent (RAW_INPUT) and reformat it into a highly optimized prompt tailored for a specific TARGET_MODEL and ACTION_MODE.

  --- MODEL REGISTRY SYNTAX RULES ---
  1. Grok Chat / Grok Research:
    - Format: Structured, punchy.
    - Define a clear [OBJECTIVE] first.
    - Provide a bulleted list of strict [CONSTRAINTS].
    - Provide explicit [FORMAT/TONE] directives.

  2. Grok Imagine:
    - Format: A single, dense, immersive, descriptive paragraph (no bullet points, no conversational introduction/outro).
    - Use cinematic and highly visual terms, camera angles, specific lighting descriptions.

  3. Gemini Chat / Gemini Media:
    - Format: Natural language framing.
    - Explicitly define a relevant PERSONA or ROLE at the very beginning (e.g. "You are an expert...").
    - Include specific technical keywords and context early, followed by the core task.

  4. Gemini Deep Research:
    - Format: Begins with a broad "# RESEARCH SUMMARY TOPIC" header.
    - Followed by a numbered list of specific inquiries or research goals.
    - End with explicit [METHODOLOGY REQUIREMENTS] and [FORMAT REQUIREMENTS] (e.g. specifying citations, peer-reviewed sources criteria).

  5. Gemini Skills:
    - Format: Structured strictly under three header sections:
      - [Objective]: Focus on the terminal goal.
      - [Methodology/Steps]: Discrete, actionable steps.
      - [Success Criteria]: Verifiable parameters for completion.

  6. Claude Chat / Claude Cowork:
    - Format: Elegant and clean context framing. Set up a clear role, source materials description (if any), and step-by-step request, prioritizing analytical clarity.

  7. Claude Artifacts:
    - Format: Enclose the primary task and structural constraints within XML-like tags (e.g., <formatting_rules>, <task_definition>, <artifact_specs>).
    - CRITICAL tag requirement: Refrain from using negative constraints; reframe any prohibitions as positive commands (e.g., instead of "Do not include metadata", write "Only output the actual content").

  8. Claude Skills:
    - Format: Begin with a YAML frontmatter header defining the skill attributes (name, description), followed by a step-by-step instruction body, explicitly identifying specific TRIGGER strings or concepts.

  --- OUTPUT INSTRUCTIONS ---
  You must evaluate the prompt transformation and return strictly valid JSON matching this schema exactly, and nothing else. Do not use conversational filler or markdown blocks around your JSON.`;

      const userPrompt = `TARGET_MODEL: ${targetModel}\nACTION_MODE: ${actionMode}\nRAW_INPUT: ${rawInput}`;
      
      let genResponse;
      const providerP = (req.headers["x-provider"] as string) || "google";
      const modelP = (req.headers["x-selected-model"] as string) || "auto";
      try {
        const g = await generateWithProvider({ provider: providerP, apiKey: userKey, model: modelP, prompt: userPrompt, taskHint: 'popro' });
        genResponse = { text: g.text };
      } catch (apiErr: any) {
        if (apiErr.status === 429 || apiErr.message?.includes('RESOURCE_EXHAUSTED')) {
          throw new Error("API rate limit reached.");
        }
        throw apiErr;
      }

      const text = genResponse.text;
      if (!text) throw new Error("Zero content returned from AI model.");
      
      const data = JSON.parse(text.trim());
      res.json(data);
    } catch (err: any) {
      console.error("API Error in /api/popro_forge:", err);
      res.status(500).json({ error: err.message || "An unexpected error occurred during prompt translation." });
    }
  });


  // Vite Integration & Static Files Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Robust dist path detection for both normal prod runs and Electron packaged app.
    // When server.cjs lives inside dist/ (as built for desktop), __dirname is the dist folder itself.
    // When running "npm start" from project root, dist/ is a subdir of cwd.
    const siblingIndex = path.join(__dirname, "index.html");
    const distPath = fs.existsSync(siblingIndex) ? __dirname : path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
