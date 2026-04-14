import { useState, useRef} from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { CodeOutput } from '@/components/CodeOutput';
import { MetricsPanel } from '@/components/MetricsPanel';
import { useCodeMetrics } from '@/hooks/useCodeMetrics';
import { Shield } from 'lucide-react'; 
import { type Language } from '@/components/LanguageSwitcher';
import { DetailedReport } from '@/components/DetailedReport';
import { BulkPage } from '@/components/BulkPage';
import { SafetyNet } from '@/components/SafetyNet';
const Landing = () => {

    const [view, setView] = useState<'editor' | 'dashboard'>('editor');

    const { metrics, startSession, stopSession, recordKeystroke, computeMetrics } = useCodeMetrics();
    const [language, setLanguage] = useState<Language>('java');
    const [output, setOutput] = useState("");
    const reportRef = useRef<HTMLDivElement>(null);
    
    // --- API STATES ---
    const [code, setCode] = useState(""); 
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
   
    const scrollToReport = () => { 
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
    
    const handleSafetySwitch = (detectedLang: string) => {
    // 1. Update the language (this triggers the editor's syntax change)
    setLanguage(detectedLang as Language);
    
    // We just flip the mismatch flag to false.
    setAnalysisResult((prev: any) => ({
        ...prev,
        safety_net: {
            ...prev?.safety_net,
            is_mismatch: false
        }
    }));

    // 3. Log the change to the console output
    setOutput((prev) => `${prev}\n[SYSTEM] Syntax mode updated to ${detectedLang.toUpperCase()}. Code preserved.`);
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
                language: language, 
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
    console.log("DEBUG SAFETY NET:", analysisResult?.safety_net);
    return (
    <div className="flex flex-col h-screen bg-background text-foreground">
        {/* Header - Stays visible on both pages */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-[#4682B4]">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-white/10 border border-white/20">
            <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
               
                <h1 className="text-sm font-semibold tracking-tight text-white">DevRate</h1>
                <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">AI Code Detection Tool</p>
            </div>
            </div>

            {/* Navigation Switch */}
            <div className="flex items-center bg-[#f0f8ff] p-1 rounded-lg border border-border">
                <button
                    onClick={() => setView('editor')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        view === 'editor' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'
                    }`}
                >
                    Editor
                </button>
                <button
                    onClick={() => setView('dashboard')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        view === 'dashboard' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'
                    }`}
                >
                    Bulk Tester
                </button>
            </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
            {view === 'editor' ? (
                <>
                    {/* Center: Editor, Output, and Detailed Report */}
                    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto scroll-smooth">
                        {/* Editor Section */}
                        <div className="flex-1 min-h-[400px]">
                            <CodeEditor
                                value={code}
                                onChange={setCode}
                                onKeystroke={recordKeystroke}
                                onComputeMetrics={computeMetrics}
                                onEditorReady={(initialLength) => {
                                    startSession();
                                    computeMetrics(initialLength);
                                }}
                                language={language}
                                onLanguageChange={setLanguage}
                            />
                        </div>
                        
                        {/* SAFETY NET WRAPPER */}
                        <div className="w-full shrink-0"> 
                            <SafetyNet 
                                isMismatch={!!analysisResult?.safety_net?.is_mismatch}
                                warning={analysisResult?.safety_net?.warning}
                                detectedLanguage={analysisResult?.safety_net?.detected_language}
                                onLanguageChange={handleSafetySwitch}
                            />
                        </div>

                        {/* Console Output Section */}
                        <div className="h-48 shrink-0">
                            <CodeOutput output={output} />
                        </div>

       
                        {/* Detailed Forensic Report */}
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
                </>
            ) : (
                <BulkPage />
            )}
        </div>
    </div>
);
}

export default Landing;