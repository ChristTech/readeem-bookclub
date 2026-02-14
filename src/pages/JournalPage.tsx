import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface JournalEntry {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

export const JournalPage: React.FC = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setEntries(data);
    };

    const handleNewEntry = () => {
        setSelectedEntry(null);
        setTitle('');
        setContent('');
    };

    const handleSelectEntry = (entry: JournalEntry) => {
        setSelectedEntry(entry);
        setTitle(entry.title);
        setContent(entry.content);
    };

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) return;
        setIsSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const entryData = {
            user_id: user.id,
            title: title || 'Untitled Reflection',
            content,
            updated_at: new Date().toISOString()
        };

        let error;
        if (selectedEntry) {
            // Update
            const { error: updateError } = await supabase
                .from('journal_entries')
                .update(entryData)
                .eq('id', selectedEntry.id);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('journal_entries')
                .insert(entryData);
            error = insertError;
        }

        if (!error) {
            await fetchEntries();
            if (!selectedEntry) {
                // If it was new, clear it or maybe select the latest? 
                // For now, let's just refresh list and keep editing or clear.
                // Let's clear to indicate "Saved to Vault"
                handleNewEntry();
                alert('Reflection Sealed in Vault.');
            } else {
                alert('Entry Updated.');
            }
        } else {
            console.error('Error saving journal:', error);
            alert('Failed to save entry.');
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to burn this page?')) return;
        const { error } = await supabase.from('journal_entries').delete().eq('id', id);
        if (!error) {
            fetchEntries();
            if (selectedEntry?.id === id) handleNewEntry();
        }
    };

    return (
        <div className="py-24 px-4 max-w-7xl mx-auto animate-fadeIn min-h-screen flex flex-col">
            <div className="text-center mb-16">
                <div className="w-16 h-24 bg-[#FCE7D1] ribbon-shape mx-auto mb-10 shadow-xl"></div>
                <h2 className="text-8xl font-black text-black uppercase tracking-tighter">The <span className="text-[#C41230]">Vault</span></h2>
                <p className="text-gray-400 font-black uppercase text-[12px] tracking-[0.5em] mt-6">Private Leadership Journal</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-start">

                {/* Sidebar: Entry List */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <button onClick={handleNewEntry} className="w-full py-6 bg-black text-white rounded-card font-black uppercase text-xs tracking-[0.2em] hover:bg-[#C41230] transition-colors shadow-xl">
                        + New Entry
                    </button>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {entries.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Vault Empty</p>
                            </div>
                        ) : (
                            entries.map(entry => (
                                <div
                                    key={entry.id}
                                    onClick={() => handleSelectEntry(entry)}
                                    className={`p-8 glass-card rounded-2xl cursor-pointer border-2 transition-all hover:border-[#C41230] group ${selectedEntry?.id === entry.id ? 'border-[#C41230] bg-[#C41230]/5' : 'border-transparent'}`}
                                >
                                    <h4 className="font-black text-lg uppercase tracking-tight mb-2 truncate">{entry.title}</h4>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(entry.created_at).toLocaleDateString()}</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                            className="text-gray-300 hover:text-[#C41230] font-bold text-xs px-2 py-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Editor */}
                <div className="w-full lg:w-2/3 glass-card rounded-brand border border-white/60 shadow-2xl overflow-hidden flex flex-col min-h-[700px]">
                    <div className="p-10 border-b border-gray-100 bg-white/50">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent font-black text-4xl uppercase tracking-tighter outline-none placeholder:text-gray-200"
                            placeholder="TITLE YOUR THOUGHT..."
                        />
                        <p className="text-[10px] font-black text-[#C41230] uppercase tracking-widest italic mt-4">
                            {selectedEntry ? `Editing: ${new Date(selectedEntry.created_at).toLocaleDateString()}` : new Date().toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex-grow p-10 bg-white/30">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full resize-none focus:outline-none bg-transparent text-black font-medium text-2xl placeholder:text-gray-200 leading-relaxed italic tracking-tight"
                            placeholder="Document your transformation here..."
                        />
                    </div>

                    <div className="p-8 border-t border-gray-100 bg-white/50 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-12 py-5 bg-[#C41230] text-white rounded-xl font-black uppercase tracking-[0.3em] text-xs hover:bg-black transition-all shadow-xl disabled:opacity-50"
                        >
                            {isSaving ? 'Sealing...' : 'Seal Reflection'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
