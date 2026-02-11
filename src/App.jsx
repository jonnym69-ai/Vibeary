import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Headphones, 
  Loader2, 
  AlertCircle, 
  ExternalLink, 
  Mic2, 
  History, 
  Trash2, 
  ChevronRight,
  Zap,
  Moon,
  Compass,
  Flame,
  Dices
} from 'lucide-react';

const AFFILIATE_TAG = "";

const App = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [activeArchetype, setActiveArchetype] = useState('Epic');

  const getEnvKey = () => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
      }
    } catch {
      // Silent fail for environments where import.meta is restricted
    }
    
    return "";
  };

  const apiKey = getEnvKey();
  const modelName = "gemini-2.5-flash-preview-09-2025";

  const archetypes = [
    { id: 'Epic', icon: <Compass size={14} />, label: 'Epic' },
    { id: 'Gritty', icon: <Moon size={14} />, label: 'Gritty' },
    { id: 'Fast', icon: <Zap size={14} />, label: 'Fast' },
    { id: 'Deep', icon: <Flame size={14} />, label: 'Deep' },
  ];

  const getAIRecommendation = async (bookTitle, isSurprise = false) => {
    if (!isSurprise && !bookTitle.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      if (!apiKey) {
        throw new Error("Missing API Key. Add VITE_GEMINI_API_KEY to your .env file.");
      }

      const systemPrompt = "You are Vibeary, a premium audiobook curator. Recommend ONE real book. Focus on narrator quality. Return valid JSON.";
      
      const userQuery = isSurprise 
        ? `Surprise me with a legendary audiobook in the "${activeArchetype}" category. Pick something widely acclaimed but unique.` 
        : `I loved the book "${bookTitle}". Suggest a similar audiobook with a "${activeArchetype}" vibe.`;

      const finalQuery = `${userQuery} Include: title, author, narrator, vibe (2 words), match_score (85-99), and match_reason (1 short, punchy sentence).`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { 
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  author: { type: "STRING" },
                  narrator: { type: "STRING" },
                  vibe: { type: "STRING" },
                  match_score: { type: "NUMBER" },
                  match_reason: { type: "STRING" }
                }
              }
            }
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Vibeary is over-capacity. Try again in a second.");
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!resultText) throw new Error("Vibeary couldn't find a match. Try a different book.");
      
      const result = JSON.parse(resultText);
      
      const newRec = { ...result, id: Date.now() };
      setRecommendation(newRec);
      setHistory(prev => [newRec, ...prev].slice(0, 5));
      if (isSurprise) setQuery('');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMarketLink = (item) => {
    const term = encodeURIComponent(`${item.title} ${item.narrator} audiobook`);
    const tag = AFFILIATE_TAG ? `&tag=${AFFILIATE_TAG}` : "";
    return `https://www.amazon.com/s?k=${term}${tag}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 max-w-md mx-auto pb-32 selection:bg-amber-500/30">
      <header className="text-center mb-10 animate-in fade-in duration-700">
        <h1 className="text-4xl font-black tracking-tighter text-white">
          VIBE<span className="text-amber-500 italic">ARY</span>
        </h1>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-1">Audio Scout v1.2.6</p>
      </header>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {archetypes.map((arch) => (
          <button
            key={arch.id}
            onClick={() => setActiveArchetype(arch.id)}
            className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${
              activeArchetype === arch.id 
              ? 'bg-amber-600/20 border-amber-500 text-amber-500 shadow-lg shadow-amber-900/20' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            {arch.icon}
            <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">{arch.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-10">
        <div className="relative group">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getAIRecommendation(query)}
            placeholder={`Search ${activeArchetype} favorites...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all placeholder:text-slate-700 shadow-2xl"
          />
          <button 
            onClick={() => getAIRecommendation(query)}
            disabled={loading || !query}
            className="absolute right-3 top-3 bottom-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 px-5 rounded-xl transition-all flex items-center justify-center min-w-[50px]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </div>
        
        <button 
          onClick={() => getAIRecommendation('', true)}
          disabled={loading}
          className="w-full bg-slate-900/50 border border-slate-800/50 hover:border-amber-500/50 hover:bg-amber-500/5 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all active:scale-[0.98]"
        >
          <Dices size={14} className="text-amber-500" />
          <span>Surprise Me</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-rose-400 text-xs">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {recommendation ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-amber-400 text-[10px] font-black uppercase tracking-wider">{recommendation.match_score}% Match</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <Mic2 size={12} /> {recommendation.vibe}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{recommendation.title}</h2>
          <p className="text-slate-400 text-sm mb-6">by {recommendation.author} • <span className="text-amber-500 font-medium">{recommendation.narrator}</span></p>

          <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 mb-8">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{recommendation.match_reason}"
            </p>
          </div>

          <a 
            href={getMarketLink(recommendation)}
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-white text-slate-950 py-4 rounded-xl text-sm font-black flex items-center justify-center space-x-2 hover:bg-amber-50 transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            <span>GET ON AUDIBLE / AMAZON</span>
            <ExternalLink size={16} />
          </a>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-20 opacity-20 border-2 border-dashed border-slate-900 rounded-3xl">
            <Headphones size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ready for input</p>
          </div>
        )
      )}

      {history.length > 1 && (
        <section className="mt-12 pb-10">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">Recents</h3>
            <button onClick={() => setHistory([])} className="text-slate-700 hover:text-rose-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {history.slice(1).map(item => (
              <div 
                key={item.id} 
                onClick={() => setRecommendation(item)}
                className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex justify-between items-center group cursor-pointer hover:bg-slate-900 transition-all"
              >
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-slate-400 group-hover:text-amber-500 truncate">{item.title}</p>
                </div>
                <ChevronRight size={16} className="text-slate-800 group-hover:text-white" />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 p-6 text-center z-50">
         <p className="text-[9px] text-slate-800 font-bold uppercase tracking-[0.5em]">VIBEARY SYSTEMS • 2026</p>
      </div>
    </div>
  );
};

export default App;
