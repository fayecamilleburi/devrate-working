import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useRef } from "react";
import * as monaco from "monaco-editor";
import { LanguageSwitcher, type Language } from "./LanguageSwitcher";

interface CodeEditorProps {
    onChange: (value: string) => void;
    onKeystroke: (type: "insert" | "delete" | "paste", length: number, lineNumber?: number) => void;
    onEditorReady: (initialLength: number) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

const DEFAULT_CODE: Record<Language, string> = {
    java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello Java\");\n    }\n}",
    python: "def main():\n    print(\"Hello Python\")",
    cpp: "#include <iostream>\nint main() {\n    std::cout << \"Hello C++\";\n    return 0;\n}"
};

export function CodeEditor({ onChange, onKeystroke, onEditorReady, language, onLanguageChange }: CodeEditorProps) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const isPastePending = useRef(false);

    const handleMount: OnMount = (editor) => {
        editorRef.current = editor;
        
        // Push initial code to parent state immediately
        onChange(editor.getValue());
        onEditorReady(editor.getValue().length);

        editor.onDidPaste(() => {
            isPastePending.current = true;
        });

        editor.onDidChangeModelContent((event) => {
            const currentCode = editor.getValue();
            onChange(currentCode); // Push updated code to Landing.tsx

            event.changes.forEach(change => {
                if (change.text.length > 0) {
                    if (isPastePending.current) {
                        onKeystroke("paste", change.text.length, change.range.startLineNumber);
                        isPastePending.current = false;
                    } else {
                        onKeystroke("insert", change.text.length, change.range.startLineNumber);
                    }
                } else if (change.rangeLength > 0) {
                    onKeystroke("delete", change.rangeLength, change.range.startLineNumber);
                }
            });
        });
    };

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
                    options={{ automaticLayout: true, minimap: { enabled: false } }}
                />
            </div>
        </div>
    );
}