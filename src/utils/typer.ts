import * as monaco from "monaco-editor";

export const runMonacoAutomatedTest = async (
    editor: monaco.editor.IStandaloneCodeEditor,
    text: string,
    ms: number
) => {
    const characters = text.split("");
    editor.setValue("");
    editor.focus();

    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const position = editor.getPosition();
        if (!position) break;

        // 1. Apply the edit
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

        // 2. SMART CURSOR MOVEMENT
        if (char === "\n") {
            // If it's a newline, go to the start of the next line
            editor.setPosition({
                lineNumber: position.lineNumber + 1,
                column: 1,
            });
        } else {
            // Otherwise, just move one column to the right
            editor.setPosition({
                lineNumber: position.lineNumber,
                column: position.column + 1,
            });
        }

        // 3. Keep the cursor visible (auto-scroll)
        editor.revealPosition(editor.getPosition()!);

        await new Promise((resolve) => setTimeout(resolve, ms));
    }
};