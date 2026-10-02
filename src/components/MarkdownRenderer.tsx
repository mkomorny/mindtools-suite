import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

export default function MarkdownRenderer({ text }: MarkdownRendererProps) {
  if (!text) return null;

  // Split content by lines
  const lines = text.split('\n');

  return (
    <div className="space-y-3 font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold tracking-wide text-[var(--accent)] uppercase mt-5 mb-2 font-mono">
              {trimmed.slice(4)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-[var(--text)] mt-6 mb-2">
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-lg font-bold text-[var(--text)] mt-7 mb-3">
              {trimmed.slice(2)}
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemContent = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 my-1">
              <span className="text-[var(--accent)] mt-1.5 text-[8px]">◆</span>
              <span className="flex-1 text-[var(--text2)] leading-relaxed text-sm">
                {parseInlineBoldAndItalic(itemContent)}
              </span>
            </div>
          );
        }

        // Numbered lists
        const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
        if (orderedMatch) {
          const num = orderedMatch[1];
          const itemContent = orderedMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 my-1">
              <span className="font-mono text-xs text-[var(--accent)] mt-0.5 min-w-[18px]">{num}.</span>
              <span className="flex-1 text-[var(--text2)] leading-relaxed text-sm">
                {parseInlineBoldAndItalic(itemContent)}
              </span>
            </div>
          );
        }

        // Empty line
        if (trimmed === '') {
          return <div key={idx} className="h-1.5" />;
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-[var(--text2)] leading-relaxed text-sm">
            {parseInlineBoldAndItalic(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function parseInlineBoldAndItalic(text: string): React.ReactNode[] {
  // Regex to match **bold** or *italic*
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-[var(--text2)]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
