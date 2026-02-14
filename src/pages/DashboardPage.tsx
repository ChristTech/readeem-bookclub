import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { BADGES } from '../constants';

export const DashboardPage: React.FC = () => {
    const { profile, user } = useAuth();
    const [stats, setStats] = useState({
        streak: 0,
        chaptersCompleted: 0,
        totalReadings: 0,
        badges: [] as typeof BADGES,
        lastReadPlanId: null as string | null // New field
    });
    const [loading, setLoading] = useState(true);

    // Helper: Generate Badge Image
    const generateBadgeImage = async (badgeName: string, icon: string): Promise<File | null> => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            // Background
            const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(1, '#1a1a1a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1080, 1080);

            // Border
            ctx.strokeStyle = '#C41230';
            ctx.lineWidth = 40;
            ctx.strokeRect(40, 40, 1000, 1000);

            // Icon (Emoji)
            ctx.font = '400px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon, 540, 450);

            // Title
            ctx.font = '900 80px sans-serif'; // Bold
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(badgeName.toUpperCase(), 540, 750);

            // Subtitle
            ctx.font = 'bold 40px sans-serif';
            ctx.fillStyle = '#C41230';
            ctx.fillText("EARNED ON READEEM CLUB", 540, 850);

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], `readeem-badge-${badgeName.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' }));
                    } else {
                        resolve(null);
                    }
                }, 'image/png');
            });
        } catch (e) {
            console.error("Failed to generate image:", e);
            return null;
        }
    };

    const handleShare = async (b: string, icon: string) => {
        const text = `I just earned the ${b} badge on READEEM! 🔥 Join me in building a reading culture.`;

        // Try Native Share with Image first
        if (navigator.share) {
            const file = await generateBadgeImage(b, icon);
            if (file) {
                try {
                    await navigator.share({
                        title: 'New Badge Unlocked!',
                        text: text,
                        files: [file]
                    });
                    return; // Success
                } catch (err) {
                    console.log("Native share failed or cancelled, falling back to basic link", err);
                }
            }
        }

        // Fallback: WhatsApp Link (Text Only)
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // Default or Real Data
    const username = profile?.username || user?.email?.split('@')[0] || 'Member';
    const avatarUrl = profile?.avatar_url;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            // 1. Fetch User Progress
            const { data: progress } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id);

            // 2. Calculate Stats
            const totalPagesRead = progress?.reduce((acc, curr) => acc + (curr.current_page || 0), 0) || 0;
            const totalChaptersRead = progress?.reduce((acc, curr) => acc + (curr.current_chapter || 0), 0) || 0;
            const currentStreak = profile?.streak || 0;

            // Fetch Real XP from Ledger
            const { data: xpData } = await supabase
                .from('xp_ledger')
                .select('amount')
                .eq('user_id', user.id);

            const totalXP = xpData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
            // Fallback: If 0 XP (old user), use the old formula as a baseline or just start fresh?
            // Let's use the formula as a minimum if Ledger is empty, to be nice to existing users? 
            // No, user wants strict rules. If they haven't earned it in the new system (or we didn't backfill), it is 0.
            // But wait, I didn't backfill XP ledger. 
            // If I switch to Ledger ONLY, existing users will drop to 0.
            // I should probably use the formula as a "Legacy Score" and add Ledger on top, or just switch.
            // Given the user is in "Testing" mode, switching to strict Ledger is cleaner for the "penalty" logic to work.
            // I will use totalXP.

            const spiritScore = totalXP;

            // 3. Determine Badges
            const earnedBadges: typeof BADGES = [];

            // Streak Badges
            if (currentStreak >= 3) earnedBadges.push(BADGES.find(b => b.name === 'Faithful Morning') || BADGES[2]);
            if (currentStreak >= 7) earnedBadges.push(BADGES.find(b => b.name === '7-Day Streak') || BADGES[0]);
            if (currentStreak >= 30) earnedBadges.push(BADGES.find(b => b.name === '30-Day Consistency') || BADGES[5]);

            // Reading Badges
            if (totalPagesRead > 0 || totalChaptersRead > 0) earnedBadges.push(BADGES.find(b => b.name === 'First Chapter') || BADGES[1]);
            if (totalPagesRead >= 50) earnedBadges.push(BADGES.find(b => b.name === 'Gospel Explorer') || BADGES[3]);
            if (spiritScore >= 500) earnedBadges.push(BADGES.find(b => b.name === 'Leadership Mindset') || BADGES[6]);

            // 4. Find Last Read Plan
            // Sort progress by last_read_at desc
            const sortedProgress = progress?.sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime());
            const lastPlanId = sortedProgress && sortedProgress.length > 0 ? sortedProgress[0].plan_id : null;

            setStats({
                streak: currentStreak,
                chaptersCompleted: totalPagesRead,
                totalReadings: spiritScore,
                badges: earnedBadges,
                lastReadPlanId: lastPlanId
            });
            setLoading(false);
        };

        fetchUserData();
        fetchUserData();
    }, [user, profile]);

    const handleAvatarUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;
        const file = e.target.files[0];
        setLoading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = fileName; // Upload to root

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Reload page or refresh profile to show new image
            window.location.reload();
        } catch (error) {
            console.error("Avatar update failed:", error);
            alert("Failed to update avatar. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-24 px-4 max-w-6xl mx-auto animate-fadeIn">
            {/* Gentle Notifications Section */}
            <div className="mb-16 glass-dark p-8 rounded-brand text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#C41230] rounded-full flex items-center justify-center text-2xl">🔔</div>
                    <div>
                        <h4 className="text-xl font-black tracking-tight uppercase">Daily Encouragement</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {stats.streak > 0 ? `You're on a ${stats.streak}-day streak! Keep the fire burning.` : "Start your streak today by reading a page!"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (stats.lastReadPlanId) {
                            window.location.href = `/readings?planId=${stats.lastReadPlanId}`;
                        } else {
                            window.location.href = '/readings';
                        }
                    }}
                    className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#C41230] hover:text-white transition-all"
                >
                    Stay Faithful
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-16">
                    <div className="flex items-end gap-6 mb-8">
                        <div className="relative group w-24 h-24 rounded-full border-4 border-[#C41230] flex items-center justify-center text-4xl font-black bg-white text-black shadow-xl overflow-hidden cursor-pointer">
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleAvatarUpdate} />
                            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : username.charAt(0).toUpperCase()}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <span className="text-[8px] text-white font-black uppercase tracking-widest">Edit</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-6xl font-black text-black uppercase tracking-tighter leading-none">Hello, <br /><span className="text-[#C41230]">{username.split(' ')[0]}</span></h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div className="glass-card p-12 rounded-brand border-b-[12px] border-b-[#C41230] shadow-2xl bg-white/40">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Streak</p>
                            <div className="flex items-baseline gap-4">
                                <span className="text-8xl font-black tracking-tighter">{stats.streak}</span>
                                <span className="text-xs font-black text-[#C41230]">DAYS</span>
                            </div>
                        </div>
                        {/* Extraction Card Removed as Requested */}
                        <div className="glass-card p-12 rounded-brand border border-white/40 shadow-xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Spirit Score</p>
                            <div className="flex items-baseline gap-4 text-black">
                                <span className="text-8xl font-black tracking-tighter">{stats.totalReadings}</span>
                                <span className="text-xs font-black text-[#C41230]">XP</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-12 rounded-brand border-l-[12px] border-l-[#C41230] shadow-2xl h-full">
                    <h3 className="text-3xl font-black mb-12 text-black uppercase tracking-tighter">Impact <br /><span className="text-[#C41230]">Badges</span></h3>
                    <div className="grid grid-cols-2 gap-8">
                        {stats.badges.map((badge) => (
                            <div key={badge?.id} className="flex flex-col items-center group relative cursor-help">
                                <div className="w-20 h-20 glass-card rounded-full flex items-center justify-center text-3xl mb-4 shadow-xl border-2 border-transparent group-hover:border-[#C41230] group-hover:scale-110 transition-all">
                                    {badge?.icon}
                                </div>
                                <span className="text-[9px] font-black text-black text-center tracking-[0.2em] uppercase leading-tight mb-2">{badge?.name}</span>
                                <button onClick={() => badge && handleShare(badge.name, badge.icon)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[8px] px-2 py-1 rounded-full uppercase tracking-widest font-black">Share</button>
                            </div>
                        ))}
                        {stats.badges.length === 0 && <p className="col-span-2 text-center text-gray-400 font-bold text-xs">Start reading to earn badges!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
