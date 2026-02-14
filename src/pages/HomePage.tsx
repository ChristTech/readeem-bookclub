import React from 'react';
import { Link } from 'react-router-dom';
import { SCRIPTURE_OF_THE_DAY } from '../constants';

export const HomePage: React.FC = () => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <section className="relative pt-24 pb-16 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
                    <div className="relative mb-8">
                        <div className="w-24 h-32 bg-[#FCE7D1] ribbon-shape absolute -top-4 left-1/2 -translate-x-1/2 opacity-50"></div>
                        <h1 className="relative z-10 text-7xl md:text-9xl font-black text-[#C41230] tracking-tighter">
                            Readeem<span className="text-black">.</span>
                        </h1>
                        <p className="text-sm font-bold text-gray-800 tracking-wide mt-2 uppercase tracking-[0.2em]">Buying More Years by Studying</p>
                    </div>

                    <div className="max-w-3xl mt-12 glass-card p-12 rounded-brand shadow-2xl relative">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-4xl font-black text-[#C41230] uppercase tracking-tighter">The Vision</h2>
                            <div className="w-12 h-16 bg-[#C41230] ribbon-shape flex items-center justify-center shadow-lg">
                                <span className="text-white font-black text-xl italic">R</span>
                            </div>
                        </div>
                        <p className="text-left text-xl leading-relaxed text-gray-700 font-medium mb-10">
                            Pronounced as <span className="text-[#C41230] font-bold">(ri-dēm)</span>, Readeem is an online reading community of <span className="font-bold">Disciples in Line</span>, created to nurture a strong culture of study among young people.
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <Link to="/join" className="bg-[#C41230] text-white px-10 py-5 rounded-2xl font-black tracking-widest hover:bg-black transition-all shadow-xl uppercase text-sm transform hover:-translate-y-1 block md:inline-block">Join the Club</Link>
                            <Link to="/readings" className="glass-dark text-white px-10 py-5 rounded-2xl font-black tracking-widest hover:bg-[#C41230] transition-all shadow-xl uppercase text-sm transform hover:-translate-y-1 block md:inline-block">Start Reading</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scripture of the Day Ribbon */}
            <div className="max-w-4xl mx-auto px-6 mb-24">
                <div className="glass-dark p-10 rounded-brand border-l-[12px] border-l-[#C41230] text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 0L129.389 70.6107H200L142.705 118.779L164.886 191.389L100 148.855L35.1141 191.389L57.2949 118.779L0 70.6107H70.6107L100 0Z" fill="white" />
                        </svg>
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-white italic leading-tight mb-4">"{SCRIPTURE_OF_THE_DAY.text}"</p>
                    <p className="text-xs font-black text-[#C41230] uppercase tracking-[0.4em]">{SCRIPTURE_OF_THE_DAY.reference}</p>
                </div>
            </div>

            {/* Vision & Mandate Section with Speech Bubbles */}
            <section className="py-24 max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="rounded-brand overflow-hidden shadow-2xl border-8 border-white h-[600px] relative">
                            <img src="./founder.webp" className="w-full h-full object-cover" alt="Pastor David Owolabi" />

                            {/* Speech Bubbles */}
                            <div className="absolute top-20 right-[-30px] speech-bubble animate-bounce-slow">
                                <p className="text-[#C41230] font-black text-xl leading-none">Building<br /><span className="text-black">Leaders</span></p>
                            </div>
                            <div className="absolute bottom-32 left-[-20px] speech-bubble left-tail">
                                <p className="text-[#C41230] font-black text-xl leading-none">Building<br /><span className="text-black">The Mind</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-28 bg-[#C41230] ribbon-shape flex items-center justify-center shadow-xl">
                                <span className="text-white font-black text-3xl">R</span>
                            </div>
                            <h2 className="text-5xl font-black text-black uppercase tracking-tighter leading-tight">Founder's <br /><span className="text-[#C41230]">Mandate</span></h2>
                        </div>
                        <p className="text-xl font-medium text-gray-700 leading-relaxed glass-card p-10 rounded-3xl border-l-[8px] border-l-[#C41230]">
                            "To buy more years by studying is to inherit the wisdom of centuries in a in a shorter time period than it was documented. We are building the mind of Christ in a generation of leaders."
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="text-[#C41230] font-black text-lg mb-2">Cultivate</h4>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">A Vibrant Reading Culture</p>
                            </div>
                            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="text-[#C41230] font-black text-lg mb-2">Inherit</h4>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wisdom of Centuries</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
