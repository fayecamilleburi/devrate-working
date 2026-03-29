import type { CodeMetrics } from '@/hooks/useCodeMetrics';
import { MetricCard } from "./MetricCard";
import {  Keyboard, Zap, Play, RotateCcw } from 'lucide-react';

interface MetricsPanelProps {
    metrics: CodeMetrics;
    onCompile: () => void;
}

function getLevel(value: number, warnThreshold: number, alertThreshold: number) {
    if (value >= alertThreshold) return "alert" as const;
    if (value >= warnThreshold) return "warning" as const;
    return "normal" as const;
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
                <MetricCard label="Burst-Pause Ratio" value={metrics.burstPauseRatio} unit="/ 3s" icon={<Zap className="h-3.5 w-3.5" />} level={getLevel(metrics.burstPauseRatio, 30, 50)} description="Bursts divided by pauses" />
                <MetricCard label="Revision Density" value={metrics.revisionDensity} icon={<RotateCcw className="h-3.5 w-3.5" />} level={getLevel(metrics.revisionDensity, 0.4, 0.7)} description="Re-edits to same lines" />
            </div>
        </div>

    )
}