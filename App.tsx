
import React, { useState, useEffect } from 'react';
import { Page, ReadingPlan } from './types';
import { Navbar } from './components/Navbar';
import { INITIAL_PLANS, WEEKLY_LEADERBOARD, MONTHLY_LEADERBOARD, BADGES, SCRIPTURE_OF_THE_DAY } from './constants';
import { generateTTS } from './services/geminiService';

// --- Sub-components (Internal for scope) ---

const HomePage: React.FC<{ setPage: (p: Page) => void }> = ({ setPage }) => (
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
                    <button onClick={() => setPage(Page.Join)} className="bg-[#C41230] text-white px-10 py-5 rounded-2xl font-black tracking-widest hover:bg-black transition-all shadow-xl uppercase text-sm transform hover:-translate-y-1">Join the Club</button>
                    <button onClick={() => setPage(Page.ReadingPlan)} className="glass-dark text-white px-10 py-5 rounded-2xl font-black tracking-widest hover:bg-[#C41230] transition-all shadow-xl uppercase text-sm transform hover:-translate-y-1">Start Reading</button>
                </div>
            </div>
        </div>
    </section>

    {/* Scripture of the Day Ribbon */}
    <div className="max-w-4xl mx-auto px-6 mb-24">
        <div className="glass-dark p-10 rounded-brand border-l-[12px] border-l-[#C41230] text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                 <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M100 0L129.389 70.6107H200L142.705 118.779L164.886 191.389L100 148.855L35.1141 191.389L57.2949 118.779L0 70.6107H70.6107L100 0Z" fill="white"/>
                 </svg>
             </div>
             <p className="text-2xl md:text-3xl font-black text-white italic leading-tight mb-4">"{SCRIPTURE_OF_THE_DAY.text}"</p>
             <p className="text-xs font-black text-[#C41230] uppercase tracking-[0.4em]">{SCRIPTURE_OF_THE_DAY.reference}</p>
        </div>
    </div>

    {/* Founder Highlight */}
    <section className="py-24 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
            <div className="flex items-center gap-8">
                <div className="w-28 h-28 rounded-card border-4 border-[#C41230] overflow-hidden shadow-2xl bg-gray-200 transform -rotate-3">
                    <img src="https://mighty.tools/mock-api/static/leader/21.jpg" className="w-full h-full object-cover" alt="Founder" />
                </div>
                <div>
                    <h2 className="text-5xl font-black text-black uppercase tracking-tighter leading-tight">Founder's <br/><span className="text-[#C41230]">Mandate</span></h2>
                </div>
            </div>
            <p className="text-2xl font-black text-gray-800 leading-snug glass-card p-10 rounded-brand italic border-r-[12px] border-r-[#C41230]">
                "To buy more years by studying is to inherit the wisdom of centuries in a single afternoon of focus. We are building the mind of Christ in a generation of leaders."
            </p>
        </div>
        <div className="rounded-brand overflow-hidden shadow-2xl border-8 border-white h-[500px] relative group">
            <img src="https://images.unsplash.com/photo-1544717297-fa154da09f9b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
            <div className="absolute bottom-10 left-10 glass-dark p-6 rounded-card border-white/20">
                <p className="text-white font-black uppercase text-[10px] tracking-widest">Global Reading Community</p>
            </div>
        </div>
    </section>
  </div>
);

const JoinPage: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
        <div className="py-32 px-6 max-w-2xl mx-auto animate-fadeIn">
            <div className="text-center mb-16">
                <div className="w-12 h-16 bg-[#FCE7D1] ribbon-shape mx-auto mb-8 shadow-lg"></div>
                <h2 className="text-6xl font-black text-black uppercase tracking-tighter">Enter the <br/><span className="text-[#C41230]">Sanctuary</span></h2>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em] mt-4">Begin Your Transformation</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onRegister(); }} className="glass-card p-14 rounded-brand shadow-2xl space-y-8">
                <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-6 rounded-card border-2 border-gray-100 bg-white/40 outline-none font-bold text-xl focus:border-[#C41230] transition-all" placeholder="Full Name" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-6 rounded-card border-2 border-gray-100 bg-white/40 outline-none font-bold text-xl focus:border-[#C41230] transition-all" placeholder="Email Address" />
                <button type="submit" className="w-full py-7 bg-[#C41230] text-white rounded-card font-black uppercase tracking-[0.2em] text-lg hover:bg-black transition-all shadow-2xl transform hover:-translate-y-1">Join READEEM</button>
            </form>
        </div>
    );
};

