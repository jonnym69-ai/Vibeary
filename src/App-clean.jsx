import React, { useState, useEffect, useCallback } from 'react';
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
  Dices,
  BookOpen
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from './components/StripePayment';
import SubscriptionManager from './components/SubscriptionManager';

const AFFILIATE_TAG = "";

const App = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [activeArchetype, setActiveArchetype] = useState('Epic');
  const [activeTab, setActiveTab] = useState('discover');
  const [userLibrary, setUserLibrary] = useState([]);
  const [publicBooks, setPublicBooks] = useState([]);
  const [isReading, setIsReading] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [useOllama, setUseOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState('disconnected');
  const [selectedModel, setSelectedModel] = useState('llama2');
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [clientSecret, setClientSecret] = useState('');

  const getEnvKey = () => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
      }
    } catch {
      return "";
    }
  };

  const apiKey = useOllama ? 'local' : getEnvKey();
  const modelName = "gemini-2.5-flash-preview-09-2025";

  const archetypes = [
    { id: 'Epic', icon: <Compass size={14} />, label: 'Epic' },
    { id: 'Gritty', icon: <Moon size={14} />, label: 'Gritty' },
    { id: 'Fast', icon: <Zap size={14} />, label: 'Fast' },
    { id: 'Deep', icon: <Flame size={14} />, label: 'Deep' },
  ];

  const getAIRecommendation = async (bookTitle, isSurprise = false) => {
    if (!isSurprise && !bookTitle.trim()) return;
    
    if (!isPremium) {
      setError('🔒 Premium feature! Upgrade to unlock AI recommendations and voice reading.');
      setShowUpgradeModal(true);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (useOllama) {
        result = await getOllamaRecommendation(bookTitle);
      } else {
        if (!apiKey) {
          throw new Error("Missing API Key. Add VITE_GEMINI_API_KEY to your .env file.");
        }

        const systemPrompt = "You are Vibeary, a premium audiobook curator. Recommend ONE real book. Focus on narrator quality. Return valid JSON.";
        
        const userQuery = isSurprise 
          ? `Surprise me with a legendary audiobook in "${activeArchetype}" category. Pick something widely acclaimed but unique.` 
          : `I loved book "${bookTitle}". Suggest a similar audiobook with a "${activeArchetype}" vibe.`;
        
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
          });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || "Vibeary is over-capacity. Try again in a second.");
        }

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!resultText) throw new Error("Vibeary couldn't find a match. Try a different book.");
        
        const parsedResult = JSON.parse(resultText);
        
        result = { ...parsedResult, id: Date.now(), source: 'gemini' };
      }
      
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

  const addToLibrary = (book) => {
    setUserLibrary(prev => [...prev, { ...book, id: Date.now(), addedDate: new Date() }]);
  };

  const removeFromLibrary = (bookId) => {
    setUserLibrary(prev => prev.filter(book => book.id !== bookId));
  };

  const searchPublicBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://gutendex.com/books?format=json&limit=20');
      const data = await response.json();
      
      if (data && data.books) {
        const formattedBooks = data.books.slice(0, 20).map(book => ({
          id: book.id,
          title: book.title,
          author: book.authors?.[0] || 'Unknown',
          subject: book.subjects?.[0] || 'Classic Literature',
          description: book.description?.substring(0, 200) || 'A classic public domain book available on Project Gutenberg.',
          gutenbergId: book.id,
          downloadUrl: `https://www.gutenberg.org/ebooks/${book.id}`,
          readUrl: `https://www.gutenberg.org/ebooks/${book.id}.txt.utf-8`
        }));
        setPublicBooks(formattedBooks);
      } else {
        setError('No books found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load public audiobooks');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') || 
        voice.name.includes('Amazon')
      ) || voices[0];
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = premiumVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      console.log(`Using voice: ${premiumVoice.name} (${premiumVoice.lang})`);
      
      window.speechSynthesis.speak(utterance);
    } else {
      setError('Speech synthesis not supported in this browser');
    }
  };

  const POPULAR_BOOKS = [
    { title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", year: 1965 },
    { title: "1984", author: "George Orwell", genre: "Dystopian", year: 1949 },
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1937 },
    { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", genre: "Fantasy", year: 1997 },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", year: 1925 },
    { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Classic", year: 1960 },
    { title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", year: 1813 },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Classic", year: 1951 },
    { title: "Brave New World", author: "Aldous Huxley", genre: "Dystopian", year: 1932 },
    { title: "The Lord of the Rings", author: "J.R.R. Tolkien", genre: "Fantasy", year: 1954 }
  ];

  const getOllamaRecommendation = async (bookTitle) => {
    if (ollamaStatus !== 'ready') {
      setError(`Ollama not ready (${ollamaStatus}). Please check Ollama status.`);
      return;
    }
    
    try {
      setLoading(true);
      
      const enhancedPrompt = `You are an expert audiobook recommendation AI. Based on user's interest in "${bookTitle}", recommend a similar audiobook.

POPULAR BOOKS REFERENCE:
${POPULAR_BOOKS.map(book => `- ${book.title} by ${book.author} (${book.genre}, ${book.year})`).join('\n')}

RECOMMENDATION RULES:
1. Choose from popular audiobooks or similar well-known books
2. Match genre, tone, and complexity level
3. Prioritize books with good audiobook versions
4. Consider narrator quality and production value
5. Return in this exact JSON format:
{
  "title": "Book Title",
  "author": "Author Name", 
  "narrator": "Narrator Name",
  "vibe": "Genre/Style description",
  "match_score": 85-95,
  "match_reason": "Specific reason why this matches their interest"
}

User's current archetype: ${activeArchetype}
Book they're interested in: "${bookTitle}"

Provide the best possible recommendation:`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: enhancedPrompt
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ollama request failed');
      }
      
      const result = await response.json();
      if (result.response) {
        try {
          const rec = JSON.parse(result.response);
          const newRec = { ...rec, id: Date.now(), source: 'ollama' };
          setRecommendation(newRec);
          setHistory(prev => [newRec, ...prev].slice(0, 5));
        } catch {
          const textResponse = result.response;
          
          const titleMatch = textResponse.match(/"title":\s*"([^"]+)"/);
          const authorMatch = textResponse.match(/"author":\s*"([^"]+)"/);
          const narratorMatch = textResponse.match(/"narrator":\s*"([^"]+)"/);
          const vibeMatch = textResponse.match(/"vibe":\s*"([^"]+)"/);
          const scoreMatch = textResponse.match(/"match_score":\s*(\d+)/);
          const reasonMatch = textResponse.match(/"match_reason":\s*"([^"]+)"/);
          
          if (titleMatch && authorMatch && narratorMatch && vibeMatch && scoreMatch && reasonMatch) {
            const rec = {
              title: titleMatch[1],
              author: authorMatch[1], 
              narrator: narratorMatch[1],
              vibe: vibeMatch[1],
              match_score: parseInt(scoreMatch[1]),
              match_reason: reasonMatch[1]
            };
            const newRec = { ...rec, id: Date.now(), source: 'ollama' };
            setRecommendation(newRec);
            setHistory(prev => [newRec, ...prev].slice(0, 5));
          } else {
            throw new Error('Invalid response format from Ollama');
          }
        }
      } else {
        throw new Error('No response from Ollama');
      }
      setLoading(false);
    } catch (err) {
      setError(`Ollama error: ${err.message}`);
      setLoading(false);
    }
  };

  const checkOllamaStatus = useCallback(async () => {
    try {
      const tagsResponse = await fetch('http://localhost:11434/api/tags');
      if (!tagsResponse.ok) {
        setOllamaStatus('disconnected');
        return;
      }
      
      const tags = await tagsResponse.json();
      if (!tags.models || tags.models.length === 0) {
        setOllamaStatus('no-models');
        return;
      }
      
      const modelExists = tags.models.some(model => model.name === selectedModel);
      if (!modelExists) {
        setOllamaStatus('model-missing');
        return;
      }
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: 'test'
        })
      });
      
      if (response.ok) {
        setOllamaStatus('ready');
      } else {
        setOllamaStatus('disconnected');
      }
    } catch {
      setOllamaStatus('disconnected');
    }
  }, [selectedModel]);

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(false);
    setClientSecret('pi_demo_secret_key_123456789');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setIsPremium(true);
    setShowPaymentModal(false);
    setError('🎉 Welcome to Premium! Your features are now unlocked.');
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setClientSecret('');
  };

  const handleSubscriptionCancel = () => {
    setIsPremium(false);
    setError('Premium subscription cancelled. You can upgrade again anytime!');
  };

  const getMarketLink = (item) => {
    const term = encodeURIComponent(`${item.title} ${item.narrator} audiobook`);
    const tag = AFFILIATE_TAG ? `&tag=${AFFILIATE_TAG}` : "";
    return `https://www.amazon.com/s?k=${term}${tag}`;
  };

  useEffect(() => {
    checkOllamaStatus();
  }, [checkOllamaStatus]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-32 selection:bg-amber-500/30">
      <header className="text-center mb-6 animate-in fade-in duration-700 px-4 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
            VIBE<span className="text-amber-500 italic">ARY</span>
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPremium(false)}
              className="px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all transform hover:scale-105 bg-slate-700 text-slate-300 hover:bg-slate-600"
            >
              🆓 FREE
            </button>
            <button
              onClick={() => setIsPremium(true)}
              className="px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all transform hover:scale-105 bg-amber-600 text-white shadow-lg shadow-amber-500/20"
            >
              💎 PREMIUM
            </button>
          </div>
        </div>
        <p className="text-slate-500 text-[10px] md:text-[12px] uppercase font-bold tracking-[0.4em]">
          {isPremium ? 'Audio Scout v2.0 - Premium Mobile' : 'Audio Scout v2.0 - Free Mobile'}
        </p>
      </header>

      <div className="flex overflow-x-auto overflow-y-hidden mb-6 border-b border-slate-800 md:space-x-1">
        <button
          onClick={() => setActiveTab('discover')}
          className="flex-shrink-0 px-3 py-3 text-sm font-medium transition-colors border-b-2 text-slate-500 border-transparent hover:text-slate-300"
        >
          <span className="flex items-center">
            <Search size={16} className="mr-1" />
            <span className="hidden sm:inline">Discover</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className="flex-shrink-0 px-3 py-3 text-sm font-medium transition-colors border-b-2 text-slate-500 border-transparent hover:text-slate-300"
        >
          <span className="flex items-center">
            <BookOpen size={16} className="mr-1" />
            <span className="hidden sm:inline">Library</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className="flex-shrink-0 px-3 py-3 text-sm font-medium transition-colors border-b-2 text-slate-500 border-transparent hover:text-slate-300"
        >
          <span className="flex items-center">
            <Headphones size={16} className="mr-1" />
            <span className="hidden sm:inline">Browse Free</span>
          </span>
        </button>
      </div>

      <div className="px-4 md:p-6 max-w-2xl md:mx-auto md:max-w-md">
        {activeTab === 'discover' && (
          <div>
            {!isPremium && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-3 text-amber-400 text-xs">
                <Sparkles size={16} />
                <span>Upgrade to Premium to unlock AI-powered recommendations and voice reading!</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {archetypes.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => setActiveArchetype(arch.id)}
                  disabled={!isPremium}
                  className="flex flex-col items-center justify-center py-3 rounded-xl border transition-all bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
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
                  placeholder={isPremium ? `Search ${activeArchetype} favorites...` : '🔒 Premium feature - Upgrade to unlock AI search'}
                  disabled={!isPremium}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all placeholder:text-slate-700 shadow-2xl"
                />
                <button 
                  onClick={() => getAIRecommendation(query)}
                  disabled={loading || !query || !isPremium}
                  className="absolute right-3 top-3 bottom-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 px-5 rounded-xl transition-all flex items-center justify-center min-w-[50px]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => getAIRecommendation('', true)}
              disabled={loading || !isPremium}
              className="w-full bg-slate-900/50 border border-slate-800/50 hover:border-amber-500/50 hover:bg-amber-500/5 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all active:scale-[0.98]"
            >
              <Dices size={14} className="text-amber-500" />
              <span>{isPremium ? 'Surprise Me' : '🔒 Premium Feature'}</span>
            </button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-rose-400 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {recommendation && (
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
                className="w-full bg-white text-slate-950 py-4 rounded-xl text-sm font-black flex items-center justify-center space-x-2 hover:bg-amber-50 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
              >
                <span>GET ON AUDIBLE / AMAZON</span>
                <ExternalLink size={16} />
              </a>
            </div>
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
        </div>
      )}

      {activeTab === 'library' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">My Library</h2>
            <p className="text-slate-400 mb-6">
              {isPremium ? 'Your personal audiobook collection' : 'Your personal book collection - Upgrade to Premium for voice reading!'}
            </p>
          </div>
              
          {userLibrary.length === 0 ? (
            <div className="text-center py-20 opacity-20 border-2 border-dashed border-slate-900 rounded-3xl">
              <BookOpen size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Your library is empty</p>
              <p className="text-sm text-slate-400 mt-2">Add books from Discover or Browse tabs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userLibrary.map(book => (
                <div key={book.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center group hover:bg-slate-800 transition-all">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{book.title}</h3>
                    <p className="text-slate-400 text-sm mb-2">by {book.author}</p>
                    <p className="text-xs text-slate-500 mt-1">Added {book.addedDate.toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setCurrentBook(book)}
                      disabled={!isPremium}
                      className="px-3 py-2 rounded-lg transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-not-allowed"
                    >
                      📖 {isPremium ? 'Read' : '🔒 Premium'}
                    </button>
                    <button 
                      onClick={() => removeFromLibrary(book.id)}
                      className="px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'browse' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Browse Free Audiobooks</h2>
            <p className="text-slate-400 mb-6">Public domain classics from Project Gutenberg</p>
          </div>
          
          <div className="mb-4">
            <button 
              onClick={searchPublicBooks}
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 px-6 py-3 rounded-xl text-white font-black transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Search size={20} className="mr-2" />}
              Search Project Gutenberg
            </button>
          </div>
          
          {publicBooks.length === 0 ? (
            <div className="text-center py-20 opacity-20 border-2 border-dashed border-slate-900 rounded-3xl">
              <Headphones size={48} className="mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Search for free books</p>
            </div>
          ) : (
            <div className="space-y-3">
              {publicBooks.map(book => (
                <div key={book.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:bg-slate-800 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{book.title}</h3>
                      <p className="text-slate-400 text-sm mb-2">by {book.author}</p>
                      <p className="text-xs text-slate-500 mb-3">{book.subject}</p>
                    </div>
                    <button 
                      onClick={() => addToLibrary(book)}
                      className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors text-sm"
                    >
                      ➕ Add to Library
                    </button>
                  </div>
                  
                  <div className="flex space-x-2 mt-3 pt-3 border-t border-slate-700">
                    <a 
                      href={book.readUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                    >
                      📖 Read Online
                    </a>
                    <a 
                      href={book.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                    >
                      📥 Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isReading && currentBook && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">📖 Reading Mode</h2>
              <button 
                onClick={() => setIsReading(false)}
                className="px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-4">{currentBook.title}</h3>
              <p className="text-slate-400 text-sm mb-6">by {currentBook.author}</p>
            </div>
            
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 mb-8">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                {currentBook.description || "No description available."}
              </p>
              <button 
                onClick={() => speakText(currentBook.description || "No description available.")}
                disabled={!isPremium}
                className="w-full rounded-lg transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-not-allowed"
              >
                {isPremium ? '🔊 Read Aloud' : '🔒 Premium Feature - Upgrade for Voice Reading'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 p-6 text-center z-50">
        <p className="text-[9px] text-slate-800 font-bold uppercase tracking-[0.5em]">VIBEARY SYSTEMS • 2026</p>
      </div>
    </div>
  );
};

export default App;
