import { cn } from "@/lib/utils";

type MetricLevel = "normal" | "warning" | "alert";

interface MetricCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    level?: MetricLevel;
    description?: string;
}

const levelStyles: Record<MetricLevel, string> = {
    normal: "border-border glow-primary",
    warning: "border-warning/30 glow-warning",
    alert: "border-destructive/30 glow-destructive",
};

const levelDotStyles: Record<MetricLevel, string> = {
    normal: "bg-primary",
    warning: "bg-warning",
    alert: "bg-destructive",
};

export function MetricCard({ label, value, unit, icon, level = "normal", description }: MetricCardProps) {
    return (
        <div className={cn(
            "rounded-lg border bg-card p-4 transition-all duration-300",
            levelStyles[level]
        )}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse-glow", levelDotStyles[level])} />
                    <span className="text-muted-foreground">{icon}</span>
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-foreground">{value}</span>
                {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            </div>
            {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
        </div>
    );
}