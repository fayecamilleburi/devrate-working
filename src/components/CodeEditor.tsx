import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useCallback, useRef } from "react";
import * as monaco from "monaco-editor";
import { LanguageSwitcher, type Language } from "./LanguageSwitcher";

interface CodeEditorProps {
    onKeystroke: (type: "insert" | "delete" | "paste", length: number, lineNumber?: number) => void;
    onEditorReady: (initialLength: number) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

const DEFAULT_CODE: Record<Language, string> = {
java: `// Start coding here...
// Your typing behavior is being analyzed in real-time.

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java.");}
}
`,
python: `# Start coding here...
# Your typing behavior is being analyzed in real-time.

def main():
print("Hello from Python.")
`,
cpp: `// Start coding here...
// Your typing behavior is being analyzed in real-time.

#include <iostream>
int main() {
    std::cout << "Hello from C++." << std::endl;
    return 0;
}
`,
};

const MONACO_LANG: Record<Language, string> = {
    java: "java",
    python: "python",
    cpp: "cpp",
};

const FILE_NAMES: Record<Language, string> = {
    java: "Solution.java",
    python: "solution.py",
    cpp: "solution.cpp",
};

export function CodeEditor({ onKeystroke, onEditorReady, language, onLanguageChange}: CodeEditorProps) {
    // Ref to store the editor instance for later use if needed (Strongly typed ref instead of `any`)
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleMount: OnMount = useCallback((editor) => {
        editorRef.current = editor;
        onEditorReady(DEFAULT_CODE[language].length);

        // Listen to content changes in the editor (Strongly typed event)
        editor.onDidChangeModelContent((event: monaco.editor.IModelContentChangedEvent) => {
            const changes = event.changes;
            for (const change of changes) {
                const insertedLen = change.text.length;
                const deletedLen = change.rangeLength;
                const line = change.range.startLineNumber;

                if (deletedLen > 0) {
                    onKeystroke("delete", deletedLen, line);
                }

                if (insertedLen > 0) {
                    if (insertedLen > 5 || change.text.includes("\n")) {
                        onKeystroke("paste", insertedLen, line);
                    } else {
                        onKeystroke("insert", insertedLen, line);
                    }
                }
            }
        });
    }, [onKeystroke, onEditorReady, language]);

    return (
        <div className="h-full w-full rounded-lg border border-border overflow-hidden bg-card flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-destructive/60"/>
                        <div className="h-3 w-3 rounded-full bg-warning/60"/>
                        <div className="h-3 w-3 rounded-full bg-accent/60" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{FILE_NAMES[language]}</span>
                </div>
                <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={MONACO_LANG[language]}
                    defaultValue={DEFAULT_CODE[language]}
                    value={DEFAULT_CODE[language]}
                    key={language}
                    theme="vs-dark"
                    onMount={handleMount}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        bracketPairColorization: { enabled: true }, 
                    }}
                />
            </div>
        </div>
    );
}