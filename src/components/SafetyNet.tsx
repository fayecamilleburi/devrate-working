import { AlertTriangle, Code2 } from "lucide-react";

interface SafetyNetProps {
    isMismatch: boolean;
    warning: string;
    detectedLanguage: string;
    onLanguageChange: (lang: string) => void;
}

export function SafetyNet({ isMismatch, warning, detectedLanguage, onLanguageChange }: SafetyNetProps) {
    if (!isMismatch) return null;

    // Logic to handle missing language key from backend
    const fallbackLang = detectedLanguage || "python"; // Default to python if backend forgot the key

    return (
        <div className="w-full block clear-both my-4 min-h-[100px] border-2 border-amber-500 bg-amber-50 rounded-xl overflow-hidden shadow-lg animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-500 text-white">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">
                    Syntax Mismatch
                </span>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <p className="text-sm font-bold text-amber-950 leading-snug">
                        {warning || "The detected code syntax does not match your current settings."}
                    </p>
                </div>

                <button 
                    type="button"
                    onClick={() => onLanguageChange(fallbackLang)}
                    className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
                >
                    <Code2 className="h-4 w-4" />
                    SWITCH TO {fallbackLang.toUpperCase()}
                </button>
            </div>
        </div>
    );
}