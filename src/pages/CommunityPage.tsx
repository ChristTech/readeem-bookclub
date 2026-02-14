import React, { useState, useEffect } from 'react';
import { INITIAL_DISCUSSIONS } from '../constants';
import { DiscussionPost } from '../types';
import { supabase } from '../lib/supabase';

export const CommunityPage: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState('00:00:00');
    const [nextSessionLink, setNextSessionLink] = useState('');
    const [discussions, setDiscussions] = useState<DiscussionPost[]>([]);
    const [newComment, setNewComment] = useState('');
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

    const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

    // State for upcoming events list
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

    useEffect(() => {
        // ... (updateLastSeen logic)
        const updateLastSeen = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ last_seen_community: new Date().toISOString() }).eq('id', user.id);
            }
        };
        updateLastSeen();

        // 1. Fetch Upcoming Sessions (Limit 5)
        const fetchSessions = async () => {
            const { data } = await supabase
                .from('live_sessions')
                .select('*')
                .order('event_time', { ascending: true }) // Get nearest futures first
                .gte('event_time', new Date().toISOString()) // Only future events
                .limit(5);

            if (data && data.length > 0) {
                const nextSession = data[0];
                setNextSessionLink(nextSession.meeting_link);
                setUpcomingEvents(data.slice(1)); // Store the rest

                // Start Countdown for the NEAREST session
                const interval = setInterval(() => {
                    const now = new Date().getTime();
                    const eventDate = new Date(nextSession.event_time).getTime();
                    const distance = eventDate - now;

                    if (distance < 0) {
                        setTimeLeft('LIVE NOW');
                    } else {
                        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
                    }
                }, 1000);
                return () => clearInterval(interval);
            } else {
                setTimeLeft('TBA');
            }
        };

        // 2. Fetch Full Feed with Comments & Likes
        const fetchFeed = async () => {
            // Get Prompts
            const { data: prompts } = await supabase.from('discussion_prompts').select('*').order('created_at', { ascending: false });
            if (!prompts) return;

            // Get all needed data in parallel potentially, but for now simple queries
            const { data: allComments } = await supabase
                .from('community_comments')
                .select(`
                    id, prompt_id, content, created_at, 
                    user_id,
                    profiles:user_id ( username, avatar_url )
                `)
                .order('created_at', { ascending: true });

            const { data: allLikes } = await supabase.from('community_likes').select('prompt_id, user_id');
            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id;

            // Process Likes
            const likesCountMap: Record<string, number> = {};
            const userLikedSet = new Set<string>();
            allLikes?.forEach(like => {
                likesCountMap[like.prompt_id] = (likesCountMap[like.prompt_id] || 0) + 1;
                if (like.user_id === currentUserId) userLikedSet.add(like.prompt_id);
            });
            setUserLikes(userLikedSet);

            // Process Comments
            const commentsMap: Record<string, any[]> = {};
            allComments?.forEach((c: any) => {
                if (!commentsMap[c.prompt_id]) commentsMap[c.prompt_id] = [];
                commentsMap[c.prompt_id].push({
                    id: c.id,
                    authorId: c.user_id,
                    authorName: c.profiles?.username || 'Member',
                    content: c.content,
                    timestamp: new Date(c.created_at).toLocaleDateString(), // simplified
                    likes: 0
                });
            });

            // Build Discussion Objects
            const realDiscussions: DiscussionPost[] = prompts.map(p => ({
                id: p.id,
                authorId: 'admin1',
                authorName: 'Pastor David Owolabi',
                authorAvatar: 'PD',
                role: 'Leadership Mentor',
                content: p.content,
                guidedPrompt: true,
                timestamp: new Date(p.created_at).toLocaleDateString(),
                likes: likesCountMap[p.id] || 0,
                comments: commentsMap[p.id] || []
            }));

            setDiscussions(realDiscussions);
        };

        fetchSessions();
        fetchFeed();
    }, []);

    const handlePostComment = async (threadId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !newComment.trim()) return;

        // Optimistic Update
        const tempId = Date.now().toString();
        setDiscussions(prev => prev.map(d => {
            if (d.id === threadId) {
                return {
                    ...d,
                    comments: [...d.comments, {
                        id: tempId,
                        authorId: user.id,
                        authorName: 'You',
                        content: newComment,
                        timestamp: 'Just now',
                        likes: 0
                    }]
                };
            }
            return d;
        }));

        // DB Insert
        const { error } = await supabase.from('community_comments').insert({
            prompt_id: threadId,
            user_id: user.id,
            content: newComment
        });

        if (error) {
            console.error('Error posting comment:', error);
            // Revert optimistic update (simplified: just alert for now)
            alert('Failed to post comment');
        }

        setNewComment('');
        setActiveThreadId(null);
    };

    const handleLike = async (threadId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const isLiked = userLikes.has(threadId);

        // Optimistic Update
        setDiscussions(prev => prev.map(d => {
            if (d.id === threadId) {
                return { ...d, likes: isLiked ? d.likes - 1 : d.likes + 1 };
            }
            return d;
        }));
        setUserLikes(prev => {
            const next = new Set(prev);
            if (isLiked) next.delete(threadId);
            else next.add(threadId);
            return next;
        });

        if (isLiked) {
            await supabase.from('community_likes').delete().match({ prompt_id: threadId, user_id: user.id });
        } else {
            await supabase.from('community_likes').insert({ prompt_id: threadId, user_id: user.id });
        }
    };

    return (
        <div className="py-24 px-4 max-w-6xl mx-auto animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-24">
                <div className="flex-grow space-y-20">
                    <h2 className="text-7xl font-black text-black uppercase tracking-tighter">The <span className="text-[#C41230]">Fellowship</span></h2>

                    {discussions.length === 0 && <p className="text-gray-400 font-bold tracking-widest uppercase">No active discussions. Waiting for leadership...</p>}

                    {discussions.map(post => (
                        <div key={post.id} className="glass-card rounded-brand overflow-hidden shadow-2xl border border-white/50">
                            {/* ... Existing Post UI ... */}
                            <div className="bg-black p-10 flex items-start gap-8">
                                <div className="w-20 h-20 glass-card rounded-card bg-[#FCE7D1] flex items-center justify-center font-black text-black text-3xl italic">{post.authorAvatar}</div>
                                <div>
                                    <h4 className="font-black text-white text-3xl tracking-tighter uppercase">{post.authorName}</h4>
                                    <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.4em] mt-2">{post.role || 'Member'}</p>
                                </div>
                            </div>
                            <div className="p-16 space-y-10">
                                <div className={`${post.guidedPrompt ? 'bg-[#C41230]/5 border-l-[#C41230]' : 'bg-gray-50 border-l-black'} p-8 rounded-card border-l-8`}>
                                    {post.guidedPrompt && <p className="text-xs font-black text-[#C41230] uppercase tracking-widest mb-4 italic">Guided Prompt:</p>}
                                    <p className="text-3xl font-black text-gray-800 tracking-tight italic leading-snug">"{post.content}"</p>
                                </div>

                                {/* Comments Section */}
                                <div className="space-y-6">
                                    {post.comments.map(comment => (
                                        <div key={comment.id} className="flex gap-4 items-start pl-6 border-l-2 border-gray-100">
                                            <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">{comment.authorName.charAt(0)}</div>
                                            <div>
                                                <p className="text-xs font-black uppercase">{comment.authorName} <span className="text-gray-400 font-normal normal-case ml-2">- {comment.timestamp}</span></p>
                                                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-10 border-t border-gray-100 pt-12 items-center">
                                    <button onClick={() => handleLike(post.id)} className={`text-[12px] font-black flex items-center gap-4 uppercase tracking-[0.2em] transition-colors ${userLikes.has(post.id) ? 'text-[#C41230]' : 'text-gray-400 hover:text-[#C41230]'}`}>
                                        {userLikes.has(post.id) ? '🔥 AMEN!' : '🙏 AMEN'} {post.likes > 0 && post.likes}
                                    </button>
                                    <button onClick={() => setActiveThreadId(activeThreadId === post.id ? null : post.id)} className="text-[12px] font-black text-gray-400 hover:text-[#C41230] flex items-center gap-4 uppercase tracking-[0.2em] transition-colors">💬 {post.comments.length} RESPONSES</button>
                                </div>

                                {activeThreadId === post.id && (
                                    <div className="flex gap-4 animate-fadeIn">
                                        <input
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="flex-grow p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-[#C41230] transition-colors"
                                            placeholder="Share your revelation..."
                                        />
                                        <button onClick={() => handlePostComment(post.id)} className="bg-black text-white px-6 rounded-xl font-bold uppercase text-xs hover:bg-[#C41230] transition-colors">Post</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-96 shrink-0 space-y-20">
                    <div className="bg-[#C41230] text-white p-12 rounded-brand shadow-[0_40px_80px_rgba(196,18,48,0.3)] transform transition-transform hover:rotate-1">
                        <h4 className="text-4xl font-black mb-8 uppercase tracking-tighter leading-none">Live Review <br />Session</h4>
                        <div className="text-6xl font-black mb-6 tracking-tighter">{timeLeft}</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">NEXT GLOBAL GATHERING</p>
                        <button onClick={() => window.open(nextSessionLink || '#', '_blank')} className="w-full mt-14 py-6 bg-white text-[#C41230] rounded-card font-black uppercase text-xs tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-2xl">
                            {timeLeft === 'LIVE NOW' ? 'JOIN NOW 🔴' : 'Join Session'}
                        </button>
                    </div>

                    <div className="glass-card p-10 rounded-brand shadow-xl">
                        <h4 className="text-[10px] font-black text-[#C41230] uppercase tracking-widest mb-4">Upcoming Events</h4>
                        <ul className="space-y-4">
                            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                <li key={event.id} className="flex gap-4 items-center border-b border-gray-100 pb-4 last:border-0">
                                    <span className="w-2 h-2 rounded-full bg-black/20"></span>
                                    <div>
                                        <p className="font-black text-sm uppercase">{event.topic || 'Fellowship Gathering'}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                                            {new Date(event.event_time).toLocaleDateString()} @ {new Date(event.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </li>
                            )) : (
                                <li className="text-gray-400 text-xs italic">No other upcoming sessions scheduled.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
