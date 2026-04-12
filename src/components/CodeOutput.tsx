import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

interface CodeOutputProps {
    output: string;
}

export function CodeOutput({ output }: CodeOutputProps) {
    return (
        <div className="h-full flex flex-col rounded-lg border border-border bg-[#F0F8FF] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/50">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">Output</span>
            </div>
            <ScrollArea className="flex-1 p-4">
                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                    {output || <span className="text-muted-foreground italic">Run your code to see output here...</span>}
                </pre>
            </ScrollArea>
        </div>
    );
}