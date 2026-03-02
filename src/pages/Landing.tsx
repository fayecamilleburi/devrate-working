import { useState } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { CodeOutput } from '@/components/CodeOutput';
import { MetricsPanel } from '@/components/MetricsPanel';
import { useCodeMetrics } from '@/hooks/useCodeMetrics';
import { Shield, Activity } from 'lucide-react';
import { type Language } from '@/components/LanguageSwitcher';

const Landing = () => {
    const { metrics, startSession, recordKeystroke, recordPaste, recordFocusLoss, recordCompile} = useCodeMetrics();
    const [language, setLanguage] = useState<Language>('java');
    const [output, setOutput] = useState("");
    const [showMetrics] = useState(true);

    const handleCompile = () => {
        recordCompile();
        setOutput(`[${new Date().toLocaleTimeString()}] Code execution simulated. \n> Program compiled successfully.\n> Output:\nHello, World!`);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 border border-primary/30">
                        <Shield className="h-4 w-4 text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-foreground tracking-tight">DevRate</h1>
                        <p className="text-xs text-muted-foreground">AI Code Detection Tool</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Activity className="h-3 w-3 text-primary animate=pulse-glow" />
                        <span className="text-xs font-mono text-primary">Monitoring</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Editor + Output */}
                <div className="flex-1 flex flex-col p-4 gap-4">
                    <div className="flex-1 min-h-0">
                        <CodeEditor 
                            onKeystroke={recordKeystroke}
                            onPaste={recordPaste}
                            onFocusLoss={recordFocusLoss}
                            onEditorReady={startSession}
                            language={language}
                            onLanguageChange={setLanguage}
                        />
                    </div>
                    <div className="h-45 shrink-0">
                        <CodeOutput output={output} />
                    </div>
                </div>

                {/* Metrics Panel */}
                {showMetrics &&
                    <div className="w-95 border-l border-order p-4 overflow-hidden">
                        <MetricsPanel metrics={metrics} onCompile={handleCompile} />
                    </div>
                }
            </div>
        </div>
    )
}

export default Landing;