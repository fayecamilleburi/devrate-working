import { useState } from 'react';
import { 
    Fingerprint, Activity, ChevronDown, ChevronUp, 
    AlertCircle, Cpu, CheckCircle2, ShieldAlert, Info
} from 'lucide-react';

interface DetailedReportProps {
    metrics: {
        typingCadence: number;
        burstPauseRatio: number;
        revisionDensity: number;
    };
    results: any;
}

export const DetailedReport = ({ metrics, results }: DetailedReportProps) => {
    // Added results?.ai_confidence_score to the list
    const rawValue = 
        results?.ai_confidence_score ?? 
        0;

    const numericScore = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;

    // Calculate percentages
    const aiPercentNumeric = numericScore * 100;
    const aiPercent = aiPercentNumeric.toFixed(2); 
    const humanPercent = (100 - aiPercentNumeric).toFixed(2);
    const isCodeOrganic = numericScore < 0.5;

    // Extract behavior flags safely
    const behaviorFlags = results?.behavior_analysis?.flags || [];

   

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

           
            {/* PILLAR 1: Using the AI Code Detection Model */}
            <section className={`p-8 border rounded-[2.5rem] space-y-8 ${isCodeOrganic ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                    <Cpu className="h-6 w-6 text-primary" />
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">Pillar 1: AI Analysis</h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase">DevRate Model Output</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    {/* THE GAUGE */}
                    <div className="relative h-60 w-60 mx-auto lg:mx-0">
                        <div className="h-full w-full rounded-full flex items-center justify-center shadow-xl transition-all duration-1000"
                            style={{ 
                                background: `conic-gradient(#ef4444 0% ${aiPercent}%, #22c55e ${aiPercent}% 100%)` 
                            }}>
                            <div className="h-44 w-44 bg-card rounded-full flex flex-col items-center justify-center border border-border/50 shadow-inner">
                                {/* AI SCORE HERE TO VERIFY AGAINST TERMINAL */}
                                <span className="text-4xl font-black tracking-tighter text-foreground">
                                    {aiPercent}%
                                </span>
                                <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mt-1 text-center px-4 text-red-500">
                                    AI Probability
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DataCard label="AI Probability" value={aiPercent} color="text-red-500" />
                            <DataCard label="Human Factor" value={humanPercent} color="text-green-500" />
                        </div>

                        <div className="p-6 bg-secondary/10 rounded-2xl border border-border/50">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-2">
                                <ShieldAlert className="h-3 w-3" /> Technical Evidence Log
                            </h4>
                            
                            <div className="space-y-3">
                                {/* Check if we have indicators, otherwise show the fallback */}
                                {results?.ai_analysis?.top_indicators?.length > 0 ? (
                                    results.ai_analysis.top_indicators.map((item: any, i: number) => (
                                        <IndicatorItem key={i} label={item.token} score={item.score} />
                                    ))
                                ) : (
                                    <div className="flex items-start gap-4 text-muted-foreground">
                                        <Info className="h-5 w-5 mt-1" />
                                        <p className="text-xs italic">
                                            Structural Analysis indicates {aiPercent}% likelihood of synthetic origin based on transformer-based token sequencing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PILLAR 2: BEHAVIORAL TELEMETRY --- */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
                    <Activity className="h-6 w-6 text-amber-500" />
                    <h3 className="text-xl font-bold tracking-tight">Pillar 2: Behavioral Telemetry</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-secondary/5 rounded-3xl border border-border/50 grid grid-cols-2 gap-4 shadow-inner">
                        <StatBox label="Typing Cadence" value={`${metrics.typingCadence} keys/min`} />
                        <StatBox label="Burst/Pause Ratio" value={metrics.burstPauseRatio} />
                        <StatBox label="Revision Density" value={metrics.revisionDensity} />
                    </div>

                    <div className="space-y-3">
                         {behaviorFlags.map((flag: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-amber-900/80 leading-snug">{flag}</p>
                            </div>
                         ))}
                         {behaviorFlags.length === 0 && (
                             <div className="h-full flex items-center justify-center border border-dashed rounded-3xl opacity-40">
                                <p className="text-xs italic">Behavioral patterns align with organic creation.</p>
                             </div>
                         )}
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const IndicatorItem = ({ label, score }: { label: string; score: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const definitions: Record<string, string> = {
        "Syntactic Regularity": "High level of mathematical perfection in code spacing and indentation. Machine-generated code lacks the stylistic inconsistencies found in human work.",
        "Predictive Logic Pattern": "The code sequence aligns with high-probability token transitions found in LLM training data.",
        "Standard Boilerplate Structure": "Detection of generic templates that lack project-specific variable naming or complex human integration logic.",
        "Repetitive Tokenization": "Patterns of variable naming and loop structures that are statistically common in synthetic training sets."
    };

    return (
        <div className="border border-border/50 rounded-xl overflow-hidden bg-background shadow-sm transition-all">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${score > 0.6 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold">{label}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono font-bold text-red-500">{(score * 100).toFixed(3)}% MATCH</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 opacity-30" /> : <ChevronDown className="h-4 w-4 opacity-30" />}
                </div>
            </button>
            {isOpen && (
                <div className="px-9 pb-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-3 bg-secondary/10 rounded-lg border border-border/20 flex gap-3 italic">
                        <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                            {definitions[label] || "Neural pattern deviation detected in code geometry and token selection."}
                        </p>
                    </div>
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

const StatBox = ({ label, value, color = "text-foreground" }: any) => (
    <div className="p-4 bg-card border border-border/40 rounded-2xl shadow-sm">
        <p className={`${color} text-2xl font-black tracking-tighter tabular-nums`}>{value}</p>
        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{label}</p>
    </div>
);