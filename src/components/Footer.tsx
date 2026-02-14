import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="py-32 border-t-[12px] border-black bg-white">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <div className="relative inline-block mb-16">
                    <div className="w-16 h-24 bg-[#FCE7D1] ribbon-shape absolute -top-4 left-1/2 -translate-x-1/2 opacity-30 shadow-2xl"></div>
                    <p className="relative z-10 text-6xl font-black tracking-tighter text-black uppercase">Readeem<span className="text-[#C41230]">.</span></p>
                </div>
                <p className="text-gray-800 font-black text-sm tracking-[0.6em] uppercase mb-20 italic">A subset of disciples in line</p>
                <div className="flex flex-wrap justify-center gap-10 text-gray-400 font-black text-[10px] uppercase tracking-widest mb-12">
                    <a href="#" className="hover:text-[#C41230] transition-colors">Vision</a>
                    <a href="#" className="hover:text-[#C41230] transition-colors">Leadership</a>
                    <a href="#" className="hover:text-[#C41230] transition-colors">Sanctuary</a>
                    <a href="#" className="hover:text-[#C41230] transition-colors">Mentorship</a>
                </div>
                <p className="text-gray-300 text-[11px] font-black uppercase tracking-[0.8em]">© 2026 READEEM. BUILDING LEADERS EARLY.</p>
                <p className="text-black text-[10px] font-black uppercase tracking-[0.2em] mt-6">Developed by CHRISTTech <span className="text-[#C41230] mx-2">•</span> adebisivictor39@gmail.com</p>
            </div>
        </footer>
    );
};
