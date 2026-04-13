import { 
    Send, Info, Activity, ShieldCheck, AlertTriangle, XCircle, Play, ChevronDown 
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
    // --- DATA CALCULATIONS ---
    const confidence = typeof results?.ai_analysis?.confidence === 'number' ? results.ai_analysis.confidence : 0;
    const percentage = Math.round(confidence * 100);
    const strokeDashoffset = 440 - (440 * confidence);

    // --- DYNAMIC STYLING ---
    const getVerdictStyle = (verdict: string) => {
        if (verdict?.includes("AUTHENTIC")) {
            return { 
                bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/50", 
                icon: <ShieldCheck className="h-5 w-5" /> 
            };
        }
        if (verdict?.includes("CAUTION")) {
            return { 
                bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/50", 
                icon: <AlertTriangle className="h-5 w-5" /> 
            };
        }
        return { 
            bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/50", 
            icon: <XCircle className="h-5 w-5" /> 
        };
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

            {/* --- MAIN ACTION BUTTON --- */}
            <button 
                id="submit-button"
                onClick={onSubmit} 
                disabled={isAnalyzing} 
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
                {isAnalyzing ? (
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                    <Send className="h-5 w-5" />
                )}
                {isAnalyzing ? "Analyzing Code..." : "Check Integrity"}
            </button>

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
                            AI Generation Probability
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
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
                                <Info className="h-3 w-3" /> X-Ray Evidence
                            </div>
                            
                            {results.ai_analysis?.top_indicators?.length > 0 ? (
                                results.ai_analysis.top_indicators.map((item: any, i: number) => (
                                    <div key={i} className="p-3 bg-destructive/5 border-l-4 border-destructive rounded text-[11px]">
                                        <span className="font-bold text-destructive">{item.token}</span>: Structural pattern detected.
                                    </div>
                                ))
                            ) : (
                                <p className="text-[11px] text-muted-foreground italic px-2">No structural anomalies detected.</p>
                            )}
                            
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase pt-2 border-t border-border">
                                <Activity className="h-3 w-3" /> Behavior Flags
                            </div>
                            
                            {results.behavior_analysis?.flags?.length > 0 ? (
                                results.behavior_analysis.flags.map((flag: string, i: number) => (
                                    <div key={i} className="p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded text-[11px]">
                                         {flag}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[11px] text-muted-foreground italic px-2">Behavioral patterns appear organic.</p>
                            )}
                        </div>
                    </div>

                    {/* More Details Button */}
                    <button 
                        onClick={onShowMore}
                        className="w-full py-3 flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors border-t border-border mt-4 pt-4 uppercase tracking-widest"
                    >
                        <ChevronDown className="h-4 w-4 animate-bounce" />
                        View Detailed Report
                    </button>
                </div>
            )}
        </div>
    );
}