import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";
import { LanguageSwitcher, type Language } from "./LanguageSwitcher";

interface CodeEditorProps {
    onChange: (value: string) => void;
    onKeystroke: (type: "insert" | "delete" | "paste", length: number, lineNumber?: number) => void;
    onEditorReady: (initialLength: number) => void;
    onComputeMetrics: (currentLength: number) => void; // New prop for behavioral calculation
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

const DEFAULT_CODE: Record<Language, string> = {
    java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello Java\");\n    }\n}",
    python: "def main():\n    print(\"Hello Python\")",
    cpp: "#include <iostream>\nint main() {\n    std::cout << \"Hello C++\";\n    return 0;\n}"
};

export function CodeEditor({ onChange, onKeystroke, onEditorReady, onComputeMetrics, language, onLanguageChange }: CodeEditorProps) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const isPastePending = useRef(false);

    // Store disposables to prevent memory leaks by cleaning up listeners on unmount
    const disposables = useRef<monaco.IDisposable[]>([]);

    const handleMount: OnMount = (editor) => {
        editorRef.current = editor;
        
        const initialValue = editor.getValue();
        onChange(initialValue);
        onEditorReady(initialValue.length);

        // FEATURE: Detect 'Paste' intent
        // Acts as a decision maker to tell if the action is "paste" or "insert".
        const pasteListener = editor.onDidPaste(() => {
            isPastePending.current = true;

            // setTimeout with 0 ms defers the reset until the browser 
            // has finished processing the text insertion events below.
            setTimeout(() => {
                isPastePending.current = false;
            }, 0);
        });
        disposables.current.push(pasteListener);

        // FEATURE: Comprehensive Change Tracking (typing, deleting, pasting, undoing)
        const changeListener = editor.onDidChangeModelContent((event) => {
            const currentCode = editor.getValue();
            const currentLength = currentCode.length;
            
            onChange(currentCode); // Update the main application state
            
            // Undo/Redo Blindspot Correction
            // If the change was triggered by an undo/redo, we do NOT log telemetry.
            // Prevents "fossil" code from affecting the behavioral profile.
            if (event.isUndoing || event.isRedoing) return;
            
            event.changes.forEach((change) => {
                const isAddition = change.text.length > 0;
                const isDeletion = change.rangeLength > 0;

                // Handle text being added
                if (isAddition) {
                    // If the paste flag is active, categorize this addition as a "paste", otherwise "insert"
                    const type = isPastePending.current ? "paste" : "insert";
                    onKeystroke(type, change.text.length, change.range.startLineNumber);
                } 
                
                // Handle text being removed
                // Note: Tracks deletions even if a paste is pending
                // Captures "paste-over" events where existing code is replaced.
                if (isDeletion) {
                    onKeystroke("delete", change.rangeLength, change.range.startLineNumber);
                }
            });

            // Trigger the behavioral metric calculation with the new document length
            onComputeMetrics(currentLength);
        });
        disposables.current.push(changeListener);
    };

    // CLEANUP: Dispose of Monaco listeners when the component unmounts
    useEffect(() => {
        const currentDisposables = disposables.current;

        return () => {
            currentDisposables.forEach(d => d.dispose());
        };
    }, []);

    return (
        <div className="h-full w-full rounded-lg border border-border overflow-hidden bg-card flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
                <span className="text-xs font-mono text-muted-foreground">Solution File</span>
                <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    onMount={handleMount}
                    defaultValue={DEFAULT_CODE[language]}
                    options={{ 
                        automaticLayout: true, 
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false 
                    }}
                />
            </div>
        </div>
    );
}