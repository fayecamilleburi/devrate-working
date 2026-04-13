import React, { useState } from 'react';
import { 
    Fingerprint, Activity, ChevronDown, ChevronUp, 
    AlertCircle, Cpu, CheckCircle2, ShieldAlert, Info,
    Zap, History, Clipboard, User, MousePointer2, BarChart3
} from 'lucide-react';

interface DetailedReportProps {
    metrics: {
        typingCadence: number;
        burstPauseRatio: number;
        revisionDensity: number;
        pasteCount: number;
        originalityIndex: number;
    };
    results: any;
}

export const DetailedReport = ({ metrics, results }: DetailedReportProps) => {
    // --- Pillar 1 Logic ---
    const rawValue = results?.ai_confidence_score ?? 0;
    const numericScore = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
    const aiPercentNumeric = numericScore * 100;
    const aiPercent = aiPercentNumeric.toFixed(2); 
    const humanPercent = (100 - aiPercentNumeric).toFixed(2);
    const isCodeOrganic = numericScore < 0.5;

    // --- Pillar 2 Logic ---
    const bScore = results?.behavioral_analysis?.behavioral_score ?? 0;
    const autonomyPercentNumeric = (1 - bScore) * 100;
    const autonomyPercent = autonomyPercentNumeric.toFixed(2);

    const isSuspicious = bScore > 0.6;
    const autonomyHex = isSuspicious ? "#f59e0b" : "#3b82f6";
    const autonomyClass = isSuspicious ? "text-amber-500" : "text-blue-500";

    const behaviorFlags = results?.behavior_analysis?.flags || [];

    const revisionStatus = metrics.revisionDensity > 0.1 ? "refactored their work often" : "showed linear progress";
    const pastedVolume = ((1 - metrics.originalityIndex) * 100).toFixed(0);

    const pasteSummary = metrics.pasteCount > 0
        ? `, but had ${metrics.pasteCount} paste ${metrics.pasteCount === 1 ? 'event' : 'events'} adding ${pastedVolume}% of the submitted code.`
        : ` and completed the task with 100% manual input.`;

    const behavioralSummary = `This user typed at ${metrics.typingCadence} events per minute and ${revisionStatus}${pasteSummary}`;

    return (
        <div className="relative mt-8 p-10 border border-border bg-card rounded-3xl shadow-2xl space-y-12">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-border pb-8 gap-4">
                <div className="flex gap-4">
                    <div className={`p-3 rounded-xl shadow-inner ${isCodeOrganic ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isCodeOrganic ? <CheckCircle2 className="h-8 w-8" /> : <Fingerprint className="h-8 w-8" />}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">Detailed Analysis Report</h2>
                        <p className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full animate-pulse ${isCodeOrganic ? 'bg-green-500' : 'bg-red-500'}`} />
                            TIMESTAMP: {new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`px-4 py-2 border rounded-xl font-black text-[10px] tracking-[0.2em] uppercase mb-2 ${
                        isCodeOrganic ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600'
                    }`}>
                        {results.verdict}
                    </div>
                </div>
            </div>

            {/* PILLAR 1: AI MODEL ANALYSIS (UPDATED UI) */}
            <section className={`p-8 border rounded-[2.5rem] space-y-8 ${isCodeOrganic ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                        <Cpu className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Pillar 1: AI Analysis</h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">DevRate Model Output</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                        <ShieldAlert className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">Neural Verification</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* LEFT: SVG GAUGE */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative h-60 w-60">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/10" />
                                <circle 
                                    cx="50" cy="50" r="42" fill="none" stroke="#ef4444" strokeWidth="8" 
                                    strokeDasharray="263.89" 
                                    strokeDashoffset={263.89 - (263.89 * aiPercentNumeric) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out"
                                    style={{ filter: `drop-shadow(0 0 4px #ef44444d)` }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black tracking-tighter text-foreground tabular-nums">{aiPercent}%</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-red-500">
                                    AI Probability
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: DATA CARDS & LOG */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DataCard label="AI Probability" value={aiPercent} color="text-red-500" />
                            <DataCard label="Human Factor" value={humanPercent} color="text-green-500" />
                        </div>

                        <div className="p-6 bg-secondary/10 rounded-3xl border border-border/50">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-2">
                                <Info className="h-3 w-3" /> Technical Evidence Log
                            </h4>
                            <div className="space-y-3">
                                {results?.analysis_details?.top_indicators?.length > 0 ? (
                                    results.analysis_details.top_indicators.map((item: any, i: number) => (
                                        <IndicatorItem key={i} label={item.token} score={item.score} />
                                    ))
                                ) : (
                                    <div className="flex items-start gap-4 p-4 text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border">
                                        <Info className="h-5 w-5 shrink-0" />
                                        <p className="text-xs italic leading-relaxed">
                                            Structural Analysis indicates {aiPercent}% likelihood of synthetic origin.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PILLAR 2: PROCESS ANALYSIS */}
            <section className="p-8 border rounded-[2.5rem] bg-linear-to-b from-blue-500/2 to-transparent border-blue-500/10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                        <Activity className="h-6 w-6 text-blue-500" />
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Pillar 2: Process Analysis</h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Behavioral Biometrics</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <MousePointer2 className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Real-time Telemetry</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative h-60 w-60">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke={autonomyHex} strokeWidth="8" className="opacity-10" />
                                <circle 
                                    cx="50" cy="50" r="42" fill="none" stroke={autonomyHex} strokeWidth="8" 
                                    strokeDasharray="263.89" 
                                    strokeDashoffset={263.89 - (263.89 * autonomyPercentNumeric) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out"
                                    style={{ filter: `drop-shadow(0 0 4px ${autonomyHex}4d)` }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black tracking-tighter text-foreground tabular-nums">{autonomyPercent}%</span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${autonomyClass}`}>
                                    Human Autonomy
                                </span>
                            </div>
                        </div>
                        
                        <div className={`w-full p-4 rounded-2xl border flex items-center justify-around transition-colors duration-500 ${isSuspicious ? 'bg-amber-500/5 border-amber-500/10' : 'bg-blue-500/5 border-blue-500/10'}`}>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Method</p>
                                <p className={`text-xs font-bold transition-colors ${isSuspicious ? 'text-amber-600' : 'text-blue-600'}`}>
                                    {isSuspicious ? "High-Volume Insertion" : "Manual Construction"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 bg-linear-to-r from-blue-500/10 to-transparent rounded-3xl border border-blue-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <BarChart3 className="h-15 w-15" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase text-blue-600 mb-3 tracking-widest flex items-center gap-2">
                                <Info className="h-3 w-3" /> Behavioral Conclusion
                            </h4>
                            <p className="text-base font-bold text-foreground leading-snug mb-3">
                                {results?.behavioral_analysis?.interpretation || "Analyzing input patterns..."}
                            </p>
                            <div className="p-3 bg-white/40 rounded-xl border border-blue-500/10">
                                <p className="text-xs font-small text-muted-foreground leading-relaxed italic">
                                    {behavioralSummary}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <BehavioralLogItem icon={<Zap size={14} />} label="Typing Cadence" value={`${metrics.typingCadence} EPM`} description="Measures interaction frequency with the editor." />
                            <BehavioralLogItem icon={<History size={14} />} label="Revision Density" value={`${(metrics.revisionDensity * 100).toFixed(1)}%`} description="Measures how much you refactor your work." />
                            <BehavioralLogItem icon={<Clipboard size={14} />} label="Paste Events" value={metrics.pasteCount} description="Total external code insertions detected." />
                            <BehavioralLogItem icon={<User size={14} />} label="Originality Index" value={`${(metrics.originalityIndex * 100).toFixed(0)}%`} description="Percentage of final code manually typed." />
                        </div>

                        {behaviorFlags.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 pt-2">
                                {behaviorFlags.map((flag: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                        <p className="text-[11px] font-bold text-amber-700/80 uppercase tracking-tight">{flag}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const BehavioralLogItem = ({ label, value, description, icon }: { label: string; value: string | number; description: string, icon: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="group border border-border/50 rounded-2xl overflow-hidden bg-background shadow-sm hover:border-blue-500/30 transition-all">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/5 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">{icon}</div>
                    <span className="text-xs font-black uppercase tracking-tight text-muted-foreground group-hover:text-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-blue-600 tabular-nums">{value}</span>
                    <div className="text-muted-foreground/30">{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                </div>
            </button>
            {isOpen && (
                <div className="px-5 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10px] leading-relaxed text-muted-foreground border-t border-border/50 pt-3 italic">{description}</p>
                </div>
            )}
        </div>
    );
};

const IndicatorItem = ({ label, score }: { label: string; score: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const definitions: Record<string, string> = {
        "High Semantic Uniformity": "The code follows a highly predictable logical structure common in large language models.",
        "Synthetic Logic Flow": "The progression of functions and variables aligns with AI training patterns rather than human problem-solving.",
        "Low Structural Entropy": "The code is 'too clean'—lacking the natural chaos and stylistic variations of human-written scripts."
    };
    return (
        <div className="border border-border/50 rounded-xl overflow-hidden bg-background shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${score > 0.6 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold">{label}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono font-bold text-red-500">{(score * 100).toFixed(2)}% MATCH</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 opacity-30" /> : <ChevronDown className="h-4 w-4 opacity-30" />}
                </div>
            </button>
            {isOpen && (
                <div className="px-9 pb-4 animate-in slide-in-from-top-2">
                    <p className="text-[11px] leading-relaxed text-muted-foreground italic border-l-2 border-border pl-3">
                        {definitions[label] || "Pattern deviation detected in token selection."}
                    </p>
                </div>
            )}
        </div>
    );
};

const DataCard = ({ label, value, color }: any) => (
    <div className="p-5 bg-background border border-border rounded-2xl shadow-sm">
        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{label}</p>
        <p className={`text-3xl font-black ${color} tabular-nums`}>{value}%</p>
    </div>
);