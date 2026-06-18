import React from 'react'
import { TrendingUp, TrendingDown, Activity, Sparkles } from 'lucide-react'

interface Props {
  analysis: string
}

export function DollarRateAnalysisCard({ analysis }: Props) {
  if (!analysis) return null;

  // Simple markdown parsing to render paragraphs and bold text
  const formattedAnalysis = analysis.split('\n\n').map((paragraph, index) => {
    // Handle bold text like **text**
    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={index} className="text-neutral-300 text-sm leading-relaxed mb-3 last:mb-0">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
          }
          return <span key={i}>{part}</span>
        })}
      </p>
    )
  });

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
          <Sparkles className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold">Gemini Intelligence</p>
          <h3 className="text-white text-base font-bold">Dollar Rate Forecast Analysis</h3>
        </div>
      </div>
      
      <div className="relative z-10 bg-neutral-950/50 border border-neutral-800/50 rounded-lg p-5">
        {formattedAnalysis}
      </div>
    </div>
  )
}
