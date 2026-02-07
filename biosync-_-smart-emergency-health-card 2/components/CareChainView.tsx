import React, { useState, useEffect } from 'react';
import { UserHealthData, TimelineEvent, TimelineCategory } from '../types';
import { getCareChainSummary } from '../services/geminiService';

interface CareChainViewProps {
  data: UserHealthData;
  theme: 'dark' | 'light';
  onBack: () => void;
}

// Extend Window interface for the requested global delete function
declare global {
  interface Window {
    deleteMedicalRecord: (id: string) => void;
  }
}

export const CareChainView: React.FC<CareChainViewProps> = ({ data, theme, onBack }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<'All' | TimelineCategory>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Form State
  const [newEntry, setNewEntry] = useState<Partial<TimelineEvent>>({
    category: 'Labs',
    title: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    notes: '',
    fileUrl: undefined,
    fileName: undefined
  });

  const getNowTimestamp = () => {
    const d = new Date();
    // Format: Feb 7, 2026 - 12:45 PM
    const datePart = d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timePart = d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    return `${datePart} - ${timePart}`;
  };

  // PERSISTENCE & INITIAL LOAD
  useEffect(() => {
    const saved = localStorage.getItem('biosync_timeline');
    const ts = localStorage.getItem('biosync_timeline_last_updated');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) { console.error("History parse error", e); }
    }
    if (ts) setLastUpdated(ts);

    // GLOBAL DELETE LOGIC
    window.deleteMedicalRecord = function(id: string) {
      if (window.confirm('PERMANENT WIPE: This record will be deleted forever. Continue?')) {
        try {
          const currentRecords = JSON.parse(localStorage.getItem('biosync_timeline') || '[]');
          const updatedRecords = currentRecords.filter((rec: any) => String(rec.id) !== String(id));
          
          localStorage.setItem('biosync_timeline', JSON.stringify(updatedRecords));
          localStorage.setItem('biosync_timeline_last_updated', getNowTimestamp());
          
          window.location.reload(); 
        } catch (error) {
          console.error('Delete Error:', error);
        }
      }
    };
  }, []);

  // AI SUMMARY LOGIC
  useEffect(() => {
    async function fetchSummary() {
      if (events.length === 0) {
        setSummary("• No records logged\n• Timeline empty\n• Log a new event");
        return;
      }
      setLoadingSummary(true);
      const res = await getCareChainSummary(events);
      setSummary(res);
      setLoadingSummary(false);
    }
    fetchSummary();
  }, [events]);

  // FILE UPLOAD LOGIC
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setNewEntry(prev => ({ ...prev, fileUrl: base64String, fileName: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  // DYNAMIC TIMELINE LOGIC (SAVE)
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = getNowTimestamp();

    const entry: TimelineEvent = {
      id: Date.now().toString(),
      title: newEntry.title || 'Untitled Record',
      category: newEntry.category as TimelineCategory,
      date: newEntry.date || new Date().toISOString().split('T')[0],
      summary: newEntry.summary || '',
      notes: newEntry.notes || '',
      fileUrl: newEntry.fileUrl,
      fileName: newEntry.fileName,
      lastModified: timestamp
    };

    const updatedEvents = [entry, ...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem('biosync_timeline', JSON.stringify(updatedEvents));
    localStorage.setItem('biosync_timeline_last_updated', timestamp);
    
    window.location.reload(); 
  };

  const filteredEvents = events.filter(e => {
    const search = searchTerm.toLowerCase();
    return (filter === 'All' || e.category === filter) && 
           (e.title.toLowerCase().includes(search) || 
            (e.notes && e.notes.toLowerCase().includes(search)) ||
            (e.summary && e.summary.toLowerCase().includes(search)));
  });

  const getCategoryColor = (cat: TimelineCategory) => {
    switch (cat) {
      case 'Labs': return 'text-blue-600 bg-blue-500/10 border-blue-600/30';
      case 'Surgeries': return 'text-purple-600 bg-purple-500/10 border-purple-600/30';
      case 'Prescriptions': return 'text-green-600 bg-green-500/10 border-green-600/30';
      default: return 'text-slate-900';
    }
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';
  const subTextColor = isDark ? 'text-white/80' : 'text-black/80';
  const cardBg = isDark ? 'glass bg-white/5' : 'glass bg-white';

  const inputClass = isDark 
    ? "w-full p-4 rounded-2xl border-2 border-white/20 bg-black/40 text-white outline-none focus:border-red-500 transition-all font-bold text-[14px]"
    : "w-full p-4 rounded-2xl border-2 border-slate-400 bg-white text-black outline-none focus:border-red-500 transition-all font-bold text-[14px]";

  return (
    <div className="animate-in slide-in-from-right duration-500 relative pb-40 px-2">
      {/* Header (32px) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-8">
        <div>
          <h2 className={`text-[32px] font-black ${textColor} tracking-tight uppercase leading-none`}>
            CARECHAIN
          </h2>
          <div className={`text-[14px] ${subTextColor} font-medium mt-2 uppercase tracking-wide flex flex-wrap items-center gap-x-3`}>
            <span>Verified Medical History Layer</span>
            {/* Last Updated Status */}
            {lastUpdated && (
              <span className={`border-l pl-3 ${isDark ? 'border-white/20' : 'border-slate-300'} opacity-60 flex items-center gap-2 font-bold`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Last Updated: {lastUpdated}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={onBack} 
          className="w-full lg:w-auto px-6 py-2.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-xl flex items-center justify-center space-x-2 text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
          {/* Category Filters (16px Medium) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {['All', 'Labs', 'Surgeries', 'Prescriptions'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat as any)}
                  className={`flex-1 md:flex-none px-4 py-1.5 rounded-xl font-medium text-[16px] uppercase tracking-wide transition-all border-2 ${
                    filter === cat ? 'bg-red-600 text-white border-red-600 shadow-lg' : `${cardBg} ${textColor} border-slate-400/20`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative group w-full max-w-sm">
               <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-12 h-11`}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Timeline List */}
          <div className="space-y-10">
            {filteredEvents.length === 0 ? (
              <div className="glass p-20 rounded-[3rem] text-center border-dashed border-2 border-slate-400/20">
                <p className={`text-xl font-black ${subTextColor} uppercase tracking-tight`}>No Medical Records Found</p>
                <p className={`text-[14px] ${subTextColor} mt-2 opacity-60 font-bold uppercase`}>Add a record using the floating button below.</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="relative pl-12 md:pl-16 timeline-node">
                  {/* Category Node Icon */}
                  <div className={`absolute left-0 top-6 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl z-10 glass border-2 ${getCategoryColor(event.category).split(' ')[2]}`}>
                    {event.category === 'Labs' ? '📈' : event.category === 'Surgeries' ? '🏥' : '💊'}
                  </div>
                  
                  {/* Card (20px Title, 14px Body) */}
                  <div className={`${cardBg} p-8 md:p-10 rounded-[2.5rem] shadow-lg relative group border border-slate-400/10 overflow-hidden`}>
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                      <div className="flex-1">
                        <span className={`text-[12px] font-black uppercase tracking-widest px-4 py-1 rounded-full border ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                        <h4 className={`text-[20px] font-black ${textColor} mt-4 tracking-tight uppercase leading-none`}>
                          {event.title}
                        </h4>
                      </div>
                      <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-4">
                        <span className={`text-[14px] font-bold uppercase tracking-wide ${subTextColor} opacity-60`}>
                          {event.date}
                        </span>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); window.deleteMedicalRecord(event.id); }}
                          className="delete-btn w-9 h-9 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all shadow-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <p className={`text-[14px] ${textColor} leading-relaxed font-bold uppercase mb-6`}>
                      {event.summary}
                    </p>
                    
                    {event.notes && (
                      <div className="bg-black/5 p-6 rounded-2xl border-l-4 border-red-600 mb-6">
                        <p className={`text-[14px] ${subTextColor} font-medium leading-relaxed`}>
                          {event.notes}
                        </p>
                      </div>
                    )}
                    
                    {event.fileUrl && (
                      <div className="pt-6 border-t border-slate-400/10">
                        <button 
                          onClick={() => window.open(event.fileUrl, '_blank')}
                          className="group flex items-center space-x-3 text-blue-600 hover:text-blue-500 transition-colors"
                        >
                          <div className="p-3 bg-blue-600/10 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </div>
                          <span className="text-[14px] font-black uppercase tracking-widest">Secure Document View</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Summary Card */}
        <div className="space-y-10">
          <div className={`glass p-10 rounded-[3rem] border-2 border-red-600/30 sticky top-24 shadow-xl`}>
            <div className="flex items-center space-x-3 mb-8">
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
              </span>
              <h3 className="text-red-600 font-black text-sm uppercase tracking-widest">Current Health Snapshot</h3>
            </div>
            <div className={`${textColor} text-[14px] leading-relaxed whitespace-pre-line font-bold uppercase`}>
              {loadingSummary ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-black/10 rounded w-full"></div>
                  <div className="h-4 bg-black/10 rounded w-5/6"></div>
                  <div className="h-4 bg-black/10 rounded w-3/4"></div>
                </div>
              ) : summary}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-12 right-12 bg-red-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center space-x-4 hover:scale-105 hover:bg-red-700 active:scale-95 transition-all z-[100] group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-black uppercase tracking-widest text-lg">+ Add Medical Record</span>
      </button>

      {/* Entry Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowModal(false)}></div>
          <div className={`${cardBg} w-full max-w-2xl p-10 md:p-14 rounded-[3.5rem] relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] border-2 border-white/10`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className={`text-3xl font-black ${textColor} uppercase tracking-tight`}>Log Health Event</h3>
              <button onClick={() => setShowModal(false)} className="text-red-600 hover:text-red-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveEntry} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[12px] font-black uppercase tracking-widest ${textColor} opacity-60 mb-2 px-2`}>Category</label>
                  <select value={newEntry.category} onChange={e => setNewEntry({...newEntry, category: e.target.value as TimelineCategory})} className={inputClass}>
                    <option value="Labs">📈 Lab Result</option>
                    <option value="Surgeries">🏥 Surgery</option>
                    <option value="Prescriptions">💊 Prescription</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-[12px] font-black uppercase tracking-widest ${textColor} opacity-60 mb-2 px-2`}>Event Date</label>
                  <input type="date" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} className={inputClass} />
                </div>
              </div>
              
              <div>
                <label className={`block text-[12px] font-black uppercase tracking-widest ${textColor} opacity-60 mb-2 px-2`}>Entry Title</label>
                <input type="text" placeholder="e.g. Annual Checkup" value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} className={inputClass} required />
              </div>

              <div>
                <label className={`block text-[12px] font-black uppercase tracking-widest ${textColor} opacity-60 mb-2 px-2`}>Short Note / Summary</label>
                <textarea placeholder="Briefly summarize findings..." value={newEntry.summary} onChange={e => setNewEntry({...newEntry, summary: e.target.value})} className={`${inputClass} h-32 resize-none`} />
              </div>

              {/* Styled File Upload */}
              <div className="p-8 bg-black/10 rounded-2xl border-2 border-dashed border-slate-400/30 text-center hover:border-red-500/50 transition-colors group/file">
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover/file:bg-red-600/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-400 group-hover/file:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <span className={`block text-[14px] font-black uppercase tracking-widest ${textColor} opacity-70`}>Secure File Upload (PDF/Image)</span>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Encrypted Local Persistence</p>
                  </div>
                  <input 
                    type="file" 
                    id="file-upload"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange} 
                    className="hidden"
                  />
                </label>
                {newEntry.fileName && (
                  <div className="mt-6 flex items-center justify-center text-green-600 space-x-3 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[14px] font-black uppercase tracking-widest">{newEntry.fileName} Attached</span>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-5 bg-red-600 text-white font-black rounded-3xl text-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all uppercase tracking-tight italic">
                Save Secure Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};