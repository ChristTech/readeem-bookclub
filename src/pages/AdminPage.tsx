import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReadingPlan } from '../types';
import { useToast } from '../context/ToastContext';

import { supabase } from '../lib/supabase';

export const AdminPage: React.FC = () => {
    const { isAdmin, loading } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAdmin) {
            showToast("Access Denied: Leadership Clearance Required.", 'error');
            navigate('/dashboard');
        }
    }, [isAdmin, loading, navigate]);

    // State for Page-Based Tracking
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [desc, setDesc] = useState('');
    const [totalPages, setTotalPages] = useState('');
    const [category, setCategory] = useState<'Gospel' | 'Theology' | 'Devotional' | 'Bible'>('Gospel');

    // New Fields State
    const [bibleBook, setBibleBook] = useState('');
    const [coverPreview, setCoverPreview] = useState<string>('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [pdfName, setPdfName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stats State ... (unchanged)
    const [stats, setStats] = useState({
        totalUsers: 0,
        avgStreak: 0,
        dailyConsistency: 0,
        pendingReviews: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!isAdmin) return;
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('streak, last_active_date');

            if (error) {
                console.error('Error fetching stats:', error);
                return;
            }

            const total = profiles.length;
            const totalStreak = profiles.reduce((acc, curr) => acc + (curr.streak || 0), 0);
            const avgStreak = total > 0 ? (totalStreak / total).toFixed(1) : 0;
            const today = new Date().toISOString().split('T')[0];
            const activeToday = profiles.filter(p => p.last_active_date === today).length;
            const consistency = total > 0 ? Math.round((activeToday / total) * 100) : 0;

            setStats({
                totalUsers: total,
                avgStreak: Number(avgStreak),
                dailyConsistency: consistency,
                pendingReviews: 0
            });
        };

        fetchStats();
    }, [isAdmin]);

    // Helper: Upload File
    const uploadFile = async (file: File, bucket: 'covers' | 'pdfs') => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const pages = parseInt(totalPages);
            const dailyGoal = Math.ceil(pages / 30);

            let finalCoverUrl = coverPreview;
            if (coverFile) {
                finalCoverUrl = await uploadFile(coverFile, 'covers');
            } else if (!coverPreview) {
                finalCoverUrl = 'https://picsum.photos/id/10/400/600';
            }

            let finalPdfUrl = pdfUrl;
            if (pdfFile) {
                finalPdfUrl = await uploadFile(pdfFile, 'pdfs');
            }

            const { error } = await supabase.from('reading_plans').insert({
                title,
                author,
                description: desc,
                total_chapters: 0,
                total_pages: pages,
                daily_page_goal: dailyGoal,
                category,
                cover_image: finalCoverUrl,
                pdf_url: finalPdfUrl,
                bible_book: category === 'Bible' ? bibleBook : null
            });

            if (error) throw error;

            // Reset form
            setTitle(''); setAuthor(''); setDesc(''); setTotalPages('');
            setBibleBook(''); setCoverPreview(''); setCoverFile(null);
            setPdfFile(null); setPdfName(''); setPdfUrl('');

            showToast(`Book Added Successfully! Recommended Pacing: ${dailyGoal} pages/day.`, 'success');

        } catch (error: any) {
            console.error('Error adding book:', error);
            showToast(`Failed to add book: ${error.message || 'Unknown error'}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="py-24 px-6 max-w-6xl mx-auto text-center animate-fadeIn">
            <h2 className="text-8xl font-black text-black uppercase tracking-tighter mb-24">Command <span className="text-[#C41230]">Center</span></h2>
            <div className="grid lg:grid-cols-2 gap-20 text-left">
                <div className="glass-card p-14 rounded-brand shadow-2xl border border-white/80">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="font-black text-4xl uppercase tracking-tighter italic">New Study Mandate</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* ... Existing Book Form ... */}
                        <div className="grid grid-cols-2 gap-8">
                            {/* ... Cover Upload & Inputs ... */}
                            <div className="col-span-2">
                                <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Cover Image</label>
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('cover-upload')?.click()}>
                                    {coverPreview ? (
                                        <img src={coverPreview} className="w-full h-48 object-cover rounded-2xl border-2 border-white/50 group-hover:border-[#C41230] transition-all" />
                                    ) : (
                                        <div className="w-full h-48 glass-card rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-[#C41230] transition-all">
                                            <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Upload Cover</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="cover-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setCoverFile(file); // Store file
                                                const url = URL.createObjectURL(file);
                                                setCoverPreview(url);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-5 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" placeholder="Book Title" />
                        <input required value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-5 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" placeholder="Author" />
                        <textarea required value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-5 h-32 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" placeholder="Core extraction brief..." />

                        <div className="grid grid-cols-2 gap-8">
                            <div className="glass-card p-5 rounded-2xl flex flex-col">
                                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Bible Book (Optional)</label>
                                <select value={bibleBook} onChange={e => setBibleBook(e.target.value)} className="bg-transparent font-black outline-none cursor-pointer w-full appearance-none">
                                    <option value="">Select Book...</option>
                                    <option>Genesis</option><option>Exodus</option><option>Psalms</option><option>Proverbs</option><option>Matthew</option><option>Mark</option><option>Luke</option><option>John</option><option>Acts</option><option>Romans</option><option>Revelation</option>
                                </select>
                            </div>
                            <div className="glass-card p-5 rounded-2xl flex flex-col">
                                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value as any)} className="bg-transparent font-black outline-none cursor-pointer w-full appearance-none">
                                    <option>Gospel</option><option>Theology</option><option>Devotional</option><option>Bible</option>
                                </select>
                            </div>
                        </div>

                        {/* Special Input for Bible Chapter */}
                        {category === 'Bible' && (
                            <div className="w-full p-5 glass-card rounded-2xl flex flex-col">
                                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Bible Reference (e.g. John 3)</label>
                                <input value={bibleBook} onChange={e => setBibleBook(e.target.value)} className="bg-transparent font-black outline-none focus:border-b-2 focus:border-[#C41230] placeholder-gray-400" placeholder="Book & Chapter" />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-8">
                            <div className="glass-card p-5 rounded-2xl flex flex-col justify-center">
                                <input required type="number" value={totalPages} onChange={e => setTotalPages(e.target.value)} className="bg-transparent font-black outline-none focus:border-b-2 focus:border-[#C41230] placeholder-gray-400" placeholder="Total Pages" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {totalPages ? `≈ ${Math.ceil(parseInt(totalPages) / 30)} pages / day (30 days)` : 'Auto-calc 30-day goal'}
                                </span>
                            </div>
                            <div className="glass-card p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#C41230] border border-transparent transition-all" onClick={() => document.getElementById('pdf-upload')?.click()}>
                                <span className="font-black text-gray-500 text-sm truncate">{pdfName || "Upload PDF Source"}</span>
                                <span className="bg-[#C41230] text-white text-[10px] uppercase font-black px-2 py-1 rounded">PDF</span>
                                <input
                                    type="file"
                                    id="pdf-upload"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setPdfName(file.name);
                                            setPdfFile(file); // Store file for upload
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <button disabled={isSubmitting} type="submit" className="w-full py-7 bg-[#C41230] text-white rounded-card font-black uppercase tracking-[0.4em] text-sm hover:bg-black transition-all shadow-2xl mt-10 transform hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Uploading & Broadcasting...' : 'Broadcast to Community'}
                        </button>
                    </form>


                </div>
                <div className="flex flex-col gap-20">
                    <div className="glass-dark text-white p-16 rounded-brand border-l-[16px] border-l-[#C41230] flex flex-col shadow-2xl">
                        <h3 className="font-black mb-16 text-4xl uppercase italic tracking-tighter text-[#C41230]">Engagement Pulse</h3>
                        <div className="space-y-12 flex-grow">
                            <div className="flex justify-between border-b border-white/10 pb-8"><span className="text-gray-400 font-bold uppercase text-[12px] tracking-[0.4em]">Active Disciples:</span> <span className="font-black text-6xl tracking-tighter">{stats.totalUsers}</span></div>
                            <div className="flex justify-between border-b border-white/10 pb-8"><span className="text-gray-400 font-bold uppercase text-[12px] tracking-[0.4em]">Avg Streak:</span> <span className="font-black text-6xl tracking-tighter text-[#C41230]">{stats.avgStreak}d</span></div>
                            <div className="flex justify-between"><span className="text-gray-400 font-bold uppercase text-[12px] tracking-[0.4em]">Daily Consistency:</span> <span className="font-black text-6xl tracking-tighter">{stats.dailyConsistency}%</span></div>
                        </div>
                    </div>

                    {/* NEW: Fellowship Tools (Moved Here) */}
                    <div className="glass-card p-14 rounded-brand shadow-2xl border border-white/80">
                        <h3 className="font-black text-4xl uppercase tracking-tighter italic mb-10">Fellowship Tools</h3>

                        {/* Guided Prompt Form */}
                        <div className="mb-16">
                            <h4 className="text-sm font-black text-[#C41230] uppercase tracking-widest mb-6">Post Guided Prompt</h4>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const prompt = (document.getElementById('prompt-input') as HTMLInputElement).value;
                                if (!prompt) return;
                                const { error } = await supabase.from('discussion_prompts').insert({ content: prompt });
                                if (!error) {
                                    showToast('Prompt Projected!', 'success');
                                    (document.getElementById('prompt-input') as HTMLInputElement).value = '';
                                }
                            }} className="flex gap-4">
                                <input id="prompt-input" className="flex-grow p-5 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" placeholder="e.g. What is your revelation from Chapter 4?" />
                                <button type="submit" className="bg-black text-white px-8 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#C41230] transition-colors">Post</button>
                            </form>
                        </div>

                        {/* Live Session Form */}
                        <div>
                            <h4 className="text-sm font-black text-[#C41230] uppercase tracking-widest mb-6">Schedule Live Session</h4>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const date = (document.getElementById('event-date') as HTMLInputElement).value;
                                const link = (document.getElementById('event-link') as HTMLInputElement).value;
                                if (!date || !link) return;
                                const { error } = await supabase.from('live_sessions').insert({ event_time: date, meeting_link: link, topic: 'Weekly Review' });
                                if (!error) {
                                    showToast('Session Scheduled!', 'success');
                                    (document.getElementById('event-date') as HTMLInputElement).value = '';
                                    (document.getElementById('event-link') as HTMLInputElement).value = '';
                                }
                            }} className="grid grid-cols-2 gap-4">
                                <input id="event-date" type="datetime-local" className="p-5 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" />
                                <input id="event-link" className="p-5 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" placeholder="Zoom/Google Meet Link" />
                                <button type="submit" className="col-span-2 py-5 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#C41230] transition-colors">Update Countdown</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
