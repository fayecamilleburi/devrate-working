import { useEffect, useState } from 'react'; // Added useState
import { Send,Activity, ShieldCheck, AlertTriangle, XCircle, Play, ChevronDown, Clock 
} from 'lucide-react';

interface MetricsPanelProps {
    isAnalyzing: boolean;
    onSubmit: () => void;
    onCompile: () => void;
    results: any | null;
    metrics: any; 
    onShowMore: () => void;
}

export function MetricsPanel({ isAnalyzing, onSubmit, onCompile, results, onShowMore }: MetricsPanelProps) {
    // --- SESSION TIMER LOGIC ---
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- DATA CALCULATIONS ---
    const confidence = typeof results?.fusion_score === 'number' ? results.fusion_score : 0;
    const percentage = Math.round(confidence * 100);
    const strokeDashoffset = 440 - (440 * confidence);

    const getVerdictStyle = (verdict: string) => {
        const v = verdict?.toUpperCase() || "";
        if (v.includes("HUMAN") || v.includes("AUTHENTIC")) {
            return { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/50", icon: <ShieldCheck className="h-5 w-5" /> };
        }
        if (v.includes("MODERATE") || v.includes("CAUTION")) {
            return { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/50", icon: <AlertTriangle className="h-5 w-5" /> };
        }
        return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/50", icon: <XCircle className="h-5 w-5" /> };
    };

    const verdictStyle = getVerdictStyle(results?.verdict);

    return (
        <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
            {/* --- HEADER SECTION --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Analysis Engine</h2>
                    <p className="text-xs text-muted-foreground">Verification & Integrity</p>
                </div>
                <button
                    onClick={onCompile}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
                >
                    <Play className="h-3 w-3" />
                    Run Code
                </button>
            </div>

            {/* --- MAIN ACTION GROUP --- */}
            <div className="space-y-3">
                <button 
                    id="submit-button"
                    onClick={onSubmit} 
                    disabled={isAnalyzing} 
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#B7D7EA] text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                >
                    {isAnalyzing ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                    {isAnalyzing ? "Analyzing Code..." : "Submit Code for Checking"}
                </button>

                {/* SESSION TIME DISPLAY - Wrapped to match button shape */}
                <div className="w-full flex items-center justify-between px-4 py-2 bg-[#E2EFF6] border border-border rounded-xl">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[12px] font-black uppercase tracking-wider text-[#4893C6]">
                            Session Active
                        </span>
                    </div>
                    <span className="text-s font-mono font-bold text-primary tabular-nums bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        {formatTime(seconds)}
                    </span>
                </div>
            </div>

            {/* --- RESULTS AREA --- */}
            {results && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                   
                    {/* VERDICT BADGE */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${verdictStyle.border} ${verdictStyle.bg}`}>
                        {verdictStyle.icon}
                        <div>
                            <p className="text-[10px] font-bold opacity-70 uppercase leading-none mb-1">Final Verdict</p>
                            <h4 className={`text-lg font-black tracking-tight ${verdictStyle.text}`}>
                                {results.verdict || "PENDING"}
                            </h4>
                        </div>
                    </div>

                    {/* PROGRESS CIRCLE */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black opacity-50 uppercase tracking-widest text-center">
                            Fusion Risk Probability
                        </h3>
                        
                        <div className="relative h-36 w-36 mx-auto flex items-center justify-center">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/10" />
                                <circle 
                                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                    strokeDasharray="440" 
                                    strokeDashoffset={strokeDashoffset} 
                                    strokeLinecap="round" 
                                    className={`${percentage > 60 ? 'text-destructive' : 'text-primary'} transition-all duration-1000 ease-out`} 
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-black">{percentage}%</span>
                                <span className="text-[9px] font-bold opacity-60">SCORE</span>
                            </div>
                        </div>

                        {/* EVIDENCE LISTS */}
                        <div className="grid gap-2">
                            {results.analysis_details?.top_indicators?.map((item: any, i: number) => (
                                <div key={i} className="px-2 py-1.5 bg-destructive/5 border-l-2 border-destructive rounded text-[10px]">
                                    <span className="font-bold">{item.token}</span>: AI Pattern
                                </div>
                            ))}
                            
                            {!results.analysis_details?.top_indicators?.length && (
                                <p className="text-[10px] text-muted-foreground italic opacity-70 px-1">Clean structural DNA.</p>
                            )}

                            <div className="px-2 py-1.5 bg-primary/5 border-l-2 border-primary rounded text-[10px] italic flex items-center gap-2">
                                <Activity className="h-3 w-3 shrink-0 opacity-70" />
                                {results.behavioral_analysis?.interpretation || "Organic behavior."}
                            </div>
                        </div>

                        <button 
                            onClick={onShowMore}
                            className="w-full py-3 flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors border-t border-border mt-4 pt-4 uppercase tracking-widest"
                        >
                            <ChevronDown className="h-4 w-4" />
                            View Detailed Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}