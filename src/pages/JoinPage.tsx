
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface JoinPageProps {
    setIsRegistered?: (value: boolean) => void;
}

export const JoinPage: React.FC<JoinPageProps> = ({ setIsRegistered }) => {
    // Auth State
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const navigate = useNavigate();
    const { refreshProfile } = useAuth();
    const { showToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAuth = async () => {
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // LOGIN LOGIC
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                showToast('Welcome back to the Club!', 'success');
            } else {
                // SIGNUP LOGIC
                if (!fullName || !birthMonth || !birthDay) {
                    throw new Error("Please fill in all profile details.");
                }

                // 1. Create Auth User
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName } // Metadata
                    }
                });
                if (authError) throw authError;

                // CHECK: If verification is required, Supabase returns user but NO session.
                if (authData.user && !authData.session) {
                    showToast(`Registration Successful! Please check your email (${email}) to verify your account.`, 'info');
                    setIsLogin(true); // Switch to login view so they can sign in after verifying
                    return; // Stop here, do not navigate to dashboard
                }

                if (authData.user && authData.session) {
                    let avatarUrl = null;

                    // 2. Upload Avatar (if exists)
                    if (avatarFile) {
                        const fileExt = avatarFile.name.split('.').pop();
                        const fileName = `${Date.now()}.${fileExt}`; // Simple timestamp filename
                        const filePath = fileName; // Upload to root to match user preference

                        // Note: User needs to create 'avatars' bucket in Supabase via dashboard
                        // Public bucket policy required
                        const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(filePath, avatarFile);

                        if (!uploadError) {
                            const { data: { publicUrl } } = supabase.storage
                                .from('avatars')
                                .getPublicUrl(filePath);
                            avatarUrl = publicUrl;
                        }
                    }

                    // 3. Update Profile Data
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({
                            username: fullName,
                            birth_month: parseInt(birthMonth),
                            birth_day: parseInt(birthDay),
                            avatar_url: avatarUrl
                        })
                        .eq('id', authData.user.id);

                    if (profileError) {
                        // Fallback: If update fails (e.g. trigger didn't run fast enough), insert
                        console.error("Profile update error, attempting upsert", profileError);
                        await supabase.from('profiles').upsert({
                            id: authData.user.id,
                            username: fullName,
                            birth_month: parseInt(birthMonth),
                            birth_day: parseInt(birthDay),
                            avatar_url: avatarUrl,
                            email: email
                        });
                    }

                    showToast('Welcome to Readeem! Profile created.', 'success');
                }
            }

            if (setIsRegistered) setIsRegistered(true);
            await refreshProfile(); // Force refresh to get new avatar
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            let msg = err.message || "Authentication failed";
            if (msg.includes("rate limit")) {
                msg = "Too many attempts. Please wait a moment or use the Supabase Dashboard to create the user.";
            }
            // setError(msg); // Removed inline error since we use toast now, or keep both?
            // Actually, keep error state for form-level feedback, but also show toast for major errors if needed.
            // Requirement says "use toast instead of popup". The error state is good for persistent message.
            // But let's show toast for critical failure too so they see it.
            showToast(msg, 'error');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-32 px-6 flex items-center justify-center">
            <div className="w-full max-w-lg">
                <div className="text-center mb-12">
                    <div className="w-12 h-16 bg-[#FCE7D1] ribbon-shape mx-auto mb-8 shadow-lg"></div>
                    <h2 className="text-5xl font-black text-black uppercase tracking-tighter">
                        {isLogin ? 'Welcome Back' : 'Join the Club'}
                    </h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">
                        {isLogin ? 'Continue your journey' : 'Begin your transformation'}
                    </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="glass-card p-10 rounded-3xl shadow-2xl space-y-6">
                    {error && <div className="p-4 bg-red-100 text-[#C41230] rounded-xl font-bold text-center text-sm">{error}</div>}

                    {/* Login/Signup Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                        <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${isLogin ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Sign In</button>
                        <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${!isLogin ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Register</button>
                    </div>

                    <div className="space-y-4">
                        {!isLogin && (
                            <div className="animate-fadeIn space-y-4">
                                {/* Auto-Layout for Name & Avatar */}
                                <div className="flex gap-4 items-center">
                                    <div className="relative w-20 h-20 flex-shrink-0 cursor-pointer group" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                        {avatarPreview ? (
                                            <img src={avatarPreview} className="w-full h-full object-cover rounded-full border-2 border-dashed border-gray-300 group-hover:border-[#C41230] transition-colors" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-[#C41230] group-hover:text-[#C41230] transition-all">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                        )}
                                        <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </div>
                                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="flex-grow p-5 rounded-2xl border-2 border-gray-100 bg-white/40 outline-none font-bold placeholder-gray-400 focus:border-[#C41230] transition-all" placeholder="Full Name" />
                                </div>

                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Date of Birth</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <select required value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className="w-full p-5 rounded-2xl border-2 border-gray-100 bg-white/40 outline-none font-bold text-gray-600 focus:border-[#C41230] transition-all appearance-none cursor-pointer">
                                        <option value="">Month</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>)}
                                    </select>
                                    <select required value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="w-full p-5 rounded-2xl border-2 border-gray-100 bg-white/40 outline-none font-bold text-gray-600 focus:border-[#C41230] transition-all appearance-none cursor-pointer">
                                        <option value="">Day</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-5 rounded-2xl border-2 border-gray-100 bg-white/40 outline-none font-bold text-xl placeholder-gray-400 focus:border-[#C41230] transition-all"
                            placeholder="Email Address"
                        />
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-5 rounded-2xl border-2 border-gray-100 bg-white/40 outline-none font-bold text-xl placeholder-gray-400 focus:border-[#C41230] transition-all"
                            placeholder="Password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#C41230] transition-all shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4"
                    >
                        {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : (isLogin ? 'Enter The Club' : 'Join The Club')}
                    </button>
                </form>
            </div>
        </div>
    );
};
