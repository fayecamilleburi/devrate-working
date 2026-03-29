import { useCallback, useEffect, useRef, useState } from "react";

export interface CodeMetrics {
    typingCadence: number;          // avg keystrokes per minute
    burstPauseRatio: number;        // bursts / pauses
    revisionDensity: number;        // revisits / total edits
}

interface KeystrokeEvent {
    timestamp: number;
    type: "insert" | "delete" | "paste";
    length: number;
    lineNumber?: number;
}

export function useCodeMetrics() {
    const [metrics, setMetrics] = useState<CodeMetrics>({
        typingCadence: 0,
        burstPauseRatio: 0,
        revisionDensity: 0,
    });

    const sessionStart = useRef<number>(0);
    const keystrokeLog = useRef<KeystrokeEvent[]>([]);
    const lastKeystrokeTime = useRef<number>(0);

    // For revision density
    const lineEditCounts = useRef<Map<number, number>>(new Map());
    const totalLineEdits = useRef(0);
    const revisitedLineEdits = useRef(0);

    // For burst/pause ratio
    const burstCount = useRef(0);
    const pauseCount = useRef(0);

    // Interval management
    const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Initialize once on mount
        sessionStart.current = Date.now();
        lastKeystrokeTime.current = Date.now();

        return () => {
            if (intervalId.current) clearInterval(intervalId.current);
        };
    }, []);

    const computeMetrics = useCallback(() => {
        const now = Date.now();
        const sessionSec = (now - sessionStart.current) / 1000;
        const sessionMin = sessionSec / 60 || 1;

        // Typing cadence = total keystrokes per minute
        const totalKeystrokes = keystrokeLog.current.length;
        const cadence = totalKeystrokes / sessionMin;

        // Burst-Pause Ratio = bursts / pauses
        const burstPause = pauseCount.current > 0
            ? burstCount.current / pauseCount.current
            : burstCount.current;

        // Revision density = revisits / total edits
        const revDensity = totalLineEdits.current > 0
            ? revisitedLineEdits.current / totalLineEdits.current
            : 0;

        setMetrics({
            typingCadence: Math.round(cadence * 10) / 10,
            burstPauseRatio: Math.round(burstPause * 100) / 100,
            revisionDensity: Math.round(revDensity * 100) / 100,
        });
    }, []);

    const startSession = useCallback(() => {
        if (intervalId.current) clearInterval(intervalId.current);

        sessionStart.current = Date.now();
        keystrokeLog.current = [];
        lineEditCounts.current = new Map();
        totalLineEdits.current = 0;
        revisitedLineEdits.current = 0;
        burstCount.current = 0;
        pauseCount.current = 0;
        lastKeystrokeTime.current = Date.now();

        intervalId.current = setInterval(computeMetrics, 500);
    }, [computeMetrics]);

    const recordKeystroke = useCallback((type: "insert" | "delete" | "paste", length: number, lineNumber?: number) => {
        const now = Date.now();

        // Detect pauses >3s
        if (now - lastKeystrokeTime.current > 3000) {
            pauseCount.current++;
        } else {
            burstCount.current++;
        }
        lastKeystrokeTime.current = now;

        keystrokeLog.current.push({ timestamp: now, type, length, lineNumber });
        
        // Track line edits
        if (lineNumber !== undefined) {
            totalLineEdits.current++;
            const count = lineEditCounts.current.get(lineNumber) || 0;
            if (count > 0) revisitedLineEdits.current++;
            lineEditCounts.current.set(lineNumber, count + 1);
        }
    }, []);

    return {
        metrics,
        startSession,
        recordKeystroke
    };
}