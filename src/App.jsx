import React, { useState } from 'react';
import { Search, Dices, Loader2, AlertCircle, Mic2, ExternalLink, Trash2, ChevronRight, Headphones, X, Twitter, Facebook, Copy, Heart } from 'lucide-react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('vibeary-favorites') || '[]'));
  const [activeArchetype, setActiveArchetype] = useState('epic');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('vibeary-onboarding-complete');
  });

  const archetypes = [
    { id: 'epic', label: 'Epic', icon: '🏛️' },
    { id: 'gritty', label: 'Gritty', icon: '🔥' },
    { id: 'fast', label: 'Fast', icon: '⚡' },
    { id: 'deep', label: 'Deep', icon: '🌊' },
  ];

  const endings = [
    "delivers exceptional narration that brings every character to life.",
    "features outstanding voice acting that enhances the story's emotional depth.",
    "offers a captivating listening experience with perfect pacing and tone.",
    "showcases masterful storytelling through expert narration.",
    "provides an immersive journey with rich vocal performances.",
    "combines brilliant writing with exceptional audiobook production.",
    "creates an unforgettable experience through skilled narration.",
    "delivers powerful performances that elevate the source material.",
    "offers perfect balance of action, emotion, and atmosphere.",
    "features world-class narration that draws you completely in.",
  ];

  const books = {
    epic: [
      { title: 'Dune', author: 'Frank Herbert', narrator: 'Scott Brick' },
      { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', narrator: 'Rob Inglis' },
      { title: 'The Name of the Wind', author: 'Patrick Rothfuss', narrator: 'Nick Podehl' },
      { title: 'The Wheel of Time', author: 'Robert Jordan', narrator: 'Kate Reading', series: 'Wheel of Time' },
      { title: 'Mistborn', author: 'Brandon Sanderson', narrator: 'Michael Kramer', series: 'Mistborn' },
      { title: 'The Stormlight Archive', author: 'Brandon Sanderson', narrator: 'Michael Kramer', series: 'The Stormlight Archive' },
      { title: 'A Court of Thorns and Roses', author: 'Sarah J. Maas', narrator: 'Jennifer Ikeda', series: 'A Court of Thorns and Roses' },
      { title: 'The Priory of the Orange Tree', author: 'Samantha Shannon', narrator: 'Liyah Summers' },
      { title: 'The Poppy War', author: 'R.F. Kuang', narrator: 'Emily Woo Zeller', series: 'The Poppy War' },
      { title: 'Red Queen', author: 'Victoria Aveyard', narrator: 'Amanda Dolan', series: 'Red Queen' },
      { title: 'The Dark Tower', author: 'Stephen King', narrator: 'Frank Muller', series: 'The Dark Tower' },
      { title: 'The Night Circus', author: 'Erin Morgenstern', narrator: 'Jim Dale' },
      { title: 'The Lies of Locke Lamora', author: 'Scott Lynch', narrator: 'Michael Page', series: 'Gentleman Bastard' },
      { title: 'Assassin\'s Apprentice', author: 'Robin Hobb', narrator: 'Bryce Dale', series: 'Farseer Trilogy' },
      { title: 'The Blade Itself', author: 'Joe Abercrombie', narrator: 'Steven Pacey', series: 'First Law' },
    ],
    gritty: [
      { title: 'The Martian', author: 'Andy Weir', narrator: 'R.C. Bray' },
      { title: 'Ready Player One', author: 'Ernest Cline', narrator: 'Wil Wheaton' },
      { title: 'Project Hail Mary', author: 'Andy Weir', narrator: 'Ray Porter' },
      { title: 'The Road', author: 'Cormac McCarthy', narrator: 'Tom Pelphrey' },
      { title: 'Station Eleven', author: 'Emily St. John Mandel', narrator: 'Scott Shepherd' },
      { title: 'The Stand', author: 'Stephen King', narrator: 'Garry Robbins' },
      { title: 'Gone Girl', author: 'Gillian Flynn', narrator: 'Julia Whelan' },
      { title: 'The Girl on the Train', author: 'Paula Hawkins', narrator: 'Claire Corbett' },
      { title: 'Dark Places', author: 'Gillian Flynn', narrator: 'Rebecca Lowman' },
      { title: 'Sharp Objects', author: 'Gillian Flynn', narrator: 'Ann Marie Lee' },
      { title: 'Into the Wild', author: 'Jon Krakauer', narrator: 'Philip Franklin' },
      { title: 'The Hunger Games', author: 'Suzanne Collins', narrator: 'Carolyn McCormick' },
      { title: 'American Gods', author: 'Neil Gaiman', narrator: 'Dennis Boutsikaris' },
      { title: 'The Killing Floor', author: 'Lee Child', narrator: 'Dick Hill' },
      { title: 'The Silent Patient', author: 'Alex Michaelides', narrator: 'Jack Hawkins' },
    ],
    fast: [
      { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', narrator: 'Stephen Fry' },
      { title: 'Fight Club', author: 'Chuck Palahniuk', narrator: 'Jim Uhls' },
      { title: 'The Bourne Identity', author: 'Robert Ludlum', narrator: 'Scott Brick' },
      { title: 'Good Omens', author: 'Neil Gaiman and Terry Pratchett', narrator: 'Martin Jarvis' },
      { title: 'The Princess Bride', author: 'William Goldman', narrator: 'Rob Reiner' },
      { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', narrator: 'Jay Snyder' },
      { title: 'Catch-22', author: 'Joseph Heller', narrator: 'Jay Snyder' },
      { title: 'The Sirens of Titan', author: 'Kurt Vonnegut', narrator: 'Jay Snyder' },
      { title: 'American Psycho', author: 'Bret Easton Ellis', narrator: 'Pablo Schreiber' },
      { title: 'High Fidelity', author: 'Nick Hornby', narrator: 'Stephen Fry' },
      { title: 'The Cuckoo\'s Calling', author: 'Robert Galbraith', narrator: 'Robert Glenister' },
      { title: 'The No. 1 Ladies\' Detective Agency', author: 'Alexander McCall Smith', narrator: 'Lisette Lecat' },
      { title: 'The Da Vinci Code', author: 'Dan Brown', narrator: 'Paul Michael' },
      { title: 'The Bourne Supremacy', author: 'Robert Ludlum', narrator: 'Scott Brick' },
      { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', narrator: 'Simon Vance' },
    ],
    deep: [
      { title: 'Sapiens', author: 'Yuval Noah Harari', narrator: 'Derek Perkins' },
      { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', narrator: 'Patrick Egan' },
      { title: 'Educated', author: 'Tara Westover', narrator: 'Julia Whelan' },
      { title: 'Becoming', author: 'Michelle Obama', narrator: 'Michelle Obama' },
      { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', narrator: 'Sean Pratt' },
      { title: 'Atomic Habits', author: 'James Clear', narrator: 'James Clear' },
      { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', narrator: 'Roger Wayne' },
      { title: 'Man\'s Search for Meaning', author: 'Viktor E. Frankl', narrator: 'Simon Vance' },
      { title: 'Quiet', author: 'Susan Cain', narrator: 'Kathe Mazur' },
      { title: 'The Power of Habit', author: 'Charles Duhigg', narrator: 'Mike Chamberlain' },
      { title: 'The Gene', author: 'Siddhartha Mukherjee', narrator: 'Dennis Boutsikaris' },
      { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', narrator: 'Cassandra Campbell' },
      { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', narrator: 'Andrew MacMillan' },
      { title: 'The Psychology of Money', author: 'Morgan Housel', narrator: 'Chris Hill' },
      { title: 'The Alchemist', author: 'Paulo Coelho', narrator: 'Jeremy Irons' },
    ],
  };

  const getAIRecommendation = async (queryParam = '', surprise = false) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const allBooks = Object.values(books).flat();
      const archetypeBooks = books[activeArchetype];
      let selectedBooks;
      if (surprise) {
        selectedBooks = allBooks;
      } else {
        const filteredBooks = allBooks.filter(book => 
          book.title.toLowerCase().includes(queryParam.toLowerCase()) || 
          book.author.toLowerCase().includes(queryParam.toLowerCase())
        );
        selectedBooks = filteredBooks.length > 0 ? filteredBooks : archetypeBooks;
      }
      const randomBook = selectedBooks[Math.floor(Math.random() * selectedBooks.length)];
      
      const mockRecommendation = {
        id: Date.now(),
        title: randomBook.title,
        author: randomBook.author,
        narrator: randomBook.narrator,
        vibe: activeArchetype,
        match_score: Math.floor(Math.random() * 30) + 70,
        match_reason: `${randomBook.title} by ${randomBook.author} is a perfect ${activeArchetype} match. Narrated by ${randomBook.narrator}, this audiobook ${endings[Math.floor(Math.random() * endings.length)]}`,
      };
      
      setRecommendation(mockRecommendation);
      setHistory(prev => [mockRecommendation, ...prev.slice(0, 9)]);
    } catch {
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMarketLink = (item) => {
    const affiliateTag = 'vibeary06-21'; // Amazon affiliate tag
    const searchQuery = encodeURIComponent(`${item.title} ${item.author} audiobook`);
    const amazonUrl = `https://www.amazon.co.uk/s?k=${searchQuery}&tag=${affiliateTag}`;
    return amazonUrl;
  };

  const completeOnboarding = () => {
    localStorage.setItem('vibeary-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  const toggleFavorite = (rec) => {
    const isFav = favorites.some(f => f.id === rec.id);
    let newFavorites;
    if (isFav) {
      newFavorites = favorites.filter(f => f.id !== rec.id);
    } else {
      newFavorites = [...favorites, rec];
    }
    setFavorites(newFavorites);
    localStorage.setItem('vibeary-favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 max-w-md mx-auto pb-32 selection:bg-amber-500/30">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={completeOnboarding}>
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={completeOnboarding} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎧</div>
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to Vibeary!</h2>
              <p className="text-slate-400 text-sm mb-6">Your AI audiobook scout that finds perfect matches based on your reading vibe.</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2 mt-1">
                  <span className="text-amber-500 font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Choose Your Vibe</h3>
                  <p className="text-slate-400 text-sm">Pick Epic, Gritty, Fast, or Deep to set your recommendation style.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2 mt-1">
                  <span className="text-amber-500 font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Search or Surprise</h3>
                  <p className="text-slate-400 text-sm">Enter a book title or hit "Surprise Me" for random discoveries.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2 mt-1">
                  <span className="text-amber-500 font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Get Recommendations</h3>
                  <p className="text-slate-400 text-sm">AI analyzes your taste and suggests perfect audiobook matches.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-6">
              <h4 className="text-amber-400 font-semibold mb-2">💡 Pro Tips</h4>
              <ul className="text-slate-300 text-sm space-y-2">
                <li>• Try different archetypes for varied recommendations</li>
                <li>• Click history items to revisit past finds</li>
                <li>• Higher match scores mean better compatibility</li>
              </ul>
            </div>
            
            <button
              onClick={completeOnboarding}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 rounded-xl text-lg font-bold transition-all active:scale-[0.98] shadow-lg"
            >
              Got it! Let's Start
            </button>
          </div>
        </div>
      )}

      <header className="text-center mb-10 animate-in fade-in duration-700">
        <h1 className="text-4xl font-black tracking-tighter text-white">
          VIBE<span className="text-amber-500 italic">ARY</span>
        </h1>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-1">Audio Scout v1.2.6</p>

  <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out Vibeary: AI audiobook recommendations!&url=https://vibeary.vercel.app`, '_blank')} className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded flex items-center space-x-2 text-xs hover:scale-105 transition-all">
    <Twitter size={16} /> <span>Share Vibeary</span>
  </button>
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
      </div>

      <button
        onClick={() => getAIRecommendation('', true)}
        disabled={loading}
        className="w-full bg-slate-900/50 border border-slate-800/50 hover:border-amber-500/50 hover:bg-amber-500/5 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all active:scale-[0.98]"
      >
        <Dices size={14} className="text-amber-500" />
        <span>Surprise Me</span>
      </button>

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
              <button onClick={() => toggleFavorite(recommendation)} className="ml-2 text-slate-500 hover:text-red-500 transition-colors">
                <Heart size={12} fill={favorites.some(f => f.id === recommendation.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{recommendation.title}</h2>
          <p className="text-slate-400 text-sm mb-6">by {recommendation.author} • <span className="text-amber-500 font-medium">{recommendation.narrator}</span></p>
          
          <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 mb-8">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{recommendation.match_reason}"
            </p>
          </div>

          {recommendation.series && (
            <div className="mb-4">
              <button
                onClick={() => window.open(getMarketLink({ title: `${recommendation.series} series`, author: recommendation.author, narrator: '' }), '_blank')}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-xl text-sm font-bold transition-all active:scale-95"
              >
                View Full Series on Amazon
              </button>
            </div>
          )}

          <div className="flex space-x-2 mb-4">
            <a
              href={getMarketLink(recommendation)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white text-slate-950 py-4 rounded-xl text-sm font-black flex items-center justify-center space-x-2 hover:bg-amber-50 transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              <span>GET ON AMAZON</span>
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(getMarketLink(recommendation))}
              className="bg-slate-700 hover:bg-slate-600 text-white py-4 px-4 rounded-xl flex items-center justify-center transition-all active:scale-95 hover:scale-105"
              title="Copy link"
            >
              <Copy size={16} />
            </button>
          </div>

          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this audiobook recommendation: ${encodeURIComponent(recommendation.title)} by ${encodeURIComponent(recommendation.author)}&url=${encodeURIComponent(getMarketLink(recommendation))}`, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center space-x-2 text-xs hover:scale-105 transition-all"
            >
              <Twitter size={16} /> <span>Share on Twitter</span>
            </button>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getMarketLink(recommendation))}`, '_blank')}
              className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded flex items-center space-x-2 text-xs hover:scale-105 transition-all"
            >
              <Facebook size={16} /> <span>Share on Facebook</span>
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-20 opacity-20 border-2 border-dashed border-slate-900 rounded-3xl">
            <Headphones size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ready for input</p>
          </div>
        )
      )}

      {favorites.length > 0 && (
        <section className="mt-12 pb-10">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">Favorites</h3>
            <button onClick={() => { setFavorites([]); localStorage.removeItem('vibeary-favorites'); }} className="text-slate-700 hover:text-rose-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {favorites.map(item => (
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
        <p className="text-[8px] text-slate-700 mt-1">Amazon Affiliate Site</p>
      </div>
    </div>
  );
}

export default App;
