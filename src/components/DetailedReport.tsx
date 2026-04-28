import React, { useState } from 'react';
import { 
    Fingerprint, Activity, ChevronDown, ChevronUp, 
    AlertCircle, Cpu, CheckCircle2, ShieldCheck, Info,
    Zap, History, Clipboard, User, MousePointer2, BarChart3,
    ScanEye, Bot
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
    // --- Shared Logic ---
    const rawValue = results?.ai_confidence_score ?? 0;
    const numericScore = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
    const aiPercentNumeric = numericScore * 100;
    const aiPercent = aiPercentNumeric.toFixed(2); 
    const humanPercent = (100 - aiPercentNumeric).toFixed(2);
    const isCodeOrganic = numericScore < 0.5;

    // --- Pillar 1 Adaptive UI Styles (AI Model Analysis) ---
    const p1Status = {
        accent: isCodeOrganic ? "text-green-500" : "text-red-500",
        border: isCodeOrganic ? "border-green-500" : "border-red-500",
        bg: isCodeOrganic 
            ? "bg-linear-to-b from-green-500/5 to-transparent border-green-500/10" 
            : "bg-linear-to-b from-red-500/5 to-transparent border-red-500/20",
        badge: isCodeOrganic 
            ? "bg-green-500/10 border-green-500/20 text-green-600" 
            : "bg-red-500/10 border-red-500/20 text-red-600",
        fill: isCodeOrganic ? "#22c55e" : "#ef4444"
    };

    // --- Pillar 2 Adaptive UI Styles (Behavioral Analysis) ---
    const bScore = results?.behavioral_analysis?.behavioral_score ?? 0;
    const autonomyPercentNumeric = bScore * 100;
    const autonomyPercent = autonomyPercentNumeric.toFixed(2);
    const isSuspicious = bScore > 0.6;
    
    const p2Status = {
        accent: isSuspicious ? "text-amber-500" : "text-blue-500",
        border: isSuspicious ? "border-amber-500" : "border-blue-500",
        bg: isSuspicious 
            ? "bg-linear-to-b from-amber-500/5 to-transparent border-amber-500/20" 
            : "bg-linear-to-b from-blue-500/5 to-transparent border-blue-500/10",
        badge: isSuspicious 
            ? "bg-amber-500/10 border-amber-500/20 text-amber-600" 
            : "bg-blue-500/10 border-blue-500/20 text-blue-600",
        fill: isSuspicious ? "#f59e0b" : "#3b82f6"
    };

    // --- Dynamic Method Label Logic ---
    const interpretation = results?.behavioral_analysis?.interpretation?.toLowerCase() || "";
    
    const getMethodLabel = () => {
        if (isSuspicious || interpretation.includes("high-volume") || interpretation.includes("pasted")) {
            return "High-Volume Insertion";
        }
        if (metrics.pasteCount > 0 || interpretation.includes("mixed") || interpretation.includes("external")) {
            return "Mixed Manual/External";
        }
        return "Manual Construction";
    };

    const methodLabel = getMethodLabel();

    const behaviorFlags = results?.behavior_analysis?.flags || [];
    const revisionStatus = metrics.revisionDensity > 0.1 ? "refactored their work often" : "showed linear progress";
    const rhythmStatus = metrics.burstPauseRatio > 0.5 ? "a fluid rhythm" : "frequent interruptions";
    const pastedVolume = ((1 - metrics.originalityIndex) * 100).toFixed(0);

    const pasteSummary = metrics.pasteCount > 0
        ? `, but had ${metrics.pasteCount} paste ${metrics.pasteCount === 1 ? 'event' : 'events'} adding ${pastedVolume}% of the submitted code.`
        : ` and completed the task with 100% manual input.`;

    const behavioralSummary = `This user typed at ${metrics.typingCadence} events per minute with ${rhythmStatus}. They ${revisionStatus}${pasteSummary}`;

    return (
        <div className="relative mt-8 p-10 border border-border bg-card rounded-3xl shadow-2xl space-y-12">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-border pb-8 gap-4">
                <div className="flex gap-4">
                    <div className={`p-3 rounded-xl shadow-inner transition-colors duration-500 ${isCodeOrganic ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
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
                    <div className={`px-4 py-2 border rounded-xl font-black text-[10px] tracking-[0.2em] uppercase mb-2 transition-colors duration-500 ${p1Status.badge}`}>
                        {results.verdict}
                    </div>
                </div>
            </div>

            {/* PILLAR 1: AI MODEL ANALYSIS */}
            <section className={`p-8 border rounded-[2.5rem] space-y-8 transition-all duration-500 ${p1Status.bg}`}>
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-3 border-l-4 pl-4 transition-colors duration-500 ${p1Status.border}`}>
                        <Cpu className={`h-6 w-6 ${p1Status.accent}`} />
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Pillar 1: AI Analysis</h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">DevRate - Neural Pattern Check</p>
                        </div>
                    </div>
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border transition-colors duration-500 ${p1Status.badge}`}>
                        {isCodeOrganic ? <ShieldCheck className="h-3 w-3" /> : <ScanEye className="h-3 w-3" />}
                        <span className="text-[10px] font-bold uppercase">
                            {isCodeOrganic ? "Signature Validated" : "Synthetic Probability"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative h-60 w-60">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke={p1Status.fill} strokeWidth="8" className="opacity-10" />
                                <circle 
                                    cx="50" cy="50" r="42" fill="none" 
                                    stroke={p1Status.fill} 
                                    strokeWidth="8" 
                                    strokeDasharray="263.89" 
                                    strokeDashoffset={263.89 - (263.89 * aiPercentNumeric) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out"
                                    style={{ filter: `drop-shadow(0 0 4px ${p1Status.fill}4d)` }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black tracking-tighter text-foreground tabular-nums">{aiPercent}%</span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${p1Status.accent}`}>
                                    AI Probability
                                </span>
                            </div>
                        </div>

                        <div className={`w-full p-4 rounded-2xl border flex items-center justify-around transition-colors duration-500 bg-background/40 ${p1Status.border}`}>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Model State</p>
                                <p className={`text-xs font-bold transition-colors ${p1Status.accent}`}>
                                    {isCodeOrganic ? "Natural Distribution" : "High Uniformity"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DataCard label="AI Probability" value={`${aiPercent}%`} icon={<Bot size={16}/>} color="text-red-500" bgColor="bg-red-500/5 border-red-500/10" />
                            <DataCard label="Human Factor" value={`${humanPercent}%`} icon={<User size={16} />} color="text-green-500" bgColor="bg-green-500/5 border-green-500/10" />
                        </div>

                        <div className="p-6 bg-secondary/10 rounded-3xl border border-border/50 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Fingerprint className={`h-20 w-20 ${p1Status.accent}`} />
                            </div>
                            <h4 className={`text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-2 ${p1Status.accent}`}>
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
                                            {isCodeOrganic 
                                                ? "Structural analysis shows organic variability and non-linear logic patterns."
                                                : `Analysis indicates ${aiPercent}% probability of synthetic origin.`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PILLAR 2: PROCESS ANALYSIS */}
            <section className={`p-8 border rounded-[2.5rem] space-y-8 transition-colors duration-500 ${p2Status.bg}`}>
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-3 border-l-4 pl-4 transition-colors duration-500 ${p2Status.border}`}>
                        <Activity className={`h-6 w-6 ${p2Status.accent}`} />
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Pillar 2: Process Analysis</h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Behavioral Biometrics</p>
                        </div>
                    </div>
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border transition-colors duration-500 ${p2Status.badge}`}>
                        <MousePointer2 className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase">
                            {isSuspicious ? "Anomalous Activity" : "Real-time Telemetry"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative h-60 w-60">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke={p2Status.fill} strokeWidth="8" className="opacity-10" />
                                <circle 
                                    cx="50" cy="50" r="42" fill="none" stroke={p2Status.fill} strokeWidth="8" 
                                    strokeDasharray="263.89" 
                                    strokeDashoffset={263.89 - (263.89 * autonomyPercentNumeric) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out"
                                    style={{ filter: `drop-shadow(0 0 4px ${p2Status.fill}4d)` }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black tracking-tighter text-foreground tabular-nums">{autonomyPercent}%</span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${p2Status.accent}`}>
                                    Human Autonomy
                                </span>
                            </div>
                        </div>
                        
                        <div className={`w-full p-4 rounded-2xl border flex items-center justify-around transition-colors duration-500 bg-background/40 ${p2Status.border}`}>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Method</p>
                                <p className={`text-xs font-bold transition-colors ${p2Status.accent}`}>
                                    {methodLabel}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className={`p-6 rounded-3xl border relative overflow-hidden transition-colors ${isSuspicious ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <BarChart3 className="h-15 w-15" />
                            </div>
                            <h4 className={`text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2 ${p2Status.accent}`}>
                                <Info className="h-3 w-3" /> Behavioral Conclusion
                            </h4>
                            <p className="text-base font-bold text-foreground leading-snug mb-3">
                                {results?.behavioral_analysis?.interpretation || "Analyzing input patterns..."}
                            </p>
                            <div className="p-3 bg-white/40 rounded-xl border border-white/20">
                                <p className="text-xs font-small text-muted-foreground leading-relaxed italic">
                                    {behavioralSummary}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <BehavioralLogItem icon={<Zap size={14} />} label="Keystroke Frequency" value={`${metrics.typingCadence} EPM`} description="Measures interaction frequency with the editor." accentColor={p2Status.accent} />
                            <BehavioralLogItem icon={<Activity size={14} />} label="Burst-Pause Ratio" value={metrics.burstPauseRatio.toFixed(2)} description="Ratio of active typing bursts to idle pauses." accentColor={p2Status.accent} />
                            <BehavioralLogItem icon={<History size={14} />} label="Revision Density" value={`${(metrics.revisionDensity * 100).toFixed(1)}%`} description="Measures how much you refactor your work." accentColor={p2Status.accent} />
                            <BehavioralLogItem icon={<Clipboard size={14} />} label="Paste Events" value={metrics.pasteCount} description="Total external code insertions detected." accentColor={p2Status.accent} />
                            <BehavioralLogItem icon={<User size={14} />} label="Originality Index" value={`${(metrics.originalityIndex * 100).toFixed(0)}%`} description="Percentage of final code manually typed." accentColor={p2Status.accent} />
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
const BehavioralLogItem = ({ label, value, description, icon, accentColor }: { label: string; value: string | number; description: string, icon: React.ReactNode, accentColor: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isAmber = accentColor.includes('amber');
    const isBlue = accentColor.includes('blue');

    let hoverStyle = "hover:border-primary/30";
    let iconStyle = "bg-primary/5 text-primary group-hover:bg-primary";
    let textStyle = "text-primary";

    if (isAmber) {
        hoverStyle = "hover:border-amber-500/30";
        iconStyle = "bg-amber-500/5 text-amber-500 group-hover:bg-amber-500";
        textStyle = "text-amber-600";
    } else if (isBlue) {
        hoverStyle = "hover:border-blue-500/30";
        iconStyle = "bg-blue-500/5 text-blue-500 group-hover:bg-blue-500";
        textStyle = "text-blue-600";
    }

    return (
        <div className={`group border border-border/50 rounded-2xl overflow-hidden bg-background shadow-sm transition-all ${hoverStyle}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${iconStyle} group-hover:text-white`}>
                        {icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight text-muted-foreground group-hover:text-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-black tabular-nums transition-colors ${textStyle}`}>{value}</span>
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
    const isHighRisk = score > 0.6;
    const textColor = isHighRisk ? 'text-red-500' : 'text-green-500';
    const dotColor = isHighRisk ? 'bg-red-500 animate-pulse' : 'bg-green-500';

    const definitions: Record<string, string> = {
        "High Semantic Uniformity": "The code follows a highly predictable logical structure common in large language models.",
        "Synthetic Logic Flow": "The progression of functions and variables aligns with AI training patterns rather than human problem-solving.",
        "Low Structural Entropy": "The code is 'too clean'—lacking the natural chaos and stylistic variations of human-written scripts."
    };

    return (
        <div className="border border-border/50 rounded-xl overflow-hidden bg-background shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                    <span className="text-xs font-bold">{label}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-mono font-bold transition-colors duration-300 ${textColor}`}>
                        {(score * 100).toFixed(2)}% MATCH
                    </span>
                    <div className="text-muted-foreground/30">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
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

const DataCard = ({ label, value, color, bgColor, icon }: any) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border bg-background shadow-sm transition-all ${bgColor}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white shadow-sm ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight leading-none mb-1">
                    {label}
                </p>
                <p className={`text-xl font-black tabular-nums ${color}`}>
                    {value}
                </p>
            </div>
        </div>
    </div>
);