import { AlertTriangle, Code2, ArrowRight, ShieldAlert } from "lucide-react";

interface SafetyNetProps {
    isMismatch: boolean;
    warning: string;
    detectedLanguage: string;
    onLanguageChange: (lang: string) => void;
}

export function SafetyNet({ isMismatch, warning, detectedLanguage, onLanguageChange }: SafetyNetProps) {
    if (!isMismatch) return null;

    // Define the languages DevRate actually supports
    const supportedLanguages = ["python", "java", "csharp"];
    const isSupported = supportedLanguages.includes(detectedLanguage?.toLowerCase());
    const fallbackLang = detectedLanguage || "python";

    return (
        <div className="mt-8 p-6 border border-amber-500/20 bg-card rounded-4xl transition-all">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                
                {/* Left Section: Context */}
                <div className="flex flex-1 gap-4">
                    <div className={`p-3 rounded-xl h-fit shrink-0 ${!isSupported ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {isSupported ? <AlertTriangle className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                    </div>
                    <div className="space-y-1">
                        <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${!isSupported ? 'text-red-600' : 'text-amber-600'}`}>
                            {isSupported ? "Syntax Discrepancy" : "Unsupported Language"}
                        </h3>
                        <p className="text-sm font-bold text-foreground leading-snug">
                            {warning || "The detected code syntax does not match your current settings."}
                        </p>
                    </div>
                </div>

                {/* Right Section: Action Button or Support Notice */}
                {isSupported ? (
                    /* CASE: Supported - Show 'Switch Language' Button */
                    <button 
                        type="button"
                        onClick={() => onLanguageChange(fallbackLang)}
                        className="group flex items-center gap-4 p-3 pr-5 bg-secondary/20 hover:bg-secondary/40 border border-border/50 rounded-2xl transition-all"
                    >
                        <div className="p-2 bg-amber-500 rounded-lg text-white shadow-sm">
                            <Code2 size={16} />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black uppercase tracking-tight text-muted-foreground leading-none mb-1">
                                System Suggestion
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase">Use {fallbackLang}</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </button>
                ) : (
                    /* CASE: Unsupported - Show Flat Notice */
                    <div className="flex items-center gap-4 p-3 pr-5 bg-muted/30 border border-dashed border-border rounded-2xl grayscale opacity-80 cursor-not-allowed">
                        <div className="p-2 bg-muted-foreground/20 rounded-lg text-muted-foreground">
                            <AlertTriangle size={16} />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black uppercase tracking-tight text-muted-foreground leading-none mb-1">
                                Devrate Limitation
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">
                                    DevRate only accepts Python, Java, C#
                                </span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}