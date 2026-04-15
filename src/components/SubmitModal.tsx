import { X, CheckCircle2, Fingerprint } from 'lucide-react';

interface SubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function SubmitModal({ isOpen, onClose, onConfirm }: SubmitModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-300">
            {/* Main Modal Container: Light Theme */}
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header Section */}
                <div className="relative p-8 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-2xl border border-blue-100 bg-blue-50">
                            <Fingerprint className="text-[#4893C6]" size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5">
                                Action Required
                            </p>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                                Confirm Analysis
                            </h3>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-8 right-8 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Section */}
                <div className="px-8 pb-8 space-y-6">
                    {/* Glass-morphism effect for the quote section */}
                    <div className="p-6 bg-[#F8FBFE] border border-[#E2EFF6] rounded-3xl">
                        <p className="text-xs leading-relaxed font-medium text-slate-600 italic text-center">
                            This process analyzes structural DNA and behavioral patterns to confirm the authenticity of the submitted code.
                        </p>
                    </div>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                        Continue with verification?
                    </p>

                    {/* Action Buttons: Pill shaped & Light-aligned */}
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-full transition-all hover:bg-slate-100"
                        >
                            Abort
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 text-[11px] font-black uppercase tracking-widest text-white bg-[#4893C6] hover:brightness-105 rounded-full transition-all shadow-lg shadow-blue-500/20"
                        >
                            <CheckCircle2 size={16} />
                            Execute Scan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}