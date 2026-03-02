import { useCallback, useEffect, useRef, useState } from "react";

export interface CodeMetrics {
    typingCadence: number;      // avg keystrokes per minute
    burstVelocity: number;      // max keystrokes in a 3-second window
    backtrackRatio: number;     // ratio of deletions to total keystrokes
    pasteEvents: number;        // total paste count
    focusLossCount: number;     // times editor lost focus
    pauseFrequency: number;     // pauses >3s per minute
    codeGrowthRate: number;     // net characters added per minute
    compileAttempts: number;    // run/compile button presses
    revisionDensity: number;    // edits to previously written lines / total edits
    sessionDuration: number;    // seconds since session start
}

interface KeystrokeEvent {
    timestamp: number;
    type: "insert" | "delete" | "paste";
    length: number;
}

export function useCodeMetrics() {
    const [metrics, setMetrics] = useState<CodeMetrics>({
        typingCadence: 0,
        burstVelocity: 0,
        backtrackRatio: 0,
        pasteEvents: 0,
        focusLossCount: 0,
        pauseFrequency: 0,
        codeGrowthRate: 0,
        compileAttempts: 0,
        revisionDensity: 0,
        sessionDuration: 0,
    });

    const sessionStart = useRef<number>(0);
    const keystrokeLog = useRef<KeystrokeEvent[]>([]);
    const totalInserts = useRef(0);
    const totalDeletes = useRef(0);
    const pasteCount = useRef(0);
    const focusLossCount = useRef(0);
    const compileCount = useRef(0);
    const lastKeystrokeTime = useRef<number>(0);
    const pauseCount = useRef(0);
    const initialCodeLength = useRef(0);
    const currentCodeLength = useRef(0);
    const editedLines = useRef<Set<number>>(new Set());
    const totalLineEdits = useRef(0);
    const revisitedLineEdits = useRef(0);
    const updateTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Initialize once on mount
        sessionStart.current = Date.now();
        lastKeystrokeTime.current = Date.now();
    }, []);

    const computeMetrics = useCallback(() => {
        const now = Date.now();
        const sessionSec = (now - sessionStart.current) / 1000;
        const sessionMin = sessionSec / 60 || 1;

        // Burst velocity: max keystrokes in any 3s window
        const events = keystrokeLog.current;
        let maxBurst = 0;
        for (let i = 0; i < events.length; i++) {
            const windowEnd = events[i].timestamp + 3000;
            let count = 0;
            for (let j = i; j < events.length && events[j].timestamp <= windowEnd; j++) {
                count++;
            }
            maxBurst = Math.max(maxBurst, count);
        }

        const totalKeystrokes = totalInserts.current + totalDeletes.current;
        const backtrackRatio = totalKeystrokes > 0 ? totalDeletes.current / totalKeystrokes : 0;
        const cadence = totalKeystrokes / sessionMin;
        const growthRate = (currentCodeLength.current - initialCodeLength.current) / sessionMin;
        const revDensity = totalLineEdits.current > 0 
            ? revisitedLineEdits.current / totalLineEdits.current 
            : 0;

            setMetrics({
                typingCadence: Math.round(cadence),
                burstVelocity: maxBurst,
                backtrackRatio: Math.round(backtrackRatio * 100) / 100,
                pasteEvents: pasteCount.current,
                focusLossCount: focusLossCount.current,
                pauseFrequency: Math.round((pauseCount.current / sessionMin) * 10) / 10,
                codeGrowthRate: Math.round(growthRate),
                compileAttempts: compileCount.current,
                revisionDensity: Math.round(revDensity * 100) / 100,
                sessionDuration: Math.round(sessionSec),
            });
    }, []);

    const startSession = useCallback((initialLength: number) => {
        sessionStart.current = Date.now();
        initialCodeLength.current = initialLength;
        currentCodeLength.current = initialLength;
        keystrokeLog.current = [];
        totalInserts.current = 0;
        totalDeletes.current = 0;
        pasteCount.current = 0;
        focusLossCount.current = 0;
        compileCount.current = 0;
        pauseCount.current = 0;
        editedLines.current = new Set();
        totalLineEdits.current = 0;
        revisitedLineEdits.current = 0;
        lastKeystrokeTime.current = Date.now();

        if (updateTimer.current) clearInterval(updateTimer.current);
        updateTimer.current = setInterval(computeMetrics, 500);
    }, [computeMetrics]);

    const recordKeystroke = useCallback((type: "insert" | "delete", length: number, lineNumber?: number) => {
        const now = Date.now();

        // Check for pauses >3s
        if (now - lastKeystrokeTime.current > 3000) {
            pauseCount.current++;
        }
        lastKeystrokeTime.current = now;

        keystrokeLog.current.push({ timestamp: now, type, length });
        // Keep only last 60s of events for burst calculation
        const cutoff = now - 60000;
        keystrokeLog.current = keystrokeLog.current.filter(e => e.timestamp > cutoff);

        if (type === "insert") {
            totalInserts.current += length;
            currentCodeLength.current += length;
        } else {
            totalDeletes.current += length;
            currentCodeLength.current -= length;
        }

        // Track line revisions
        if (lineNumber !== undefined) {
            totalLineEdits.current++;
            if (editedLines.current.has(lineNumber)) {
                revisitedLineEdits.current++;
            }
            editedLines.current.add(lineNumber);
        }
    }, []);

    const recordPaste = useCallback((length: number) => {
        pasteCount.current++;
        totalInserts.current += length;
        currentCodeLength.current += length;
        keystrokeLog.current.push({ timestamp: Date.now(), type: "paste", length });
    }, []);

    const recordFocusLoss = useCallback(() => {
        focusLossCount.current++;
    }, []);

    const recordCompile = useCallback(() => {
        compileCount.current++;
        computeMetrics();
    }, [computeMetrics]);

    return {
        metrics,
        startSession,
        recordKeystroke,
        recordPaste,
        recordFocusLoss,
        recordCompile,
    };
}