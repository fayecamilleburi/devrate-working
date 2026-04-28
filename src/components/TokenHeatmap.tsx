import React from 'react';

interface TokenData {
  text: string;
  score: number;
}

interface TokenHeatmapProps {
  tokens?: TokenData[];
}

export const TokenHeatmap: React.FC<TokenHeatmapProps> = ({ tokens }) => {
  if (!tokens || tokens.length === 0) return null;

  const getColor = (score: number) => {
    // 120 = Green (Human), 0 = Red (AI)
    const hue = (1 - score) * 120;
    // We use hsla: Hue, Saturation 100%, Lightness 50%, Alpha (Opacity)
    return {
      bg: `hsla(${hue}, 100%, 50%, 0.25)`,
      border: `hsla(${hue}, 100%, 40%, 0.7)`
    };
  };

  return (
    <div className="w-full rounded-xl border border-border bg-[#0d1117] p-6 font-mono text-[14px] shadow-2xl">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Semantic Token Analysis
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-green-500 font-bold uppercase">Human</span>
          <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
          <span className="text-[9px] text-red-500 font-bold uppercase">AI</span>
        </div>
      </div>

      <div className="whitespace-pre-wrap leading-relaxed break-words">
        {tokens.map((token, i) => {
          const colors = getColor(token.score);
          return (
            <span
              key={i}
              style={{ 
                backgroundColor: colors.bg,
                borderBottom: `2px solid ${colors.border}` 
              }}
              className="inline group relative cursor-help transition-all hover:brightness-125"
            >
              {token.text}
              {/* Floating Tooltip */}
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-black px-2 py-1 text-[10px] font-bold text-white shadow-xl transition-all group-hover:scale-100 z-50">
                {(token.score * 100).toFixed(1)}% AI
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};