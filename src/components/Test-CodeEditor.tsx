import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";
import { LanguageSwitcher, type Language } from "./LanguageSwitcher";
import { runMonacoAutomatedTest } from "../utils/typer";

interface CodeEditorProps {
    onChange: (value: string) => void;
    onKeystroke: (type: "insert" | "delete" | "paste", length: number, lineNumber?: number) => void;
    onEditorReady: (initialLength: number) => void;
    onComputeMetrics: (currentLength: number) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

// These will now appear as ghost text rather than actual document content
const placeholder: Record<Language, string> = {
    java: "// Write your Java class here...",
    python: "# Write your Python code here...",
    cpp: "// Write your C++ code here..."
};

export function CodeEditor({ onChange, onKeystroke, onEditorReady, onComputeMetrics, language, onLanguageChange }: CodeEditorProps) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    
    const hasAutoStarted = useRef(false);
    const startAutomatedTest = async (speed: number) => {
        if (editorRef.current) {
            const testCode = "public class Test {\n    public void hello() {\n        System.out.println(\"Verified\");\n    }\n}";
            
            await runMonacoAutomatedTest(editorRef.current, testCode, speed);
            
            setTimeout(() => {
                const submitBtn = document.getElementById('submit-button') as HTMLButtonElement;
                if (submitBtn) {
                    submitBtn.click();
                }
            }, 500); 
        }
    };
    useEffect(() => {
        // We check every 100ms if the editor is ready
        const checkEditorReady = setInterval(() => {
            if (editorRef.current && !hasAutoStarted.current) {
                hasAutoStarted.current = true; // Mark as started
                clearInterval(checkEditorReady); // Stop checking
                
                console.log("Editor ready, starting initial automated test...");
                startAutomatedTest(200); // Start with 'Human' speed on load
            }
        }, 100);

        return () => clearInterval(checkEditorReady);
    }, []);
    const isPastePending = useRef(false);
    const disposables = useRef<monaco.IDisposable[]>([]);

    const handleMount: OnMount = (editor) => {
        editorRef.current = editor;
        
        // telemetry starts at 0 because defaultValue is now ""
        const initialValue = editor.getValue();
        onChange(initialValue);
        onEditorReady(initialValue.length);

        // 1. KEYDOWN INTERCEPT
        const keyDownListener = editor.onKeyDown((e) => {
            const isPasteCommand = (e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV;
            if (isPasteCommand) {
                isPastePending.current = true;
                setTimeout(() => {
                    isPastePending.current = false;
                }, 100);
            }
        });
        disposables.current.push(keyDownListener);

        // 2. OFFICIAL PASTE LISTENER
        const pasteListener = editor.onDidPaste(() => {
            isPastePending.current = true;
            setTimeout(() => {
                isPastePending.current = false;
            }, 50);
        });
        disposables.current.push(pasteListener);

        // 3. CHANGE TRACKING
        const changeListener = editor.onDidChangeModelContent((event) => {
            const currentCode = editor.getValue();
            const currentLength = currentCode.length;
            
            onChange(currentCode);
            
            if (event.isUndoing || event.isRedoing) return; 
            
            event.changes.forEach((change) => {
                const isAddition = change.text.length > 0;
                const isDeletion = change.rangeLength > 0;

                if (isAddition) {
                    const type = isPastePending.current ? "paste" : "insert";
                    onKeystroke(type, change.text.length, change.range.startLineNumber);
                } 
                
                if (isDeletion) {
                    onKeystroke("delete", change.rangeLength, change.range.startLineNumber);
                }
            });

            onComputeMetrics(currentLength);
        });
        disposables.current.push(changeListener);
    };

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
                    // IMPORTANT: Set this to empty to avoid skewing telemetry
                    defaultValue="" 
                    options={{ 
                        automaticLayout: true, 
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        // This applies the ghost text
                        placeholder: placeholder[language] 
                    }}
                />
            </div>
        </div>
    );
}