import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
// import { WEEKLY_LEADERBOARD, MONTHLY_LEADERBOARD } from '../constants'; // Deprecated

export const LeaderboardPage: React.FC = () => {
    const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [previousWinner, setPreviousWinner] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // 1. Fetch Current Leaderboard
                const rpcName = view === 'weekly' ? 'get_weekly_leaderboard' : 'get_monthly_leaderboard';
                const { data, error } = await supabase.rpc(rpcName);

                if (error) {
                    console.error('Leaderboard RPC Error:', error);
                    setLeaderboard([]);
                } else if (data) {
                    setLeaderboard(data.map((p: any) => ({
                        rank: p.rank,
                        name: p.username || 'Anonymous Disciple',
                        avatar: p.avatar_url,
                        xp: p.total_xp,
                        score: p.total_xp
                    })));
                }

                // 2. Fetch Previous Month's Winner (Only once or if view is monthly?) 
                // Let's show it always at the top as requested
                if (!previousWinner) {
                    const { data: winnerData, error: winnerError } = await supabase.rpc('get_previous_month_winner');
                    if (!winnerError && winnerData && winnerData.length > 0) {
                        setPreviousWinner({
                            name: winnerData[0].username,
                            avatar: winnerData[0].avatar_url,
                            xp: winnerData[0].total_xp
                        });
                    }
                }

            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [view]);

    return (
        <div className="py-24 px-4 max-w-4xl mx-auto animate-fadeIn">
            {/* Previous Month Winner Spotlight */}
            {previousWinner && (
                <div className="mb-16 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-[#C41230] to-yellow-400 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative glass-dark p-8 rounded-3xl flex items-center gap-8 border border-white/10 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">👑</div>
                        <div className="w-24 h-24 rounded-full border-4 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] flex-shrink-0 overflow-hidden">
                            {previousWinner.avatar ? <img src={previousWinner.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black flex items-center justify-center text-4xl">👑</div>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-[#FFD700] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest animate-pulse">Champion</span>
                                <span className="text-gray-400 text-[10px] uppercase tracking-widest">Last Month</span>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{previousWinner.name}</h3>
                            <p className="text-[#C41230] font-black text-lg">{previousWinner.xp} XP <span className="text-gray-500 text-xs font-normal ml-2">Total Impact</span></p>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center mb-16">
                <div className="w-12 h-16 bg-[#FCE7D1] ribbon-shape mx-auto mb-8 shadow-lg"></div>
                <h2 className="text-6xl font-black text-black uppercase tracking-tighter leading-none">Consistency <br /><span className="text-[#C41230]">Champions</span></h2>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em] mt-4">“Faithful Readers This Week”</p>
            </div>

            <div className="flex justify-center mb-16">
                <div className="glass-card p-2 rounded-2xl flex gap-2">
                    <button onClick={() => setView('weekly')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'weekly' ? 'bg-[#C41230] text-white' : 'text-gray-400'}`}>WEEKLY</button>
                    <button onClick={() => setView('monthly')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'monthly' ? 'bg-[#C41230] text-white' : 'text-gray-400'}`}>MONTHLY</button>
                </div>
            </div>

            <div className="glass-dark text-white p-12 rounded-brand border-l-[12px] border-l-[#C41230] shadow-2xl space-y-10">
                {loading ? (
                    <p className="text-center text-gray-400 font-bold uppercase tracking-widest">Loading Champions...</p>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center">
                        <p className="text-xl font-bold uppercase tracking-widest text-[#C41230] mb-2">Be the First</p>
                        <p className="text-gray-400 text-sm">Start a reading streak to claim the top spot!</p>
                    </div>
                ) : (
                    leaderboard.map((entry) => (
                        <div key={entry.rank} className="flex items-center gap-10 group border-b border-white/5 pb-8 last:border-0 last:pb-0">
                            <span className={`text-6xl font-black tracking-tighter w-16 text-right ${entry.rank === 1 ? 'text-[#C41230]' : 'text-white/20'}`}>
                                {entry.rank < 10 ? `0${entry.rank}` : entry.rank}
                            </span>
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[#C41230] transition-all">
                                {entry.avatar ? <img src={entry.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-[#C41230]">{entry.name.charAt(0)}</span>}
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-2xl font-black uppercase tracking-tight">{entry.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {view === 'weekly' ? 'Weekly' : 'Monthly'} Impact
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="block text-4xl font-black text-[#C41230]">{entry.xp}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">XP Gained</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
