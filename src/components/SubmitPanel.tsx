import { Send, Info, Activity, ShieldCheck, AlertTriangle, ChevronDown, Zap } from 'lucide-react';

interface SubmitPanelProps {
    isAnalyzing: boolean;
    onSubmit: () => void;
    results: any | null;
    onShowMore: () => void; 
}

export const SubmitPanel = ({ isAnalyzing, onSubmit, results, onShowMore }: SubmitPanelProps) => {
    // SWAP: Use fusion_score instead of ai_analysis.confidence
    const fusionScore = typeof results?.fusion_score === 'number' ? results.fusion_score : 0;
    const percentage = Math.round(fusionScore * 100);
    const strokeDashoffset = 440 - (440 * fusionScore);

    // Helper to style the verdict badge based on Fusion Verdict strings
    const getVerdictStyle = (verdict: string) => {
        const v = verdict?.toUpperCase() || "";
        if (v.includes("AUTHENTIC")) return { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/50", icon: <ShieldCheck className="h-5 w-5" /> };
        if (v.includes("MIXED") || v.includes("INCONCLUSIVE")) return { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/50", icon: <AlertTriangle className="h-5 w-5" /> };
        // Targets "SYNTHETIC" or "ANOMALOUS"
        return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/50", icon: <Zap className="h-5 w-5" /> };
    };

    // SWAP: Use fusion_verdict from backend
    const verdictStyle = getVerdictStyle(results?.fusion_verdict);

    return (
        <div className="flex flex-col gap-4">
            <button 
                onClick={onSubmit} 
                disabled={isAnalyzing} 
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
            >
                {isAnalyzing ? (
                    <div className="h-5 w-5 border-2 border-white/[#F0F8FF] border-t-white rounded-full animate-spin" />
                ) : (
                    <Send className="h-5 w-5" />
                )}
                {isAnalyzing ? "Analyzing Code..." : "Check Integrity"}
            </button>

            {results && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* --- FUSION VERDICT BADGE --- */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${verdictStyle.border} ${verdictStyle.bg}`}>
                        {verdictStyle.icon}
                        <div>
                            <p className="text-[10px] font-bold opacity-70 uppercase leading-none mb-1">Fusion Verdict</p>
                            <h4 className={`text-lg font-black tracking-tight ${verdictStyle.text}`}>
                                {results.fusion_verdict || "No Verdict"}
                            </h4>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black opacity-50 uppercase tracking-widest text-center">
                            Combined Fusion Probability
                        </h3>
                        
                        <div className="relative h-40 w-40 mx-auto flex items-center justify-center">
                            <svg className="h-full w-full -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/10" />
                                <circle 
                                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                    strokeDasharray="440" strokeDashoffset={strokeDashoffset} strokeLinecap="round" 
                                    className={`${percentage > 60 ? 'text-destructive' : 'text-primary'} transition-all duration-1000 ease-out`} 
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-black">{percentage}%</span>
                                <span className="text-[10px] font-bold opacity-60">FUSION</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* AI Indicators */}
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
                                <Info className="h-3 w-3" /> AI Structural Signal
                            </div>
                            
                            {results.analysis_details?.top_indicators?.length > 0 ? (
                                results.analysis_details.top_indicators.map((item: any, i: number) => (
                                    <div key={i} className="p-3 bg-destructive/5 border-l-4 border-destructive rounded text-[11px]">
                                        <span className="font-bold text-destructive">{item.token}</span>: {item.label || "Pattern detected."}
                                    </div>
                                ))
                            ) : (
                                <p className="text-[11px] text-muted-foreground italic px-2">No structural anomalies detected.</p>
                            )}
                            
                            {/* Behavioral Section */}
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase pt-2 border-t border-border">
                                <Activity className="h-3 w-3" /> Behavioral Autonomy
                            </div>
                            
                            {results.behavioral_analysis ? (
                                <div className={`p-3 rounded border-l-4 text-[11px] ${results.behavioral_analysis.behavioral_score > 0.6 ? 'bg-warning/10 border-warning' : 'bg-green-500/5 border-green-500'}`}>
                                    <p className="font-bold">{results.behavioral_analysis.interpretation}</p>
                                    <p className="opacity-70">Score: {(results.behavioral_analysis.behavioral_score * 100).toFixed(1)}%</p>
                                </div>
                            ) : (
                                <p className="text-[11px] text-muted-foreground italic px-2">No behavioral telemetry available.</p>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={onShowMore}
                        className="w-full py-2 flex items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors border-t border-border mt-4 pt-4"
                    >
                        <ChevronDown className="h-3 w-3" />
                        VIEW DETAILED ANALYTICS
                    </button>
                </div>
            )}
        </div>
    );
};