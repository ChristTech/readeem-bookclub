import React, { useState } from 'react';
import { ReadingPlan } from '../types';
import { generateTTS } from '../services/geminiService';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReaderViewProps {
    plan: ReadingPlan;
    onClose: (lastPosition: number) => void;
    onComplete: (planId: string) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({ plan, onClose, onComplete }) => {
    // PDF State
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(plan.currentPage || 1); // Start at last read page
    const [scale, setScale] = useState<number>(1.2);

    // Text Mode State
    const [chapterIndex, setChapterIndex] = useState(
        plan.chapters ? Math.min(plan.currentChapter, plan.chapters.length - 1) : 0
    );

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // PDF Mode
    if (plan.pdfUrl) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#1a1a1a] animate-fadeIn flex flex-col h-screen">
                {/* Header Toolbar */}
                <div className="flex justify-between items-center p-4 bg-[#111] border-b border-white/10 shadow-xl z-[110]">
                    <div className="flex items-center gap-6">
                        <h2 className="text-white font-black uppercase tracking-tight truncate max-w-[200px] hidden sm:block">{plan.title}</h2>
                        <div className="flex items-center gap-2 bg-[#222] rounded-lg p-1">
                            <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            </button>
                            <span className="text-xs font-bold text-gray-300 w-12 text-center">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(2.0, s + 0.2))} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-[#222] rounded-full px-4 py-2">
                            <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="text-gray-400 hover:text-[#C41230] disabled:opacity-30 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-sm font-black text-white tracking-widest">
                                {pageNumber} <span className="text-gray-500 text-xs">/ {numPages || '--'}</span>
                            </span>
                            <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="text-gray-400 hover:text-[#C41230] disabled:opacity-30 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        <button onClick={() => { onComplete(plan.id); onClose(pageNumber); }} className="flex bg-[#C41230] text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all items-center gap-2">
                            <span className="hidden sm:inline">Done Reading</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => onClose(pageNumber)} className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-grow overflow-auto bg-[#1a1a1a] flex justify-center p-8">
                    <div className="shadow-2xl" key={pageNumber}>
                        <Document
                            file={plan.pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<div className="text-white font-black animate-pulse">Loading Document...</div>}
                            error={<div className="text-[#C41230] font-bold">Failed to load PDF.</div>}
                        >
                            <div className="animate-page-flip">
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                    className="border border-white/10"
                                />
                            </div>
                        </Document>
                    </div>
                </div>
            </div>
        );
    }

    const currentChapter = plan.chapters?.[chapterIndex];
    const chapterTitle = currentChapter?.title || `Chapter ${chapterIndex + 1}`;
    const content = currentChapter?.content || "Content coming soon...";
    const isLastChapter = plan.chapters ? chapterIndex === plan.chapters.length - 1 : true;

    // Normal Text Reader Render
    return (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-[40px] overflow-y-auto animate-fadeIn p-6 sm:p-24">
            <div className="max-w-4xl mx-auto relative content-container">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose(chapterIndex);
                    }}
                    className="fixed top-24 right-4 sm:top-12 sm:right-12 w-12 h-12 sm:w-16 sm:h-16 glass-card rounded-full flex items-center justify-center text-black hover:bg-[#C41230] hover:text-white transition-all shadow-2xl z-[110]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-16">
                    <h1 className="text-5xl sm:text-7xl font-black text-black uppercase tracking-tighter mb-4 leading-tight">{plan.title}</h1>
                    <p className="text-[#C41230] font-black uppercase tracking-[0.4em] text-xs py-3 px-8 glass-dark rounded-full inline-block">
                        {chapterTitle}
                    </p>
                </div>

                <div className="prose prose-lg sm:prose-2xl mx-auto text-gray-800 font-medium leading-[1.8] space-y-12 mb-24">
                    {content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 z-[100]">
                    <button
                        onClick={() => generateTTS(content.substring(0, 200))}
                        className="px-8 py-4 glass-card rounded-xl text-black font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs hover:bg-black hover:text-white transition-all w-full sm:w-48"
                    >
                        Audio Read-Along
                    </button>
                    <button
                        onClick={() => {
                            if (plan.chapters && chapterIndex < plan.chapters.length - 1) {
                                setChapterIndex(prev => prev + 1);
                            } else {
                                onComplete(plan.id);
                            }
                        }}
                        className="px-8 py-4 bg-[#C41230] text-white rounded-xl font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs hover:bg-black transition-all shadow-xl w-full sm:w-48"
                    >
                        {isLastChapter ? "Complete Reading" : "Next Chapter"}
                    </button>
                </div>
            </div>
        </div>
    );
};
