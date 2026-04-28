import { useState, useRef } from 'react';
import { 
    Upload, 
    FileCode, 
    X, 
    ChevronDown, 
    Play, 
    Loader2, 
    CheckCircle2, 
    Cpu, 
    ShieldAlert, 
    Info,
    BarChart3
} from 'lucide-react';

// --- UI SUB-COMPONENTS ---


const DataCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="bg-background/50 border border-border/50 p-4 rounded-2xl shadow-sm">
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{value}%</p>
    </div>
);

const IndicatorItem = ({ label, score }: { label: string, score: number }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-border/10">
        <span className="text-xs font-semibold text-foreground/80">{label}</span>
        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
            {(score * 100).toFixed(1)}%
        </span>
    </div>
);

// --- CONFIGURATION ---

const FILE_TYPES = {
    java: { label: 'Java', extension: '.java' },
    python: { label: 'Python', extension: '.py' },
    csharp: { label: 'C#', extension: '.cs' },
};

type LanguageKey = keyof typeof FILE_TYPES;
const MAX_FILES = 500;

export const BulkPage = () => {
    const [selectedLang, setSelectedLang] = useState<LanguageKey>('java');
    const [files, setFiles] = useState<File[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [bulkResults, setBulkResults] = useState<any>(null);
    const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
    const [viewType, setViewType] = useState<'detail' | 'batch'>('batch'); // State for toggle
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

   
    // --- DERIVED STATE ---
    // --- DERIVED STATE ---

    // 1. Calculate counts by filtering the results array
    const aiFilesCount = bulkResults?.full_details?.filter(
        (file: any) => file.ai_confidence_score > 0.5
    ).length || 0;

    const humanFilesCount = bulkResults?.full_details ? 
        bulkResults.full_details.length - aiFilesCount : 0;

    // 2. Calculate percentages for the progress bars
    const totalFilesCount = bulkResults?.full_details?.length || 0;
    const batchAiPercent = totalFilesCount > 0 ? (aiFilesCount / totalFilesCount) * 100 : 0;
    const batchHumanPercent = totalFilesCount > 0 ? (humanFilesCount / totalFilesCount) * 100 : 0;

    const activeReport = (selectedFileIndex !== null && bulkResults) 
        ? bulkResults.full_details[selectedFileIndex] 
        : null;

    const aiPercent = activeReport ? Math.round(activeReport.ai_confidence_score * 100) : 0;
    const humanPercent = 100 - aiPercent;
    const isCodeOrganic = aiPercent < 50;

    // Batch-wide stats (Pillar 0) - Pulling directly from Backend Summary
    const totalFiles = bulkResults?.summary?.total_files_processed || files.length;
    // --- LOGIC ---

    const handleFiles = (incomingFiles: File[]) => {
        const ext = FILE_TYPES[selectedLang].extension;
        const validExtFiles = incomingFiles.filter(file => file.name.endsWith(ext));
        
        if (validExtFiles.length < incomingFiles.length) {
            alert(`Only ${FILE_TYPES[selectedLang].label} files are allowed!`);
        }
        
        const availableSlots = MAX_FILES - files.length;
        if (availableSlots <= 0) return;

        const filesToAdd = validExtFiles.slice(0, availableSlots);
        setFiles(prev => [...prev, ...filesToAdd]);
        setBulkResults(null); // Clear results if new files added
        setSelectedFileIndex(null);
    };

    const handleRunAnalysis = async () => {
        if (files.length === 0) return;
        setIsAnalyzing(true);
        setBulkResults(null);

        try {
            const fileDataPromises = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve({
                        filename: file.name,
                        code: e.target?.result as string,
                        language: selectedLang,
                        telemetry: null
                    });
                    reader.readAsText(file);
                });
            });

            const formattedFiles = await Promise.all(fileDataPromises);

             // REPLACE THIS URL with your HF Direct URL + /analyze
            const HF_API_URL = "https://devrate-devratev1.hf.space/analyze/bulk";
   

            const response = await fetch(HF_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ files: formattedFiles }),
            });

            if (!response.ok) throw new Error("Backend error");

            const data = await response.json();
            setBulkResults(data);
            setSelectedFileIndex(0); // Auto-focus first file

            setViewType('batch'); // Default to batch view once results arrive
        } catch (error) {
            console.error("Analysis Error:", error);
            alert("Connection to API failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#F0F8FF]">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bulk AI Probability Analysis</h2>
                    <p className="text-sm text-muted-foreground">Batch process up to {MAX_FILES} maximum source files.</p>
                </div>
                <div className="text-right">
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded border transition-colors ${
                        files.length >= MAX_FILES ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-primary/10 border-primary/30 text-primary'
                    }`}>
                        {files.length} / {MAX_FILES} FILES
                    </span>
                    <div className="w-32 h-1.5 bg-muted rounded-full mt-2 overflow-hidden border border-border">
                        <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${(files.length / MAX_FILES) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Config & Analysis Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/50 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1.5 bg-[#F0F8FF]">
                        <label className="text-[10px] uppercase font-black text-muted-foreground bg-[#F0F8FF] ml-1 tracking-widest">Language</label>
                        <div className="relative inline-block">
                            <select 
                                disabled={isAnalyzing || files.length > 0} 
                                value={selectedLang}
                                onChange={(e) => setSelectedLang(e.target.value as LanguageKey)}
                                className="appearance-none bg-background border border-border rounded-md pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 transition-all"
                            >
                                {Object.entries(FILE_TYPES).map(([key, info]) => (
                                    <option key={key} value={key}>{info.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground bg-[#0] pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-black text-muted-foreground bg-[#F0F8FF] ml-1 tracking-widest">Actions</label>
                        <button
                            onClick={handleRunAnalysis}
                            disabled={files.length === 0 || isAnalyzing}
                            className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold transition-all bg-[#87ceeb] shadow-md ${
                                files.length === 0 ? "bg-muted text-muted-foreground border border-border cursor-not-allowed" : "bg-primary text-primary-foreground hover:brightness-110 active:scale-95"
                            }`}
                        >
                            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className={`h-4 w-4 ${files.length > 0 ? 'fill-current' : ''}`} />}
                            {isAnalyzing ? "Processing..." : "Start Analysis"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <label className="text-[10px] uppercase font-black text-muted-foreground mr-1 tracking-widest">Status</label>
                    {bulkResults ? (
                        <div className="flex items-center gap-2 text-green-500 font-bold text-xs bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Report Ready
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground font-medium px-3 py-1.5 bg-muted/30 rounded-lg italic">
                            {files.length > 0 ? "Ready to compute" : "Awaiting files..."}
                        </div>
                    )}
                </div>
            </div>

            {/* Dropzone */}
            <div
                onDragOver={(e) => { e.preventDefault(); if (files.length < MAX_FILES) setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files)); }}
                onClick={() => !isAnalyzing && files.length < MAX_FILES && fileInputRef.current?.click()}
                className={`
                    relative group border-2 border-dashed rounded-[2rem] p-12 transition-all flex flex-col items-center justify-center bg-[#be2ff] gap-4
                    ${files.length >= MAX_FILES || isAnalyzing ? "opacity-40 cursor-not-allowed border-muted" : "cursor-pointer"}
                    ${isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:bg-muted/20"}
                `}
            >
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} accept={FILE_TYPES[selectedLang].extension} multiple className="hidden" />
                <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                    <Upload className="h-8 w-8" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold tracking-tight">
                        {isAnalyzing ? "Locking Files for Analysis..." : files.length >= MAX_FILES ? "Batch Capacity Reached" : `Upload ${FILE_TYPES[selectedLang].label} Source`}
                    </p>
                    <p className="text-sm text-muted-foreground">Select up to {MAX_FILES} maximum files for structural verification</p>
                </div>
            </div>

                
            
            {bulkResults && (
            <section className="p-8 border border-border/50 rounded-[2.5rem] bg-card/30 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 border-l-4 border-muted-foreground/30 pl-4">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">Results for Analysis of {totalFiles} Files</h3>
                       
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    

                    {/* DATA CARDS */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-background/50 border border-border/50 p-4 rounded-2xl shadow-sm">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">AI-Generated Files</p>
                                <p className="text-2xl font-black text-red-500">{aiFilesCount}</p>
                                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${batchAiPercent}%` }} />
                                </div>
                            </div>
                            
                            <div className="bg-background/50 border border-border/50 p-4 rounded-2xl shadow-sm">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Human-Authored Files</p>
                                <p className="text-2xl font-black text-green-500">{humanFilesCount}</p>
                                <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${batchHumanPercent}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                                <Info className="h-4 w-4 shrink-0 text-primary" />
                                <span>
                                    Devrate Model verified <strong>{humanFilesCount}</strong> files as human and flagged <strong>{aiFilesCount}</strong> as synthetic.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        )}        

        {/* Queue List */}
            {files.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Uploaded Files</h3>
                        {!isAnalyzing && <button onClick={() => {setFiles([]); setBulkResults(null);}} className="text-[10px] font-black uppercase text-destructive hover:underline">Delete Files</button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {files.map((file, idx) => {
                            const res = bulkResults?.full_details[idx];
                            const isAI = res && res.ai_confidence_score > 0.5;
                            const isSelected = selectedFileIndex === idx;

                            return (
                                <div 
                                    key={idx}
                                    onClick={() => bulkResults && setSelectedFileIndex(idx)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-xl border transition-all 
                                        ${bulkResults ? 'cursor-pointer' : 'cursor-default'}
                                        ${isSelected ? 'ring-2 ring-primary border-transparent translate-x-1' : 'border-border bg-card/30 hover:bg-card/80'}
                                        ${isAI ? 'bg-red-500/5' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <FileCode className={`h-4 w-4 shrink-0 ${isAI ? 'text-red-500' : 'text-primary'}`} />
                                        <span className="text-xs font-bold truncate">{file.name}</span>
                                        {res && (
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase shrink-0 ${isAI ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                                {isAI ? 'AI' : 'Human'}
                                            </span>
                                        )}
                                    </div>
                                    {!isAnalyzing && !bulkResults && (
                                        <button onClick={(e) => { e.stopPropagation(); setFiles(f => f.filter((_, i) => i !== idx)); }}>
                                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Individual Report */}
            {bulkResults && (
                <>
                    {/* VIEW TOGGLE CONTROLLER */}
                    <div className="flex justify-between items-end mb-4">
                        <div className="px-2">
                             <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Analysis Report</h3>
                        </div>
                        <div className="inline-flex p-1 bg-secondary/20 border border-border/50 rounded-2xl backdrop-blur-sm">
                            <button
                                onClick={() => setViewType('batch')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewType === 'batch' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <BarChart3 className="h-4 w-4" />
                                Batch View
                            </button>
                            <button
                                onClick={() => setViewType('detail')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewType === 'detail' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <Cpu className="h-4 w-4" />
                                Individual View
                            </button>
                        </div>
                    </div>

                    {/* VIEW TYPE: BATCH/DISTRIBUTION */}
                    {viewType === 'batch' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            
                            <section className="p-8 border border-border/50 rounded-[2.5rem] bg-card/30 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                                        <FileCode className="h-6 w-6 text-primary" />
                                        <div>
                                            <h3 className="text-xl font-bold tracking-tight">Project-Wide Distribution</h3>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Aggregate Results for {totalFiles} Files</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter">
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm" /> AI</div>
                                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm" /> Human</div>
                                    </div>
                                </div>

                                {/* SCROLLABLE BAR CONTAINER */}
                                <div className="relative bg-background/40 rounded-[2rem] border border-border/50 p-8 shadow-inner">
                                    <div className="flex items-end justify-start gap-4 h-80 overflow-x-auto pb-8 custom-scrollbar">
                                        {bulkResults.full_details.map((res: any, idx: number) => {
                                            const aiVal = Math.round(res.ai_confidence_score * 100);
                                            const humanVal = 100 - aiVal;
                                            const isSelected = selectedFileIndex === idx;

                                            return (
                                                <div 
                                                    key={idx}
                                                    onClick={() => setSelectedFileIndex(idx)}
                                                    className={`flex flex-col items-center gap-3 min-w-[60px] cursor-pointer group transition-all ${isSelected ? 'scale-105' : 'hover:scale-102'}`}
                                                >
                                                    <div className={`flex flex-col-reverse w-12 h-64 rounded-xl overflow-hidden border transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-xl' : 'border-border/20 shadow-lg'}`}>
                                                        <div className="bg-red-500 transition-all duration-1000 ease-out relative" style={{ height: `${aiVal}%` }}>
                                                            {aiVal > 500 && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white rotate-90">{aiVal}%</span>}
                                                        </div>
                                                        <div className="bg-green-500 transition-all duration-1000 ease-out relative" style={{ height: `${humanVal}%` }}>
                                                            {humanVal > 500 && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white rotate-90">{humanVal}%</span>}
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-bold truncate max-w-[80px] ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{res.filename}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* VIEW TYPE: DETAILED FORENSIC */}
                    {viewType === 'detail' && activeReport && (
                        <section className={`p-8 border rounded-[2.5rem] space-y-8 animate-in fade-in zoom-in-95 duration-500 ${isCodeOrganic ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                            <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                                <Cpu className="h-6 w-6 text-primary" />
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">Individual File AI Analysis</h3>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase">Viewing File: {activeReport.filename}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                                <div className="relative h-60 w-60 mx-auto lg:mx-0">
                                    <div className="h-full w-full rounded-full flex items-center justify-center shadow-xl transition-all duration-1000"
                                        style={{ background: `conic-gradient(#ef4444 0% ${aiPercent}%, #22c55e ${aiPercent}% 100%)` }}>
                                        <div className="h-44 w-44 bg-card rounded-full flex flex-col items-center justify-center border border-border/50">
                                            <span className="text-4xl font-black tracking-tighter">{aiPercent}%</span>
                                            <span className="text-[9px] font-black opacity-50 uppercase tracking-widest mt-1 text-red-500">AI Probability</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <DataCard label="AI Probability" value={aiPercent} color="text-red-500" />
                                        <DataCard label="Human Factor" value={humanPercent} color="text-green-500" />
                                    </div>
                                    <div className="p-6 bg-secondary/10 rounded-2xl border border-border/50">
                                        <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest flex items-center gap-2"><ShieldAlert className="h-3 w-3" /> Technical Evidence Log</h4>
                                        <div className="space-y-3">
                                            {activeReport.analysis_details?.top_indicators?.length > 0 ? (
                                                activeReport.analysis_details.top_indicators.map((item: any, i: number) => (
                                                    <IndicatorItem key={i} label={item.token} score={item.score} />
                                                ))
                                            ) : (
                                                <p className="text-xs italic text-muted-foreground">No specific indicators found for this sequencing.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}

        </div>
    );
};