import { useEffect, useState } from 'react';
import { 
    Send, Activity, ShieldCheck, Play,
    ChevronDown, Clock, Fingerprint 
} from 'lucide-react';
import { SubmitModal } from '@/components/SubmitModal';

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
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        // If results exist, analysis is done; don't start/continue the timer.
        if (results) return;

        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [results]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // --- ADAPTIVE UI LOGIC ---
    const fusionScore = results?.fusion_score ?? 0;
    const fusionVerdict = results?.fusion_verdict || results?.verdict || "PENDING";
    const isHighRisk = fusionScore > 0.6;
    const aiPercentNumeric = fusionScore * 100;

    const getTheme = (score: number) => {
        if (score >= 0.85) return { 
            accent: "text-red-500", 
            border: "border-red-500/30", 
            bg: "bg-linear-to-b from-red-500/5 to-transparent", 
            badge: "bg-red-500/10 border-red-500/20 text-red-600", 
            fill: "#ef4444" 
        };
        if (score >= 0.60) return { 
            accent: "text-orange-500", 
            border: "border-orange-500/30", 
            bg: "bg-linear-to-b from-orange-500/5 to-transparent", 
            badge: "bg-orange-500/10 border-orange-500/20 text-orange-600", 
            fill: "#f97316" 
        };
        if (score >= 0.40) return { 
            accent: "text-yellow-500", 
            border: "border-yellow-500/30", 
            bg: "bg-linear-to-b from-yellow-500/5 to-transparent", 
            badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600", 
            fill: "#eab308" 
        };
        return { 
            accent: "text-green-500", 
            border: "border-green-500/20", 
            bg: "bg-linear-to-b from-green-500/5 to-transparent", 
            badge: "bg-green-500/10 border-green-500/20 text-green-600", 
            fill: "#22c55e" 
        };
    };

    const adaptiveStyle = getTheme(fusionScore);
    
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
                    onClick={() => setShowConfirmModal(true)} 
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

                {/* Modal Implementation */}
                <SubmitModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={onSubmit}
                />
            </div>

            {/* --- RESULTS AREA (STREMLINED & NO SHADOWS) --- */}
            {results && (
                <div className={`mt-2 p-6 border rounded-4xl space-y-6 animate-in fade-in zoom-in-95 duration-500 bg-card ${adaptiveStyle.border} ${adaptiveStyle.bg}`}>
                    
                    {/* VERDICT BADGE */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${adaptiveStyle.badge}`}>
                                {fusionScore >= 0.6 ? <Fingerprint size={18} /> : <ShieldCheck size={18} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Engine Verdict</p>
                                <h4 className={`text-lg font-black uppercase tracking-tighter leading-none ${adaptiveStyle.accent}`}>
                                    {fusionVerdict}
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* ADAPTIVE PROGRESS CIRCLE (UNROUNDED) */}
                    <div className="relative h-40 w-40 mx-auto">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke={adaptiveStyle.fill} strokeWidth="8" className="opacity-10" />
                            <circle 
                                cx="50" cy="50" r="42" fill="none" 
                                stroke={adaptiveStyle.fill} 
                                strokeWidth="8" 
                                strokeDasharray="263.89" 
                                strokeDashoffset={263.89 - (263.89 * aiPercentNumeric) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-in-out"
                                style={{ filter: `drop-shadow(0 0 4px ${adaptiveStyle.fill}4d)` }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black tracking-tighter text-foreground tabular-nums">
                                {(fusionScore * 100).toFixed(2)}%
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${adaptiveStyle.accent}`}>
                                Risk Level
                            </span>
                        </div>
                    </div>

                    {/* EVIDENCE LOGS (UNROUNDED) */}
                    <div className="space-y-3">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">DNA Indicators</h5>
                        <div className="grid gap-2">
                            {results.analysis_details?.top_indicators?.length > 0 ? (
                                results.analysis_details.top_indicators.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 bg-background/50 border border-border/50 rounded-xl">
                                        <span className="text-[10px] font-bold text-foreground">{item.token}</span>
                                        <span className={`text-[10px] font-mono font-bold ${adaptiveStyle.accent}`}>
                                            +{(item.score * 100).toFixed(2)}% MATCH
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 bg-background/40 border border-dashed border-border rounded-xl">
                                    <p className="text-[10px] text-muted-foreground italic text-center">
                                        Clean structural DNA detected.
                                    </p>
                                </div>
                            )}
                            
                            {/* BEHAVIORAL INTERPRETATION */}
                            <div className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${fusionScore >= 0.4 ? 'bg-amber-500/5 border-amber-500/10' : 'bg-blue-500/5 border-blue-500/10'}`}>
                                <Activity className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${fusionScore >= 0.4 ? 'text-amber-500' : 'text-blue-500'}`} />
                                <p className="text-[10px] leading-relaxed font-medium text-foreground/80 italic">
                                    {results.behavioral_analysis?.interpretation || "Organic behavior patterns observed."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* EXPAND ACTION */}
                    <button 
                        onClick={onShowMore}
                        className="w-full group py-3 flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-all border-t border-border/50 mt-4 pt-4 uppercase tracking-[0.15em]"
                    >
                        <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                        View Detailed Report
                    </button>
                </div>
            )}
        </div>
    );
}