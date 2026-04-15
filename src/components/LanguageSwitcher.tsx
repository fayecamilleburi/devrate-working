import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2 } from "lucide-react";

export type Language = "java" | "python" | "csharp";

interface LanguageSwitcherProps {
    language: Language;
    onLanguageChange: (language: Language) => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
    { value: "java", label: "Java" },
    { value: "python", label: "Python" },
    { value: "csharp", label: "C#" },
];

export function LanguageSwitcher({ language, onLanguageChange }: LanguageSwitcherProps) {
    return (
        <div className="flex items-center gap-2">
            <Code2 className="h-3.5 w-3.5 text-slate-500" />
            <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
                <SelectTrigger 
                    className="h-9 w-32 text-xs font-mono bg-white border-slate-200 text-slate-900 focus:ring-1 focus:ring-slate-300 focus:ring-offset-0"
                >
                    <SelectValue />
                </SelectTrigger>
                
                {/* 1. position="popper" ensures it drops down relative to the trigger 
                  2. sideOffset={4} adds a small gap like in the screenshot
                */}
                <SelectContent 
                    position="popper" 
                    sideOffset={4}
                    className="w-32 bg-white border-slate-200 text-slate-900 shadow-md p-1"
                >
                    {LANGUAGES.map((lang) => (
                        <SelectItem 
                            key={lang.value} 
                            value={lang.value} 
                            // This styling mimics the emerald green hover/active state
                            className="text-xs font-mono focus:bg-[#34d399] focus:text-white cursor-pointer data-[state=checked]:bg-[#34d399] data-[state=checked]:text-white"
                        >
                            {lang.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}