import type { CodeMetrics } from '@/hooks/useCodeMetrics';
import { MetricCard } from "./MetricCard";
import { 
    Keyboard, Zap, Undo2, ClipboardPaste, EyeOff, Pause, 
    TrendingUp, Play, RotateCcw, Clock,
} from 'lucide-react';

interface MetricsPanelProps {
    metrics: CodeMetrics;
    onCompile: () => void;
}

function getLevel(value: number, warnThreshold: number, alertThreshold: number) {
    if (value >= alertThreshold) return "alert" as const;
    if (value >= warnThreshold) return "warning" as const;
    return "normal" as const;
}

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MetricsPanel({ metrics, onCompile }: MetricsPanelProps) {
    return (
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Live Metrics</h2>
                    <p className="text-xs text-muted-foreground">Real-time behavioral analysis</p>
                </div>
                <button
                    onClick={onCompile}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
                >
                    <Play className="h-3 w-3" />
                    Run Code
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Typing Cadence" value={metrics.typingCadence} unit="kpm" icon={<Keyboard className="h-3.5 w-3.5" />} level={getLevel(metrics.typingCadence, 300, 500)} description="Keystrokes per minute" />
                <MetricCard label="Burst Velocity" value={metrics.burstVelocity} unit="/ 3s" icon={<Zap className="h-3.5 w-3.5" />} level={getLevel(metrics.burstVelocity, 30, 50)} description="Max keys in 3s window" />
                <MetricCard label="Backtrack Ratio" value={metrics.backtrackRatio} icon={<Undo2 className="h-3.5 w-3.5" />} level={getLevel(metrics.backtrackRatio, 0.3, 0.5)} description="Delete / total keystrokes" />
                <MetricCard label="Paste Events" value={metrics.pasteEvents} icon={<ClipboardPaste className="h-3.5 w-3.5" />} level={getLevel(metrics.pasteEvents, 3, 8)} description="Clipboard paste count" />
                <MetricCard label="Focus Loss" value={metrics.focusLossCount} icon={<EyeOff className="h-3.5 w-3.5" />} level={getLevel(metrics.focusLossCount, 5, 15)} description="Editor blur events" />
                <MetricCard label="Pause Freq" value={metrics.pauseFrequency} unit="/ min" icon={<Pause className="h-3.5 w-3.5" />} level={getLevel(metrics.pauseFrequency, 5, 10)} description="Pauses >3s per minute" />
                <MetricCard label="Code Growth" value={metrics.codeGrowthRate} unit="ch/min" icon={<TrendingUp className="h-3.5 w-3.5" />} level={getLevel(Math.abs(metrics.codeGrowthRate), 500, 1000)} description="Net chars added per min" />
                <MetricCard label="Run Attempts" value={metrics.compileAttempts} icon={<Play className="h-3.5 w-3.5" />} description="Compile / run presses" />
                <MetricCard label="Revision Density" value={metrics.revisionDensity} icon={<RotateCcw className="h-3.5 w-3.5" />} level={getLevel(metrics.revisionDensity, 0.4, 0.7)} description="Re-edits to same lines" />
                <MetricCard label="Session Time" value={formatDuration(metrics.sessionDuration)} icon={<Clock className="h-3.5 w-3.5" />} description="Time since start" />
            </div>
        </div>

    )
}