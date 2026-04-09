import { useState, useRef} from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { CodeOutput } from '@/components/CodeOutput';
import { MetricsPanel } from '@/components/MetricsPanel';
import { useCodeMetrics } from '@/hooks/useCodeMetrics';
import { Shield } from 'lucide-react'; 
import { type Language } from '@/components/LanguageSwitcher';
import { DetailedReport } from '@/components/DetailedReport';


const Landing = () => {
    const { metrics, startSession, stopSession, recordKeystroke } = useCodeMetrics();
    const [language, setLanguage] = useState<Language>('java');
    const [output, setOutput] = useState("");
    const reportRef = useRef<HTMLDivElement>(null);
    
    // --- API STATES ---
    const [code, setCode] = useState(""); 
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
   
    const scrollToReport = () => { // <--- Add this
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCompile = async () => {
        setOutput(`[${new Date().toLocaleTimeString()}] Running ${language} code...`);
        
        try {
            const response = await fetch("http://127.0.0.1:8000/run-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    code: code,
                    language: language 
                }),
            });

            const data = await response.json();

            if (data.error) {
                setOutput(`[ERROR]\n${data.error}`);
            } else {
                setOutput(`[OUTPUT]\n${data.output}`);
            }
        } catch (error) {
            console.error("Compile Error:", error);
            setOutput(`[SYSTEM ERROR] Failed to connect to the execution engine.`);
        }
    };

    const handleFinalSubmit = async () => {
        stopSession();
        setIsAnalyzing(true);
        try {
        const response = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: code,
                language: language, // <--- THIS WAS MISSING
                telemetry: metrics
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            // This helps you see EXACTLY which field failed validation
            console.error("Validation Error:", data.detail);
            return;
        }

        setAnalysisResult(data);
        setOutput(`[${new Date().toLocaleTimeString()}] Analysis Complete: ${data.verdict}`);
    } catch (error) {
        console.error("Connection Error:", error);
    } finally {
        setIsAnalyzing(false);
    }
};

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 border border-primary/30">
                        <Shield className="h-4 w-4 text-primary"/>
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight">DevRate</h1>
                        <p className="text-xs text-muted-foreground">AI Code Detection Tool</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Center: Editor, Output, and Detailed Report */}
                {/* Added scroll-smooth for the "Show More" animation */}
                <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto scroll-smooth">
                    
                    {/* Editor Section */}
                    <div className="flex-1 min-h-100">
                        <CodeEditor 
                            onChange={setCode}
                            onKeystroke={recordKeystroke}
                            onEditorReady={startSession}
                            language={language}
                            onLanguageChange={setLanguage}
                        />
                    </div>

                    {/* Console Output Section */}
                    <div className="h-48 shrink-0">
                        <CodeOutput output={output} />
                    </div>

                    {/* Detailed Forensic Report (Appears after analysis) */}
                    {analysisResult && (
                        <div ref={reportRef} className="pb-10">
                            <DetailedReport 
                                metrics={metrics} 
                                results={analysisResult} 
                            />
                        </div>
                    )}
                </div>

                {/* Right: Monitoring & Submission Sidebar */}
                <div className="w-96 border-l border-border p-4 bg-card/30 overflow-y-auto flex flex-col gap-6 h-full">
                    <MetricsPanel 
                        isAnalyzing={isAnalyzing}
                        onSubmit={handleFinalSubmit}
                        onCompile={handleCompile}
                        results={analysisResult}
                        metrics={metrics}
                        onShowMore={scrollToReport} 
                    />
                </div>
            </div>
        </div>
    );
}

export default Landing;