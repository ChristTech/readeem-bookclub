import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface NavbarProps {
    isAdmin?: boolean;
    isRegistered?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isAdmin, isRegistered }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { profile } = useAuth(); // Get real profile

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    // Initials helper
    const getInitials = (name?: string) => {
        if (!name) return 'RC';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const navItems = [
        { label: 'HOME', path: '/' },
        { label: 'READINGS', path: '/readings' },
        { label: 'DASHBOARD', path: '/dashboard' },
        { label: 'LEADERBOARD', path: '/leaderboard' },
        { label: 'COMMUNITY', path: '/community' },
        { label: 'JOURNAL', path: '/journal' },
    ];

    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const checkUnread = async () => {
            if (!profile || currentPath === '/community') {
                setHasUnread(false);
                return;
            }

            const { data: latestPrompt } = await supabase
                .from('discussion_prompts')
                .select('created_at')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (latestPrompt && profile.last_seen_community) {
                const promptTime = new Date(latestPrompt.created_at).getTime();
                const lastSeen = new Date(profile.last_seen_community).getTime();
                if (promptTime > lastSeen) {
                    setHasUnread(true);
                }
            } else if (latestPrompt && !profile.last_seen_community) {
                // Never seen community
                setHasUnread(true);
            }
        };

        checkUnread();
    }, [profile, currentPath]); // Re-check on nav change or profile load

    const isActive = (path: string) => {
        if (path === '/' && currentPath === '/') return true;
        if (path !== '/' && currentPath.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center cursor-pointer group">
                        <div className="relative mr-2">
                            <div className="w-8 h-10 bg-[#FCE7D1] ribbon-shape absolute -top-1 left-0"></div>
                            <span className="relative z-10 text-3xl font-black tracking-tight text-[#C41230]">
                                Readeem<span className="text-black">.</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-[11px] tracking-[0.2em] font-extrabold transition-colors duration-200 relative ${isActive(item.path)
                                    ? 'text-[#C41230]'
                                    : 'text-black hover:text-[#C41230]'
                                    }`}
                            >
                                {item.label}
                                {item.label === 'COMMUNITY' && hasUnread && (
                                    <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#C41230] rounded-full animate-pulse"></span>
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4">
                        {!isRegistered ? (
                            <Link
                                to="/join"
                                className="hidden sm:block bg-[#C41230] text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-xl"
                            >
                                JOIN CLUB
                            </Link>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-4">
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className={`text-[10px] px-4 py-1.5 rounded-full border-2 border-black font-black hover:bg-black hover:text-white transition-all uppercase tracking-widest ${currentPath === '/admin' ? 'bg-black text-white' : 'text-black'}`}
                                    >
                                        Admin
                                    </Link>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden xl:block">
                                        <div className="text-[10px] font-black uppercase tracking-widest leading-none text-black">{profile?.username || 'Member'}</div>
                                        <button onClick={handleLogout} className="text-[9px] font-bold text-gray-400 hover:text-[#C41230] uppercase tracking-widest">Sign Out</button>
                                    </div>
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} className="w-10 h-10 rounded-full border-2 border-[#C41230] object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full border-2 border-[#C41230] flex items-center justify-center text-[#C41230] font-black text-xs bg-white">
                                            {getInitials(profile?.username)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 text-black hover:text-[#C41230]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-fadeIn p-6 flex flex-col space-y-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`text-sm tracking-[0.2em] font-black uppercase py-2 border-b border-gray-50 last:border-0 ${isActive(item.path)
                                ? 'text-[#C41230]'
                                : 'text-black'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    {!isRegistered ? (
                        <Link to="/join" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#C41230] text-center text-white px-5 py-3 text-xs font-black uppercase tracking-widest rounded-xl mt-4">Join Club</Link>
                    ) : (
                        <div className="border-t border-gray-100 pt-4 flex items-center gap-4">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className="w-10 h-10 rounded-full border-2 border-[#C41230] object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full border-2 border-[#C41230] flex items-center justify-center text-[#C41230] font-black text-xs">
                                    {getInitials(profile?.username)}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="font-black text-xs uppercase">{profile?.username || 'Member'}</span>
                                <button onClick={handleLogout} className="text-left text-[10px] text-gray-400 hover:text-[#C41230] font-bold uppercase tracking-widest">Sign Out</button>
                            </div>
                            {isAdmin && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="ml-auto text-[10px] px-4 py-1.5 rounded-full border-2 border-black font-black uppercase tracking-widest">Admin</Link>}
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};
