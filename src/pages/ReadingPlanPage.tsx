import React, { useState, useEffect } from 'react';
import { ReadingPlan } from '../types';
import { ReaderView } from '../components/ReaderView';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const ReadingPlanPage: React.FC = () => {
    const { user, refreshProfile } = useAuth();
    const [plans, setPlans] = useState<ReadingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePlan, setActivePlan] = useState<ReadingPlan | null>(null);

    // Fetch Plans & Progress
    const fetchData = async () => {
        try {
            // 1. Get all plans
            const { data: plansData, error: plansError } = await supabase
                .from('reading_plans')
                .select('*')
                .order('created_at', { ascending: false });

            if (plansError) throw plansError;

            // 2. Get user progress
            let progressMap: Record<string, any> = {};
            if (user) {
                const { data: progressData } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', user.id);

                progressData?.forEach(p => {
                    progressMap[p.plan_id] = p;
                });
            }

            // 3. Merge data
            const mergedPlans = plansData.map((p: any) => ({
                id: p.id,
                title: p.title,
                author: p.author,
                description: p.description,
                coverImage: p.cover_image, // Note snake_case from DB
                category: p.category,
                totalChapters: p.total_chapters,
                totalPages: p.total_pages,
                dailyPageGoal: p.daily_page_goal,
                pdfUrl: p.pdf_url,
                bibleBook: p.bible_book,
                created_at: p.created_at,
                // Merge Progress
                currentChapter: progressMap[p.id]?.current_chapter || 0,
                currentPage: progressMap[p.id]?.current_page || 0,
                furthestChapter: progressMap[p.id]?.furthest_chapter || 0, // NEW
                furthestPage: progressMap[p.id]?.furthest_page || 0,       // NEW
                isCompleted: progressMap[p.id]?.is_completed || false,
                chapters: [] // We don't fetch chapter content here for list view
            }));

            // Filter: Show only the LATEST plan per category
            // Since plansData is ordered by created_at desc, the first one we see for a category is the latest.
            const latestPlansMap = new Map();
            mergedPlans.forEach((plan: any) => {
                if (!latestPlansMap.has(plan.category)) {
                    latestPlansMap.set(plan.category, plan);
                }
            });

            // Convert back to array
            const filteredPlans = Array.from(latestPlansMap.values());

            setPlans(filteredPlans);
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Deep Linking Support: Check for ?planId=...
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const planId = params.get('planId');
        if (planId && plans.length > 0) {
            const linkedPlan = plans.find(p => p.id === planId);
            if (linkedPlan) {
                setActivePlan(linkedPlan);
                // Optional: Clear param so refresh doesn't reopen it? 
                // window.history.replaceState({}, '', '/readings');
            }
        }
    }, [plans]);

    const handleUpdateProgress = async (planId: string) => {
        if (!user) return alert("Please sign in to save progress");

        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        let updates: any = {};
        let earnedXP = false;

        const goal = plan.dailyPageGoal || 10;
        const current = plan.currentPage || 0;
        const previousFurthestPage = plan.furthestPage || 0;
        const previousFurthestChapter = plan.furthestChapter || 0;

        if (plan.totalPages && plan.totalPages > 0) {
            // Page-based logic
            const newPage = Math.min(plan.totalPages, current + goal);
            updates = { current_page: newPage };

            // Only update furthest if we exceeded previous max
            if (newPage > previousFurthestPage) {
                updates.furthest_page = newPage;
                earnedXP = true;
            }

            // Optimistic Update
            setPlans(prev => prev.map(p => p.id === planId ? {
                ...p,
                currentPage: newPage,
                furthestPage: Math.max(previousFurthestPage, newPage)
            } : p));
        } else {
            // Chapter-based logic
            const newChapter = Math.min(plan.totalChapters || 0, plan.currentChapter + 1);
            updates = { current_chapter: newChapter };

            if (newChapter > previousFurthestChapter) {
                updates.furthest_chapter = newChapter;
                earnedXP = true;
            }

            // Optimistic Update
            setPlans(prev => prev.map(p => p.id === planId ? {
                ...p,
                currentChapter: newChapter,
                furthestChapter: Math.max(previousFurthestChapter, newChapter)
            } : p));
        }

        // Save to Supabase (User Progress)
        const { error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: user.id,
                plan_id: planId,
                ...updates,
                last_read_at: new Date().toISOString()
            }, { onConflict: 'user_id,plan_id' });

        if (error) console.error("Failed to save progress:", error);

        // Streak Logic: Update regardless of XP, as reading activity counts for streak
        const today = new Date().toISOString().split('T')[0];
        if (user) {
            const { data: profileData } = await supabase.from('profiles').select('streak, last_active_date').eq('id', user.id).single();

            if (profileData) {
                const lastActive = profileData.last_active_date;
                let newStreak = profileData.streak;

                if (lastActive !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastActive === yesterdayStr) {
                        newStreak += 1;
                    } else if (lastActive && lastActive < yesterdayStr) {
                        newStreak = 1;
                        // PENALTY: Missed a day
                        // Log negative XP for breaking the streak
                        await supabase.from('xp_ledger').insert({
                            user_id: user.id,
                            amount: -1,
                            description: 'Missed a day penalty'
                        });
                    } else if (!lastActive) {
                        newStreak = 1;
                    }

                    await supabase.from('profiles').update({
                        streak: newStreak,
                        last_active_date: today
                    }).eq('id', user.id);
                }
            }
        }

        // 4. Transform: Refresh Context to update UI immediately
        if (refreshProfile) await refreshProfile();

        // 5. XP Ledger Logging - ONLY IF NEW GROUND COVERED
        if (earnedXP) {
            // New XP Rules: 2 for Pages (Books), 1 for Chapters (Bible)
            const xpAmount = (updates.current_page > 0) ? 2 : 1;
            const xpDesc = (updates.current_page > 0) ? `Read page ${updates.current_page}` : `Read chapter`;

            const { error: xpError } = await supabase.from('xp_ledger').insert({
                user_id: user.id,
                amount: xpAmount,
                description: xpDesc
            });
            if (xpError) console.error("Failed to log XP:", xpError);
        }

        // Close Reader
        setActivePlan(null);
    };

    const handleSavePosition = async (planId: string, position: number) => {
        if (!user) return;
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        let updates: any = {};
        const previousFurthestPage = plan.furthestPage || 0;
        const previousFurthestChapter = plan.furthestChapter || 0;

        if (plan.totalPages && plan.totalPages > 0) {
            updates = { current_page: position };
            // Check High Water Mark
            if (position > previousFurthestPage) {
                updates.furthest_page = position;
            }

            // Optimistic Update
            setPlans(prev => prev.map(p => p.id === planId ? {
                ...p,
                currentPage: position,
                furthestPage: Math.max(previousFurthestPage, position)
            } : p));
        } else {
            updates = { current_chapter: position };
            if (position > previousFurthestChapter) {
                updates.furthest_chapter = position;
            }

            // Optimistic Update
            setPlans(prev => prev.map(p => p.id === planId ? {
                ...p,
                currentChapter: position,
                furthestChapter: Math.max(previousFurthestChapter, position)
            } : p));
        }

        // Silent Save (upsert)
        const { error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: user.id,
                plan_id: planId,
                ...updates,
                last_read_at: new Date().toISOString()
            }, { onConflict: 'user_id,plan_id' });

        if (error) console.error("Failed to save position:", error);
    };

    if (loading) return <div className="text-center py-24 font-black animate-pulse">Loading Library...</div>;

    return (
        <div className="py-24 px-4 max-w-6xl mx-auto">
            <h2 className="text-7xl font-black text-black mb-16 uppercase tracking-tighter">Reading <span className="text-[#C41230]">Library</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
                {plans.map((plan) => (
                    <div key={plan.id} className="glass-card rounded-brand overflow-hidden group shadow-xl border border-white/60 flex flex-col h-full transform transition-all hover:-translate-y-3">
                        <div className="h-80 overflow-hidden relative">
                            <img src={plan.coverImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                            <div className="absolute top-8 left-8 bg-black/80 backdrop-blur text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest">{plan.category}</div>
                        </div>
                        <div className="p-12 flex flex-col flex-grow">
                            <h3 className="text-3xl font-black text-black mb-2 leading-none tracking-tighter uppercase">{plan.title}</h3>
                            <p className="text-[#C41230] font-black text-sm mb-10 uppercase tracking-widest">{plan.author}</p>
                            <div className="mt-auto space-y-6">
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-white/40">
                                    <div className="h-full bg-[#C41230] transition-all duration-1000 shadow-[0_0_15px_rgba(196,18,48,0.4)]"
                                        style={{ width: `${plan.totalPages ? ((plan.furthestPage || 0) / plan.totalPages) * 100 : ((plan.furthestChapter || 0) / (plan.totalChapters || 1)) * 100}%` }}
                                    />
                                </div>
                                <button onClick={() => setActivePlan(plan)} className="w-full py-6 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-[#C41230] transition-all">
                                    {plan.totalPages
                                        ? `Resume Page ${plan.currentPage || 1}`
                                        : (plan.chapters ? 'Read Current Chapter' : `Read Chapter ${plan.currentChapter + 1}`)}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {activePlan && (
                <ReaderView
                    plan={activePlan}
                    onClose={(lastPosition) => {
                        handleSavePosition(activePlan.id, lastPosition);
                        setActivePlan(null);
                        // Clean up deep link so refresh doesn't reopen
                        const url = new URL(window.location.href);
                        url.searchParams.delete('planId');
                        window.history.pushState({}, '', url);
                    }}
                    onComplete={handleUpdateProgress}
                />
            )}
        </div>
    );
};