const ReadingPlanPage: React.FC<{ plans: ReadingPlan[], onUpdateProgress: (id: string) => void }> = ({ plans, onUpdateProgress }) => {
  const [activePlan, setActivePlan] = useState<ReadingPlan | null>(null);

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
                      <div className="h-full bg-[#C41230] transition-all duration-1000 shadow-[0_0_15px_rgba(196,18,48,0.4)]" style={{ width: `${(plan.currentChapter / plan.totalChapters) * 100}%` }} />
                  </div>
                  <button onClick={() => setActivePlan(plan)} className="w-full py-6 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-[#C41230] transition-all">
                      Read Chapter {plan.currentChapter + 1}
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activePlan && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-[40px] overflow-y-auto animate-fadeIn p-6 sm:p-24">
            <div className="max-w-4xl mx-auto relative">
                <button onClick={() => setActivePlan(null)} className="fixed top-12 right-12 w-16 h-16 glass-card rounded-full flex items-center justify-center text-black hover:bg-[#C41230] hover:text-white transition-all shadow-2xl z-[110]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-center mb-16">
                    <h1 className="text-6xl sm:text-8xl font-black text-black uppercase tracking-tighter mb-4">{activePlan.title}</h1>
                    <p className="text-[#C41230] font-black uppercase tracking-[0.4em] text-xs py-3 px-8 glass-dark rounded-full inline-block">Chapter {activePlan.currentChapter + 1}</p>
                </div>
                <div className="prose prose-2xl mx-auto text-gray-800 font-medium leading-[1.8] space-y-12">
                    <p>Sample Text: "In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made."</p>
                    <div className="p-12 glass-card rounded-brand border-l-[16px] border-l-[#C41230] text-3xl font-black italic text-black shadow-2xl leading-tight">
                        "Extraction: Your leadership is only as strong as your spiritual foundation."
                    </div>
                    <div className="bg-[#FCE7D1]/30 p-10 rounded-brand space-y-4">
                        <p className="text-xs font-black text-[#C41230] uppercase tracking-widest">Reflection Question</p>
                        <p className="text-2xl font-black text-black">How does seeing Jesus as the 'Word' change your perspective on authority?</p>
                    </div>
                </div>
                <div className="mt-20 flex gap-8 flex-col sm:flex-row">
                    <button onClick={() => generateTTS("In the beginning was the Word, and the Word was with God, and the Word was God.")} className="flex-1 py-8 glass-card rounded-card text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition-all">Audio Read-Along</button>
                    <button onClick={() => { onUpdateProgress(activePlan.id); setActivePlan(null); }} className="flex-2 py-8 bg-[#C41230] text-white rounded-card font-black uppercase tracking-[0.3em] text-xs hover:bg-black transition-all shadow-2xl">Confirm Completion</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const handleShare = (b: string) => alert(`Achievement Shared: I just earned the ${b} badge on READEEM! 🔥`);

  return (
    <div className="py-24 px-4 max-w-6xl mx-auto animate-fadeIn">
      {/* Gentle Notifications Section */}
      <div className="mb-16 glass-dark p-8 rounded-brand text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#C41230] rounded-full flex items-center justify-center text-2xl">🔔</div>
              <div>
                  <h4 className="text-xl font-black tracking-tight uppercase">Daily Encouragement</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">You're on a 12-day streak! Don't break the chain today.</p>
              </div>
          </div>
          <button className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#C41230] hover:text-white transition-all">Stay Faithful</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          <h2 className="text-7xl font-black text-black uppercase tracking-tighter">My <span className="text-[#C41230]">Journey</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div className="glass-card p-12 rounded-brand border-b-[12px] border-b-[#C41230] shadow-2xl bg-white/40">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Streak</p>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-black tracking-tighter">12</span>
                <span className="text-xs font-black text-[#C41230]">DAYS</span>
              </div>
            </div>
            <div className="glass-card p-12 rounded-brand border border-white/40 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Extraction</p>
              <div className="flex items-baseline gap-4 text-black">
                <span className="text-8xl font-black tracking-tighter">48</span>
                <span className="text-xs font-black text-[#C41230]">CHAPS</span>
              </div>
            </div>
            <div className="glass-card p-12 rounded-brand border border-white/40 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Spirit Score</p>
              <div className="flex items-baseline gap-4 text-black">
                <span className="text-8xl font-black tracking-tighter">84</span>
                <span className="text-xs font-black text-[#C41230]">%</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-16 rounded-brand border border-white/40 shadow-2xl">
            <h3 className="text-3xl font-black mb-16 text-black uppercase tracking-tighter">Impact <span className="text-[#C41230]">Badges</span></h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-12">
              {BADGES.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center group relative cursor-help">
                  <div className="w-28 h-28 glass-card rounded-full flex items-center justify-center text-5xl mb-6 shadow-2xl border-4 border-transparent group-hover:border-[#C41230] group-hover:scale-110 transition-all">
                    {badge.icon}
                  </div>
                  <span className="text-[11px] font-black text-black text-center tracking-[0.2em] uppercase leading-tight mb-4">{badge.name}</span>
                  <button onClick={() => handleShare(badge.name)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-black">Share</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="glass-dark text-white p-12 rounded-brand flex flex-col border-l-[12px] border-l-[#C41230] shadow-2xl">
          <h3 className="text-5xl font-black mb-16 text-white uppercase tracking-tighter italic">Faithful <br/><span className="text-[#C41230]">Readers</span></h3>
          <div className="space-y-12 flex-grow">
            {WEEKLY_LEADERBOARD.slice(0, 5).map((entry) => (
                <div key={entry.rank} className="flex items-center gap-6">
                    <span className={`text-4xl font-black ${entry.rank <= 3 ? 'text-[#C41230]' : 'text-gray-700'}`}>{entry.rank}</span>
                    <div className="flex-grow">
                        <p className="font-black text-lg uppercase">{entry.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{entry.streak} DAY STREAK</p>
                    </div>
                    <div className="text-2xl font-black text-[#C41230]">{entry.consistencyScore}%</div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunityPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState('04:12:45');

  useEffect(() => {
    const timer = setInterval(() => {
      // Mock countdown logic
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-24 px-4 max-w-6xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-24">
        <div className="flex-grow space-y-20">
          <h2 className="text-7xl font-black text-black uppercase tracking-tighter">The <span className="text-[#C41230]">Fellowship</span></h2>
          
          <div className="glass-card rounded-brand overflow-hidden shadow-2xl border border-white/50">
            <div className="bg-black p-10 flex items-start gap-8">
              <div className="w-20 h-20 glass-card rounded-card bg-[#FCE7D1] flex items-center justify-center font-black text-black text-3xl italic">PA</div>
              <div>
                <h4 className="font-black text-white text-3xl tracking-tighter uppercase">Pastor Andrew</h4>
                <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.4em] mt-2">Leadership Mentor</p>
              </div>
            </div>
            <div className="p-16 space-y-10">
              <div className="bg-[#C41230]/5 p-8 rounded-card border-l-8 border-l-[#C41230]">
                <p className="text-xs font-black text-[#C41230] uppercase tracking-widest mb-4 italic">Guided Prompt:</p>
                <p className="text-3xl font-black text-gray-800 tracking-tight italic leading-snug">"What stood out to you today? How can we apply this passage to our leadership capacity?"</p>
              </div>
              <div className="flex gap-10 border-t border-gray-100 pt-12">
                <button className="text-[12px] font-black text-gray-400 hover:text-[#C41230] flex items-center gap-4 uppercase tracking-[0.2em]">🔥 124 AMENS</button>
                <button className="text-[12px] font-black text-gray-400 hover:text-[#C41230] flex items-center gap-4 uppercase tracking-[0.2em]">💬 42 RESPONSES</button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-96 shrink-0 space-y-20">
          <div className="bg-[#C41230] text-white p-12 rounded-brand shadow-[0_40px_80px_rgba(196,18,48,0.3)] transform transition-transform hover:rotate-1">
            <h4 className="text-4xl font-black mb-8 uppercase tracking-tighter leading-none">Live Review <br/>Session</h4>
            <div className="text-6xl font-black mb-6 tracking-tighter">{timeLeft}</div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">NEXT GLOBAL GATHERING</p>
            <button className="w-full mt-14 py-6 bg-white text-[#C41230] rounded-card font-black uppercase text-xs tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-2xl">Join Session</button>
          </div>

          <div className="glass-card p-10 rounded-brand shadow-xl">
             <h4 className="text-[10px] font-black text-[#C41230] uppercase tracking-widest mb-4">Event Reminders</h4>
             <ul className="space-y-4">
                 <li className="flex gap-4 items-center border-b border-gray-100 pb-4">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     <div>
                         <p className="font-black text-sm uppercase">Weekly Recap</p>
                         <p className="text-[9px] font-bold text-gray-400 uppercase">Friday @ 7PM</p>
                     </div>
                 </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const JournalPage: React.FC = () => {
  const [reflection, setReflection] = useState('');
  const [prompt, setPrompt] = useState('How has your understanding of leadership changed since starting this reading plan?');

  const handleExport = () => alert("Reflections exported to READEEM_JOURNAL.pdf (Simulated)");

  return (
    <div className="py-24 px-4 max-w-5xl mx-auto animate-fadeIn">
      <div className="text-center mb-24">
        <div className="w-16 h-24 bg-[#FCE7D1] ribbon-shape mx-auto mb-10 shadow-xl"></div>
        <h2 className="text-8xl font-black text-black uppercase tracking-tighter">The <span className="text-[#C41230]">Vault</span></h2>
        <p className="text-gray-400 font-black uppercase text-[12px] tracking-[0.5em] mt-6">Private Leadership Journal</p>
      </div>

      <div className="glass-card rounded-brand border border-white/60 shadow-2xl overflow-hidden">
        <div className="p-14 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <div className="space-y-2">
            <h3 className="font-black text-black uppercase tracking-tighter text-4xl leading-none">Journal Entry</h3>
            <p className="text-[10px] font-black text-[#C41230] uppercase tracking-widest italic">March 25, 2024</p>
          </div>
          <button onClick={handleExport} className="glass-dark text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-[#C41230] transition-all">Export Reflections</button>
        </div>
        <div className="p-16">
          <div className="mb-12 bg-[#FCE7D1]/30 p-10 rounded-card border-l-8 border-l-[#C41230]">
              <p className="text-xs font-black text-[#C41230] uppercase tracking-widest mb-4 italic">Guided Reflection:</p>
              <p className="text-3xl font-black text-gray-800 tracking-tight italic leading-snug">"{prompt}"</p>
          </div>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} className="w-full h-[500px] resize-none focus:outline-none bg-transparent text-black font-medium text-4xl placeholder:text-gray-100 leading-tight italic tracking-tighter" placeholder="Documenting my transformation..." />
          <div className="mt-16 flex justify-end">
            <button className="px-16 py-7 bg-[#C41230] text-white rounded-card font-black uppercase tracking-[0.4em] text-sm hover:bg-black transition-all shadow-2xl">Seal Reflection</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPage: React.FC<{ onAddBook: (book: ReadingPlan) => void }> = ({ onAddBook }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [desc, setDesc] = useState('');
    const [chapters, setChapters] = useState('10');
    const [category, setCategory] = useState<'Gospel' | 'Theology' | 'Devotional'>('Gospel');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddBook({ id: Date.now().toString(), title, author, description: desc, totalChapters: parseInt(chapters), currentChapter: 0, category, coverImage: 'https://picsum.photos/id/10/400/600' });
        setTitle(''); setAuthor(''); setDesc('');
    };

    return (
        <div className="py-24 px-6 max-w-6xl mx-auto text-center animate-fadeIn">
          <h2 className="text-8xl font-black text-black uppercase tracking-tighter mb-24">Command <span className="text-[#C41230]">Center</span></h2>
          <div className="grid lg:grid-cols-2 gap-20 text-left">
             <div className="glass-card p-14 rounded-brand shadow-2xl border border-white/80">
                <h3 className="font-black text-4xl uppercase tracking-tighter italic mb-12">New Study Mandate</h3>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-5 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" placeholder="Title" />
                    <input required value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-5 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" placeholder="Author" />
                    <textarea required value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-5 h-40 glass-card rounded-2xl font-black outline-none focus:border-[#C41230]" placeholder="Core extraction brief..." />
                    <div className="grid grid-cols-2 gap-8">
                        <input required type="number" value={chapters} onChange={e => setChapters(e.target.value)} className="w-full p-5 glass-card rounded-2xl font-black" placeholder="Chapters" />
                        <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full p-5 glass-card rounded-2xl font-black appearance-none cursor-pointer">
                            <option>Gospel</option><option>Theology</option><option>Devotional</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-7 bg-[#C41230] text-white rounded-card font-black uppercase tracking-[0.4em] text-sm hover:bg-black transition-all shadow-2xl mt-10 transform hover:-translate-y-2">Broadcast to Community</button>
                </form>
             </div>
             <div className="glass-dark text-white p-16 rounded-brand border-l-[16px] border-l-[#C41230] flex flex-col shadow-2xl h-full">
                <h3 className="font-black mb-16 text-4xl uppercase italic tracking-tighter text-[#C41230]">Engagement Pulse</h3>
                <div className="space-y-12 flex-grow">
                   <div className="flex justify-between border-b border-white/10 pb-8"><span className="text-gray-400 font-bold uppercase text-[12px] tracking-[0.4em]">Active Disciples:</span> <span className="font-black text-6xl tracking-tighter">1,240</span></div>
                   <div className="flex justify-between border-b border-white/10 pb-8"><span className="text-gray-400 font-bold uppercase text-[12px] tracking-[0.4em]">Avg Streak:</span> <span className="font-black text-6xl tracking-tighter text-[#C41230]">14.2d</span></div>
                   <div className="flex justify-between"><span className="text-gray-400 font-bold uppercase text-[12px] tracking-[0.4em]">Daily Consistency:</span> <span className="font-black text-6xl tracking-tighter">92%</span></div>
                </div>
                <div className="mt-20 p-8 glass-card rounded-card border-2 border-dashed border-white/20">
                    <p className="text-xs font-black text-[#C41230] uppercase tracking-widest mb-4 italic">Moderation Hub</p>
                    <p className="text-lg font-bold text-gray-300">32 pending reflections await your review to be spotlighted in Fellowship.</p>
                </div>
             </div>
          </div>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [isAdmin] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [plans, setPlans] = useState<ReadingPlan[]>(INITIAL_PLANS);

  const handleUpdateProgress = (id: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id === id) return { ...p, currentChapter: Math.min(p.totalChapters, p.currentChapter + 1) };
      return p;
    }));
  };

  const handleAddBook = (book: ReadingPlan) => {
    setPlans(prev => [book, ...prev]);
    setCurrentPage(Page.ReadingPlan);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Home: return <HomePage setPage={setCurrentPage} />;
      case Page.Join: return <JoinPage onRegister={() => { setIsRegistered(true); setCurrentPage(Page.Dashboard); }} />;
      case Page.ReadingPlan: return <ReadingPlanPage plans={plans} onUpdateProgress={handleUpdateProgress} />;
      case Page.Dashboard: return <DashboardPage />;
      case Page.Leaderboard: return <LeaderboardPage />;
      case Page.Community: return <CommunityPage />;
      case Page.Journal: return <JournalPage />;
      case Page.Admin: return <AdminPage onAddBook={handleAddBook} />;
      default: return <HomePage setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar currentPage={currentPage} setPage={setCurrentPage} isAdmin={isAdmin} isRegistered={isRegistered} />
      <main className="flex-grow">{renderPage()}</main>
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
          <p className="text-gray-300 text-[11px] font-black uppercase tracking-[0.8em]">© 2024 READEEM. BUILDING LEADERS EARLY.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

// Helper Page for completeness
const LeaderboardPage: React.FC = () => {
    const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
    const data = view === 'weekly' ? WEEKLY_LEADERBOARD : MONTHLY_LEADERBOARD;

    return (
        <div className="py-24 px-4 max-w-4xl mx-auto animate-fadeIn">
            <div className="text-center mb-16">
                <div className="w-12 h-16 bg-[#FCE7D1] ribbon-shape mx-auto mb-8 shadow-lg"></div>
                <h2 className="text-6xl font-black text-black uppercase tracking-tighter leading-none">Consistency <br/><span className="text-[#C41230]">Champions</span></h2>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em] mt-4">“Faithful Readers This Week”</p>
            </div>
            <div className="flex justify-center mb-16">
                <div className="glass-card p-2 rounded-2xl flex gap-2">
                    <button onClick={() => setView('weekly')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'weekly' ? 'bg-[#C41230] text-white' : 'text-gray-400'}`}>WEEKLY</button>
                    <button onClick={() => setView('monthly')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'monthly' ? 'bg-[#C41230] text-white' : 'text-gray-400'}`}>MONTHLY</button>
                </div>
            </div>
            <div className="glass-dark text-white p-12 rounded-brand border-l-[12px] border-l-[#C41230] shadow-2xl space-y-10">
                {data.map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-10 group">
                        <span className={`text-4xl font-black w-12 text-center ${entry.rank <= 3 ? 'text-[#C41230]' : 'text-gray-700'}`}>{entry.rank}</span>
                        <div className="w-20 h-20 bg-white/10 glass-card rounded-card flex items-center justify-center font-black text-white text-3xl">{entry.name.charAt(0)}</div>
                        <div className="flex-grow">
                            <div className="text-2xl font-black uppercase tracking-tight">{entry.name}</div>
                            <div className="text-[11px] font-bold text-gray-500 tracking-[0.3em] uppercase">{entry.streak} DAY STREAK</div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-[#C41230] tracking-tighter">{entry.consistencyScore}%</div>
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Consistency</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
