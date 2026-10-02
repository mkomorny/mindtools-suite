
import { HelpCircle, Activity } from "lucide-react";

interface MetricsProps {
  score: number;
  wordCount: number;
  ttr: number;
  emDashes: number;
  hashtags: number;
  bulletNounList: boolean;
  context: string;
}

export default function MetricCard({
  score,
  wordCount,
  ttr,
  emDashes,
  hashtags,
  bulletNounList,
  context,
}: MetricsProps) {
  // Determine score feedback text style
  const getScoreInfo = (s: number) => {
    if (s >= 85) {
      return {
        bgColor: "bg-success/10",
        textColor: "text-success",
        label: "PRISTINE (HUMAN VOICE)",
        barColor: "bg-bg3",
      };
    }
    if (s >= 65) {
      return {
        bgColor: "bg-accent2/20",
        textColor: "text-accent2",
        label: "WARNING (MILD AI TELLS)",
        barColor: "bg-bg3",
      };
    }
    return {
      bgColor: "bg-danger/20",
      textColor: "text-danger font-bold",
      label: "ALERT (DENSE MACHINE PATTERNS)",
      barColor: "bg-danger",
    };
  };

  const scoreDetails = getScoreInfo(score);

  // Style helper for system gauges
  const getStatusColor = (isBad: boolean) => {
    return isBad
      ? "bg-danger/20 border-danger/40 text-danger font-bold"
      : "bg-bg border-light text-text";
  };

  return (
    <div className="bg-bg border-strong rounded-none p-4 shadow-[2px_2px_0px_0px_rgba(20,20,20,0.25)] select-none">
      {/* Title block */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-light">
        <Activity size={13} className="text-text" />
        <h3 className="text-xs font-bold tracking-wider font-mono text-text uppercase">
          Stylometric telemetry matrix
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Core dynamic human rating */}
        <div className="bg-bg2 rounded-none border-strong p-3.5 flex flex-col justify-between min-h-[125px]">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-mono text-text2 tracking-tight font-bold">
                HUMAN PROSE INDEX
              </span>
              <span className={`text-[8px] font-mono px-1.5 py-0.5 border border-strong ${scoreDetails.bgColor} ${scoreDetails.textColor}`}>
                {scoreDetails.label}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-text font-mono">
                {score}
              </span>
              <span className="text-text3 text-xs font-mono">/100</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-bg h-3 border-strong relative overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${scoreDetails.barColor}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-[9px] text-text2 mt-1 font-mono italic">
              Weighted penalty deduction system
            </p>
          </div>
        </div>

        {/* Dynamic Type-Token Ratio */}
        <div className="bg-bg2 rounded-none border-strong p-3.5 flex flex-col justify-between min-h-[125px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-text2 tracking-tight font-bold">
                VOCABULARY WIDTH (TTR)
              </span>
              <div className="group relative">
                <HelpCircle size={12} className="text-text3 cursor-help hover:text-text" />
                <div className="absolute right-0 bottom-full mb-2 w-56 p-2.5 bg-bg3 text-text text-[10px] rounded-none border border-border shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 font-sans leading-normal">
                  Type-Token Ratio counts unique words divided by word count. Natural text generally scales between 0.50 and 0.65. Repetitive AI outputs land below 0.40.
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-text font-mono">{ttr}</span>
              <span className="text-[9px] font-mono text-text2">
                {ttr >= 0.48 ? "✔️ DIVERSE RANGE" : "⚠️ COMPRESSED"}
              </span>
            </div>
          </div>
          <div className="text-[9px] text-text2 font-mono border-t border-light pt-1.5 mt-2">
            Analyzed {wordCount} words. {ttr < 0.45 ? "Synonym cycles / repeating loops limit width." : "Sufficient linguistic variance."}
          </div>
        </div>

        {/* Layout indicators */}
        <div className="bg-bg2 rounded-none border-strong p-3.5 flex flex-col justify-between min-h-[125px]">
          <span className="text-[10px] font-mono text-text2 tracking-tight font-bold">
            STATISTICAL TELL CHECKS
          </span>
          
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {/* Em Dashes */}
            <div className={`p-1 border border-strong text-center ${getStatusColor(emDashes > 1)}`}>
              <div className="text-[8px] font-mono text-text2 font-bold">EM-DASH</div>
              <div className="text-sm font-extrabold font-mono text-text">{emDashes}</div>
              <div className="text-[8px] font-mono opacity-75">{emDashes > 1 ? "🛑 LIMIT_1" : "✔️ OK"}</div>
            </div>

            {/* Hashtags */}
            <div className={`p-1 border border-strong text-center ${getStatusColor(hashtags >= 6)}`}>
              <div className="text-[8px] font-mono text-text2 font-bold">HASHTAGS</div>
              <div className="text-sm font-extrabold font-mono text-text">{hashtags}</div>
              <div className="text-[8px] font-mono opacity-75">{hashtags >= 6 ? "🛑 STUFFED" : "✔️ OK"}</div>
            </div>

            {/* Bullet Nouns */}
            <div className={`p-1 border border-strong text-center ${getStatusColor(bulletNounList)}`}>
              <div className="text-[8px] font-mono text-text2 font-bold">VERBLESS</div>
              <div className="text-sm font-extrabold font-mono text-text">{bulletNounList ? "TRUE" : "FALSE"}</div>
              <div className="text-[8px] font-mono opacity-75">{bulletNounList ? "🛑 BARE_NP" : "✔️ OK"}</div>
            </div>
          </div>

          <div className="text-[8px] font-mono text-text3 mt-1 select-none">
            Tolerance threshold set: {context.toUpperCase()} mode
          </div>
        </div>
      </div>
    </div>
  );
}
