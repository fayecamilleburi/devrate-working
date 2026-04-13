import * as monaco from "monaco-editor";

// Ensure 'export' is here!
export const runMonacoAutomatedTest = async (
    editor: monaco.editor.IStandaloneCodeEditor,
    text: string,
    ms: number
) => {
    const characters = text.split("");
    editor.setValue("");

    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const position = editor.getPosition();
        if (!position) break;

        editor.executeEdits("ghost-writer", [
            {
                range: new monaco.Range(
                    position.lineNumber, position.column,
                    position.lineNumber, position.column
                ),
                text: char,
                forceMoveMarkers: true,
            },
        ]);

        editor.setPosition({
            lineNumber: position.lineNumber,
            column: position.column + (char === "\n" ? 0 : 1),
        });

        await new Promise((resolve) => setTimeout(resolve, ms));
    }
};