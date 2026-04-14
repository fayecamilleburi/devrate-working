import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
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
            <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
                <SelectTrigger className="h-7 w-32.5 text-xs font-mono bg-secondary/50 border-border">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="text-xs font-mono">
                            {lang.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}