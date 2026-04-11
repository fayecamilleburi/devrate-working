import { useCallback, useRef, useState } from "react";

export interface CodeMetrics {
    typingCadence: number;        // Frequency of manual interaction (Events/Min)
    burstPauseRatio: number;      // Coding flow vs. Thinking/Researching time
    revisionDensity: number;      // How much the user "fumbles" or refactors
    pasteCount: number;           // Number of times external code was imported
    totalPastedChars: number;     // Total volume of code not hand-typed
    originalityIndex: number;     // % of code written manually
}

export function useCodeMetrics() {
    const [metrics, setMetrics] = useState<CodeMetrics>({
        typingCadence: 0,
        burstPauseRatio: 0,
        revisionDensity: 0,
        pasteCount: 0,
        totalPastedChars: 0,
        originalityIndex: 1, // Default to 100% original
    });

    // --- Session Metadata ---
    const lastKeystrokeTime = useRef<number>(0);
    const sessionActive = useRef(false);

    // --- Time-Gap Correction: Track accumulated active milliseconds
    const totalActiveMs = useRef<number>(0);
    const idleThresholdMs = 300000; // 5 minutes
    
    // --- Behavioral Counters ---
    const eventCount = useRef(0);         // Total manual actions (inserts/deletes)
    const burstCount = useRef(0);         // Actions < 3s apart
    const pauseCount = useRef(0);         // Actions > 3s apart
    
    // --- Revision Tracking ---
    const lineEditCounts = useRef<Map<number, number>>(new Map());
    const totalLineEdits = useRef(0);
    const revisitedLineEdits = useRef(0);

    // --- Provenance Tracking ---
    const pasteEventCount = useRef(0);
    const totalPastedChars = useRef(0);

    /**
     * Calculates the behavioral story based on current state.
     * @param currentDocLength - The total character count currently in the editor.
     */
    const computeMetrics = useCallback((currentDocLength: number = 0) => {
        if (!sessionActive.current) return;

        // const now = Date.now();
        // const sessionMin = (now - sessionStart.current) / 60000 || 1;
        // Use accrued active time, ensuring at least 1 second to avoid division by zero
        const activeMin = Math.max(totalActiveMs.current, 1000) / 60000;

        // 1. Cadence: Measures interaction frequency without being inflated by paste volume.
        const cadence = eventCount.current / activeMin;

        // 2. Burst/Pause Ratio: > 2.0 suggests "Flow", < 1.0 suggests high cognitive load.
        const burstPause = pauseCount.current > 0 
            ? burstCount.current / pauseCount.current 
            : burstCount.current;

        // 3. Revision Density: % of work spent on previously touched lines.
        const revDensity = totalLineEdits.current > 0
            ? revisitedLineEdits.current / totalLineEdits.current
            : 0;

        // --- Logic: Effective Pasted Characters ---
        // Clamps the "pasted" pool to the actual size of the document.
        const effectivePasted = Math.min(totalPastedChars.current, currentDocLength);
        
        // 4. Originality Index
        const originality = currentDocLength > 0 
            ? Math.max(0, (currentDocLength - effectivePasted) / currentDocLength)
            : 1;

        setMetrics({
            typingCadence: Math.round(cadence * 10) / 10,
            burstPauseRatio: Math.round(burstPause * 100) / 100,
            revisionDensity: Math.round(revDensity * 100) / 100,
            pasteCount: pasteEventCount.current,
            totalPastedChars: totalPastedChars.current,
            originalityIndex: Math.round(originality * 100) / 100,
        });
    }, []);

    /**
     * Records an atomic editor event and interprets user behavior.
     */
    const recordKeystroke = useCallback((
        type: "insert" | "delete" | "paste", 
        length: number, 
        lineNumber?: number
    ) => {
        if (!sessionActive.current) return;

        const now = Date.now();
        const gap = now - lastKeystrokeTime.current;

        // --- Logic: Time-Gap Correction ---
        // Only add to active time if the gap is within the reasonable threshold
        if (gap < idleThresholdMs) {
            totalActiveMs.current += gap;
        }
        
        // Track interaction events (One paste = 1 event, One character = 1 event)
        eventCount.current++;

        // --- Logic: Flow ---
        // We use a 3-second threshold to define a "thought break"
        if (gap > 3000) {
            pauseCount.current++;
        } else {
            burstCount.current++;
        }
        lastKeystrokeTime.current = now;

        // --- Logic: Revision ---
        if (lineNumber !== undefined) {
            totalLineEdits.current++;
            const existingCount = lineEditCounts.current.get(lineNumber) || 0;
            
            // If the line has been touched before, this is a revision/refinement
            if (existingCount > 0) revisitedLineEdits.current++;
            lineEditCounts.current.set(lineNumber, existingCount + 1);
        }

        // --- Logic: Provenance ---
        if (type === "paste") {
            pasteEventCount.current++;
            totalPastedChars.current += length;
        }

        // If user deletes, we reduce the 'non-original' character pool.
        if (type === "delete" && totalPastedChars.current > 0) {
            totalPastedChars.current = Math.max(0, totalPastedChars.current - length);
        }
    }, []);

    const startSession = useCallback(() => {
        lastKeystrokeTime.current = Date.now();
        sessionActive.current = true;
        
        // Reset internal refs for a clean session
        eventCount.current = 0;
        burstCount.current = 0;
        pauseCount.current = 0;
        totalLineEdits.current = 0;
        revisitedLineEdits.current = 0;
        pasteEventCount.current = 0;
        totalPastedChars.current = 0;
        lineEditCounts.current.clear();
    }, []);

    const stopSession = useCallback(() => {
        sessionActive.current = false;
    }, []);

    return { 
        metrics, 
        startSession, 
        stopSession, 
        recordKeystroke, 
        computeMetrics 
    };
}