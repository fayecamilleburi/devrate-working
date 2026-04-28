import React, { useState } from 'react';
import { Code2, Flame, AlertTriangle, Zap, Layers, Activity, ShieldCheck } from 'lucide-react';

interface HeatmapLine {
  line: number;
  score: number;
}

interface StaticCodeDisplayProps {
  code: string;
  language: string;
  heatmapData?: HeatmapLine[];
  // This 'metrics' now matches your backend's "behavioral_analysis" + "safety_net"
  metrics?: {
    behavioral_analysis?: {
      behavioral_score: number;
      interpretation: string;
    };
    safety_net?: {
      is_mismatch: boolean;
      detected_language: string;
    };
  };
}

type ViewMode = 'detector' | 'telemetry' | 'fusion';

export const StaticCodeDisplay: React.FC<StaticCodeDisplayProps> = ({ code, language, heatmapData, metrics }) => {
  const [mode, setMode] = useState<ViewMode>('fusion');
  const lines = code.length > 0 ? code.split('\n') : ['// No code detected'];

  const getScoreForLine = (lineNum: number) => heatmapData?.find(h => h.line === lineNum)?.score || 0;
  const getHue = (score: number) => (1 - score) * 120;

  const renderLineContent = (line: string, score: number) => {
    // Show token highlights in Detector or Fusion mode
    if (mode === 'detector' || mode === 'fusion') {
      if (score < 0.4) return line;
      const parts = line.split(/(\s+)/);
      return parts.map((part, i) => {
        if (part.trim().length === 0) return part;
        return (
          <span key={i} style={{ backgroundColor: `hsla(${getHue(score)}, 100%, 50%, ${score * 0.3})`, borderRadius: '2px', padding: '0 2px' }}>
            {part}
          </span>
        );
      });
    }
    return line;
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden font-mono text-[13px] shadow-lg">
      
      {/* HEADER WITH DYNAMIC STATUS */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Forensic Viewport</span>
            {metrics?.safety_net?.is_mismatch && (
                <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Mismatch: {metrics.safety_net.detected_language} Detected
                </span>
            )}
          </div>
        </div>

        {/* MODE SWITCHER */}
        <div className="flex bg-gray-200/50 p-1 rounded-lg border border-gray-300">
          {[
            { id: 'detector', label: 'AI Detector', icon: Flame },
            { id: 'telemetry', label: 'Telemetry', icon: Activity },
            { id: 'fusion', label: 'Fusion', icon: Zap },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as ViewMode)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
                mode === item.id ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* CODE TABLE */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, index) => {
              const lineNum = index + 1;
              const score = getScoreForLine(lineNum);
              
              // TELEMETRY LOGIC: 
              // We use the behavioral_score from backend to highlight lines 
              // if they match the "Low Autonomy" interpretation.
              const isLowAutonomy = metrics?.behavioral_analysis?.behavioral_score && metrics.behavioral_analysis.behavioral_score > 0.7;
              const hasAnomaly = (mode === 'telemetry' || mode === 'fusion') && isLowAutonomy && score > 0.5;

              return (
                <tr 
                  key={index} 
                  className="group transition-colors relative"
                  style={{ 
                    backgroundColor: mode !== 'telemetry' ? `hsla(${getHue(score)}, 90%, 60%, ${score * 0.12})` : 'transparent' 
                  }}
                >
                  <td className="w-12 text-right pr-4 py-1 text-gray-400 border-r border-gray-100 bg-gray-50/50 select-none">
                    {lineNum}
                  </td>

                  <td className="pl-4 py-1 relative">
                    {/* Telemetry Vertical Bar (Blue) */}
                    {hasAnomaly && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[2px_0_10px_rgba(59,130,246,0.5)] z-10" />
                    )}
                    
                    <span className="whitespace-pre text-gray-800 leading-6 relative z-0">
                      {renderLineContent(line || ' ', score)}
                    </span>
                    
                    {/* Hover Stats Badge */}
                    <div className="opacity-0 group-hover:opacity-100 absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 z-20 transition-all">
                      {(mode === 'detector' || mode === 'fusion') && score > 0.3 && (
                        <span className="text-[9px] font-black px-2 py-1 rounded shadow-sm border border-red-200 bg-white text-red-600">
                          {Math.round(score * 100)}% AI
                        </span>
                      )}
                      {hasAnomaly && (
                        <span className="text-[9px] font-black px-2 py-1 rounded shadow-sm border border-blue-200 bg-white text-blue-600">
                          LOW AUTONOMY DETECTED
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER METRICS BAR */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4 text-[10px] font-bold">
           <div className="flex items-center gap-2 px-2 py-1 rounded bg-white border border-gray-200">
              <ShieldCheck className="h-3 w-3 text-green-500" />
              <span className="text-gray-500 uppercase">Behavior:</span>
              <span className="text-gray-900">{metrics?.behavioral_analysis?.interpretation || "Pending..."}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <span className="text-[9px] font-black text-gray-400">HUMAN</span>
           <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 shadow-inner" />
           <span className="text-[9px] font-black text-gray-400">AI</span>
        </div>
      </div>
    </div>
  );
};