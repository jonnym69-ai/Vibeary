// Trigger redeploy
import React, { useState, useEffect } from 'react'
import { Search, Dices, Loader2, AlertCircle, Mic2, ExternalLink, Trash2, ChevronRight, Headphones, X, Twitter, Facebook, Copy, Heart, Ghost, Lock, Sword, Zap, Clock, Brain } from 'lucide-react'
import { useAuth } from './AuthContext'
import AuthModal from './AuthModal';
import SubscriptionManager from './components/SubscriptionManager'
import { supabase } from './supabaseClient'
import OnboardModal from './components/OnboardModal';
import ProductForm from './components/ProductForm';
import Storefront from './components/Storefront';
import ConnectDashboard from './components/ConnectDashboard';
import LibraryImport from './components/LibraryImport';
import './App.css';

// Add Stripe Pricing Table script
const stripeScript = document.createElement('script');
stripeScript.src = 'https://js.stripe.com/v3/pricing-table.js';
stripeScript.async = true;
document.head.appendChild(stripeScript);

function App() {
  const { user, signOut } = useAuth()

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeArchetype, setActiveArchetype] = useState('epic');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('vibeary-onboarding-complete');
  });

  const [isPremium, setIsPremium] = useState(false)
  const [usage, setUsage] = useState(() => parseInt(localStorage.getItem('vibeary-usage') || '0'))
  const [showSubscription, setShowSubscription] = useState(false)

  // Stripe Connect state
  // const [showOnboard, setShowOnboard] = useState(false); // Removed for testing
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStorefront, setShowStorefront] = useState(false);
  const accountId = null; // Temporarily null for testing

  // Library import state
  const [showLibraryImport, setShowLibraryImport] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('premium_users').select('*').eq('user_id', user.id).then(({ data }) => {
        setIsPremium(data && data.length > 0)
      })
    }
  }, [user])

  useEffect(() => {
    if (user) {
      supabase.from('user_favorites').select('data').eq('user_id', user.id).then(async ({ data }) => {
        if (data && data.length > 0) {
          setFavorites(data[0].data);
        } else {
          const localFavorites = JSON.parse(localStorage.getItem('vibeary-favorites') || '[]');
          if (localFavorites.length > 0) {
            await supabase.from('user_favorites').insert({ user_id: user.id, data: localFavorites });
            setFavorites(localFavorites);
            localStorage.removeItem('vibeary-favorites');
          } else {
            setFavorites([]);
          }
        }
      });
    }
  }, [user])

  const premiumArchetypes = [
    { id: 'epic', label: 'Epic', icon: <Sword size={16} />, description: 'Grand adventures and heroic journeys' },
    { id: 'gritty', label: 'Gritty', icon: <Zap size={16} />, description: 'Raw, intense stories with edge' },
    { id: 'fast', label: 'Fast', icon: <Clock size={16} />, description: 'Quick reads, fast-paced action' },
    { id: 'deep', label: 'Deep', icon: <Brain size={16} />, description: 'Thought-provoking, philosophical narratives' },
    { id: 'romantic', label: 'Romantic', icon: <Heart size={16} />, description: 'Love stories and emotional journeys', premium: true },
    { id: 'mystery', label: 'Mystery', icon: '🔍', description: 'Thrilling mysteries and suspenseful plots', premium: true },
    { id: 'historical', label: 'Historical', icon: '📜', description: 'Stories set in the past with rich historical detail', premium: true },
    { id: 'scary', label: 'Scary', icon: <Ghost size={16} />, description: 'Horror and spine-tingling thrills', premium: true },
    { id: 'comedy', label: 'Comedy', icon: '😂', description: 'Humorous and funny stories', premium: true },
    { id: 'adventure', label: 'Adventure', icon: '🗺️', description: 'Exciting adventures and journeys', premium: true },
    { id: 'vibe-of-the-week', label: 'Vibe of the Week', icon: '⭐', description: 'Curated picks for the current trend', premium: true },
  ];

  const archetypes = premiumArchetypes;

  if (!user) return <AuthModal onClose={() => {}} />


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
      { title: 'Dune', author: 'Frank Herbert', narrator: 'Scott Brick', description: 'A sweeping epic of politics, religion, and ecology on the desert planet Arrakis.' },
      { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', narrator: 'Rob Inglis', description: 'An epic tale of good versus evil in Middle-earth, filled with adventure and heroism.' },
      { title: 'The Name of the Wind', author: 'Patrick Rothfuss', narrator: 'Nick Podehl', description: 'The story of a gifted young man who grows to be the most notorious magician his world has ever seen.' },
      { title: 'The Wheel of Time', author: 'Robert Jordan', narrator: 'Kate Reading', series: 'Wheel of Time', description: 'A complex epic fantasy with intricate world-building and a battle against the forces of darkness.' },
      { title: 'Mistborn', author: 'Brandon Sanderson', narrator: 'Michael Kramer', series: 'Mistborn', description: 'A heist story in a world where people ingest metals to gain magical abilities.' },
      { title: 'The Stormlight Archive', author: 'Brandon Sanderson', narrator: 'Michael Kramer', series: 'The Stormlight Archive', description: 'A massive epic with knights who ride giant birds and wield shardblades.' },
      { title: 'A Court of Thorns and Roses', author: 'Sarah J. Maas', narrator: 'Jennifer Ikeda', series: 'A Court of Thorns and Roses', description: 'A retelling of Beauty and the Beast with faeries, romance, and danger.' },
      { title: 'The Priory of the Orange Tree', author: 'Samantha Shannon', narrator: 'Liyah Summers', description: 'An epic standalone fantasy with dragons, queens, and ancient prophecies.' },
      { title: 'The Poppy War', author: 'R.F. Kuang', narrator: 'Emily Woo Zeller', series: 'The Poppy War', description: 'A grimdark fantasy inspired by Chinese history, following a war orphan turned soldier.' },
      { title: 'Red Queen', author: 'Victoria Aveyard', narrator: 'Amanda Dolan', series: 'Red Queen', description: 'A young woman discovers her blood has the ability to control shadows.' },
      { title: 'The Dark Tower', author: 'Stephen King', narrator: 'Frank Muller', series: 'The Dark Tower', description: 'A gunslinger pursues a man in black across a post-apocalyptic landscape.' },
      { title: 'The Night Circus', author: 'Erin Morgenstern', narrator: 'Jim Dale', description: 'A magical competition between two young illusionists in a mysterious circus.' },
      { title: 'The Lies of Locke Lamora', author: 'Scott Lynch', narrator: 'Bryce Dale', series: 'Gentleman Bastard', description: 'A con artist and his gang pull off elaborate heists in a richly detailed fantasy city.' },
      { title: 'Assassin\'s Apprentice', author: 'Robin Hobb', narrator: 'Bryce Dale', series: 'Farseer Trilogy', description: 'The story of Fitz, the bastard son of a prince, trained as an assassin.' },
      { title: 'The Blade Itself', author: 'Joe Abercrombie', narrator: 'Steven Pacey', series: 'First Law', description: 'A gritty fantasy with barbarians, torturers, and political intrigue.' },
      { title: 'The Way of Kings', author: 'Brandon Sanderson', narrator: 'Michael Kramer', series: 'The Stormlight Archive', description: 'The first book in a massive series about knights, storms, and ancient oaths.' },
      { title: 'Words of Radiance', author: 'Brandon Sanderson', narrator: 'Michael Kramer', series: 'The Stormlight Archive', description: 'Continuing the epic saga with deeper world-building and character development.' },
    ],
    gritty: [
      { title: 'The Martian', author: 'Andy Weir', narrator: 'R.C. Bray', description: 'An astronaut stranded on Mars must use his ingenuity to survive and find a way home.' },
      { title: 'Ready Player One', author: 'Ernest Cline', narrator: 'Wil Wheaton', description: 'In a dystopian future, a young man competes in a virtual reality game to win a fortune.' },
      { title: 'Project Hail Mary', author: 'Andy Weir', narrator: 'Ray Porter', description: 'A lone astronaut wakes up on a spaceship with amnesia and must solve a cosmic mystery.' },
      { title: 'The Road', author: 'Cormac McCarthy', narrator: 'Tom Pelphrey', description: 'A father and son journey through a post-apocalyptic wasteland in search of safety.' },
      { title: 'Station Eleven', author: 'Emily St. John Mandel', narrator: 'Scott Shepherd', description: 'A traveling symphony connects survivors of a devastating flu pandemic.' },
      { title: 'The Stand', author: 'Stephen King', narrator: 'Garry Robbins', description: 'A superflu wipes out most of humanity, leaving survivors to rebuild or destroy.' },
      { title: 'Gone Girl', author: 'Gillian Flynn', narrator: 'Julia Whelan', description: 'A woman disappears on her wedding anniversary, and her husband becomes the prime suspect.' },
      { title: 'The Girl on the Train', author: 'Paula Hawkins', narrator: 'Clare Corbett', description: 'A woman becomes entangled in a missing persons case she witnesses from her train.' },
      { title: 'Dark Places', author: 'Gillian Flynn', narrator: 'Rebecca Lowman', description: 'A woman investigates the murder of her family that occurred when she was a child.' },
      { title: 'Sharp Objects', author: 'Gillian Flynn', narrator: 'Ann Marie Lee', description: 'A troubled journalist returns to her hometown to cover a series of murders.' },
      { title: 'Into the Wild', author: 'Jon Krakauer', narrator: 'Philip Franklin', description: 'The true story of a young man who ventures into the Alaskan wilderness.' },
      { title: 'The Hunger Games', author: 'Suzanne Collins', narrator: 'Carolyn McCormick', description: 'In a dystopian future, children fight to the death in a televised spectacle.' },
      { title: 'American Gods', author: 'Neil Gaiman', narrator: 'Dennis Boutsikaris', description: 'A man is caught in a battle between old and new gods in modern America.' },
      { title: 'The Killing Floor', author: 'Lee Child', narrator: 'Dick Hill', description: 'A former military policeman investigates a murder in a small town.' },
      { title: 'The Silent Patient', author: 'Alex Michaelides', narrator: 'Jack Hawkins', description: 'A psychotherapist tries to understand why a patient murdered her husband and stopped speaking.' },
      { title: 'The Killing Floor', author: 'Lee Child', narrator: 'Dick Hill', description: 'A former military policeman investigates a murder in a small town.' },
      { title: 'Into the Wild', author: 'Jon Krakauer', narrator: 'Philip Franklin', description: 'The true story of a young man who ventures into the Alaskan wilderness.' },
    ],
    fast: [
      { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', narrator: 'Stephen Fry', description: 'A man is swept away from Earth and embarks on a series of bizarre adventures across the galaxy.' },
      { title: 'Fight Club', author: 'Chuck Palahniuk', narrator: 'Jim Uhls', description: 'An insomniac office worker forms an underground fight club with a soap salesman.' },
      { title: 'The Bourne Identity', author: 'Robert Ludlum', narrator: 'Scott Brick', description: 'A man with amnesia discovers he is a skilled assassin hunted by his former employers.' },
      { title: 'Good Omens', author: 'Neil Gaiman and Terry Pratchett', narrator: 'Martin Jarvis', description: 'An angel and a demon team up to prevent the apocalypse.' },
      { title: 'The Princess Bride', author: 'William Goldman', narrator: 'Rob Reiner', description: 'A swashbuckling adventure filled with true love, giants, revenge, and humor.' },
      { title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', narrator: 'Jay Snyder', description: 'A soldier\'s experiences in World War II and his time-traveling life.' },
      { title: 'Catch-22', author: 'Joseph Heller', narrator: 'Jay Snyder', description: 'A satirical novel about a World War II pilot caught in bureaucratic absurdity.' },
      { title: 'The Sirens of Titan', author: 'Kurt Vonnegut', narrator: 'Jay Snyder', description: 'A space-faring tale exploring the meaning of life and human purpose.' },
      { title: 'American Psycho', author: 'Bret Easton Ellis', narrator: 'Pablo Schreiber', description: 'A wealthy New York investment banker leads a double life as a serial killer.' },
      { title: 'High Fidelity', author: 'Nick Hornby', narrator: 'Stephen Fry', description: 'A record store owner reflects on his past relationships and music.' },
      { title: 'The Cuckoo\'s Calling', author: 'Robert Galbraith', narrator: 'Robert Glenister', description: 'A private detective investigates a supermodel\'s suspicious death.' },
      { title: 'The No. 1 Ladies\' Detective Agency', author: 'Alexander McCall Smith', narrator: 'Lisette Lecat', description: 'A woman starts Botswana\'s first female-owned detective agency.' },
      { title: 'The Da Vinci Code', author: 'Dan Brown', narrator: 'Paul Michael', description: 'A symbologist and cryptologist unravel a mystery involving secret societies.' },
      { title: 'The Bourne Supremacy', author: 'Robert Ludlum', narrator: 'Scott Brick', description: 'Jason Bourne is forced back into action when framed for a murder.' },
      { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', narrator: 'Simon Vance', description: 'A journalist and hacker investigate a decades-old disappearance.' },
      { title: 'The Bourne Supremacy', author: 'Robert Ludlum', narrator: 'Scott Brick', description: 'Jason Bourne is forced back into action when framed for a murder.' },
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
      { title: 'The Four Agreements', author: 'Don Miguel Ruiz', narrator: 'Peter Coyote' },
    ],
    romantic: [
      { title: 'Pride and Prejudice', author: 'Jane Austen', narrator: 'Rosamund Pike', description: 'A witty romance about Elizabeth Bennet and Mr. Darcy navigating love, class, and societal expectations in Regency England.' },
      { title: 'The Notebook', author: 'Nicholas Sparks', narrator: 'Patrick Lawlor', description: 'A poignant love story of two young people from different backgrounds who fall in love and are separated by fate.' },
      { title: 'Outlander', author: 'Diana Gabaldon', narrator: 'Davina Porter', description: 'A time-traveling nurse finds herself in 18th-century Scotland and falls in love with a Highland warrior.' },
      { title: 'Me Before You', author: 'Jojo Moyes', narrator: 'Steven Webb', description: 'A young woman is hired to care for a quadriplegic man, and their relationship challenges their views on life and love.' },
      { title: 'The Time Traveler\'s Wife', author: 'Audrey Niffenegger', narrator: 'Kirsten Potter', description: 'A man with a genetic disorder that causes him to time travel unpredictably, and his artist wife who has to cope with his frequent absences.' },
    ],
    mystery: [
      { title: 'The Girl on the Train', author: 'Paula Hawkins', narrator: 'Clare Corbett', description: 'A woman who takes the same train every day becomes entangled in a missing persons case that hits close to home.' },
      { title: 'Gone Girl', author: 'Gillian Flynn', narrator: 'Julia Whelan', description: 'A man becomes the prime suspect when his wife goes missing on their fifth wedding anniversary.' },
      { title: 'The Silent Patient', author: 'Alex Michaelides', narrator: 'Jack Hawkins', description: 'A psychotherapist becomes obsessed with a patient who has stopped speaking after murdering her husband.' },
      { title: 'Big Little Lies', author: 'Liane Moriarty', narrator: 'Caroline Lee', description: 'The lives of three women intertwine on the first day of kindergarten, leading to murder and mayhem.' },
      { title: 'The Woman in the Window', author: 'A.J. Finn', narrator: 'Kirsten Potter', description: 'An agoraphobic woman becomes convinced she has witnessed a crime in the house across the street.' },
    ],
    historical: [
      { title: 'The Book Thief', author: 'Markus Zusak', narrator: 'Allan Corduner', description: 'A young girl living in Nazi Germany steals books and shares them with others, narrated by Death itself.' },
      { title: 'The Pillars of the Earth', author: 'Ken Follett', narrator: 'John Lee', description: 'A master builder and his family struggle to build a cathedral amidst political and religious turmoil in 12th-century England.' },
      { title: 'Wolf Hall', author: 'Hilary Mantel', narrator: 'Simon Slater', description: 'The rise of Thomas Cromwell in the court of Henry VIII, exploring power, politics, and religion.' },
      { title: 'The Nightingale', author: 'Kristin Hannah', narrator: 'Polly Stone', description: 'Two sisters in France during World War II make different choices in their fight for survival and resistance.' },
      { title: 'All the Light We Cannot See', author: 'Anthony Doerr', narrator: 'Zach Appelman', description: 'A blind French girl and a German boy whose paths collide in occupied France during World War II.' },
    ],
    'vibe-of-the-week': [
      { title: 'Atomic Habits', author: 'James Clear', narrator: 'James Clear' },
      { title: 'The Midnight Library', author: 'Matt Haig', narrator: 'Carey Mulligan' },
      { title: 'Educated', author: 'Tara Westover', narrator: 'Julia Whelan' },
      { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', narrator: 'Alma Cuervo' },
      { title: 'Where the Crawdads Sing', author: 'Delia Owens', narrator: 'Cassandra Campbell' },
    ],
    comedy: [
      { title: 'Good Omens', author: 'Neil Gaiman and Terry Pratchett', narrator: 'Martin Jarvis', description: 'An angel and a demon team up to prevent the apocalypse in this hilarious take on the end of the world.' },
      { title: 'The Princess Bride', author: 'William Goldman', narrator: 'Rob Reiner', description: 'A swashbuckling adventure filled with true love, giants, revenge, and lots of humor.' },
      { title: 'High Fidelity', author: 'Nick Hornby', narrator: 'Stephen Fry', description: 'A record store owner reflects on his past relationships and the music that shaped his life.' },
    ],
    adventure: [
      { title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain', narrator: 'Various', description: 'A boy and a runaway slave embark on a journey down the Mississippi River, exploring freedom and friendship.' },
      { title: 'Treasure Island', author: 'Robert Louis Stevenson', narrator: 'Various', description: 'Young Jim Hawkins discovers a treasure map and sets sail on a pirate adventure.' },
      { title: 'The Call of the Wild', author: 'Jack London', narrator: 'Various', description: 'Buck, a domesticated dog, is thrust into the wild and must learn to survive.' },
    ],
    scary: [
      { title: 'The Shining', author: 'Stephen King', narrator: 'Campbell Scott', description: 'A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence, while his psychic son sees horrific forebodings from both past and future.' },
      { title: 'Dracula', author: 'Bram Stoker', narrator: 'Alan Cumming', description: 'The classic vampire tale of Count Dracula\'s attempt to move from Transylvania to England, and the group of people who band together to stop him.' },
      { title: 'Frankenstein', author: 'Mary Shelley', narrator: 'Dan Stevens', description: 'A young scientist creates a grotesque but sentient creature in an unorthodox experiment, leading to tragic consequences.' },
      { title: 'The Haunting of Hill House', author: 'Shirley Jackson', narrator: 'Bernadette Dunne', description: 'Four individuals stay at the notoriously haunted Hill House to investigate paranormal activity, but the house\'s malevolent presence begins to unravel their sanity.' },
    ],
  };

  const getAIRecommendation = async (queryParam = '', surprise = false) => {
    setLoading(true);
    setError('');
    
    if (usage >= 10 && !isPremium) {
      setError('Free users limited to 10 recommendations per day. Upgrade to premium for unlimited access.');
      setLoading(false);
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const allBooks = Object.values(books).flat();
      const archetypeBooks = books[activeArchetype];
      
      // Get user's library to avoid recommending owned books
      let userLibraryTitles = [];
      if (user && isPremium) {
        try {
          const { data: library } = await supabase
            .from('user_library')
            .select('title, author')
            .eq('user_id', user.id);
          
          if (library) {
            userLibraryTitles = library.map(book => ({
              title: book.title.toLowerCase(),
              author: book.author?.toLowerCase() || ''
            }));
          }
        } catch (err) {
          console.log('Could not fetch user library:', err);
        }
      }
      
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
      
      // Filter out books user already owns
      const availableBooks = selectedBooks.filter(book => {
        if (!isPremium) return true; // Free users don't have library filtering
        
        const bookTitle = book.title.toLowerCase();
        const bookAuthor = book.author.toLowerCase();
        
        return !userLibraryTitles.some(owned => 
          owned.title === bookTitle && 
          (owned.author === bookAuthor || owned.author === '' || bookAuthor === '')
        );
      });
      
      if (availableBooks.length === 0) {
        setError('You already own all books in this category! Try a different vibe or import fewer books.');
        setLoading(false);
        return;
      }
      
      const randomBook = availableBooks[Math.floor(Math.random() * availableBooks.length)];
      
      const mockRecommendation = {
        id: Date.now(),
        title: randomBook.title,
        author: randomBook.author,
        narrator: randomBook.narrator,
        vibe: activeArchetype,
        match_score: Math.floor(Math.random() * 30) + 70,
        match_reason: `${randomBook.title} by ${randomBook.author} is a perfect ${activeArchetype} match. ${randomBook.description || ''} Narrated by ${randomBook.narrator}, this audiobook ${endings[Math.floor(Math.random() * endings.length)]}`,
      };
      
      setRecommendation(mockRecommendation);
      setHistory(prev => [mockRecommendation, ...prev.slice(0, 9)]);
      
      // Increment usage
      setUsage(usage + 1);
      localStorage.setItem('vibeary-usage', usage + 1);
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

  const getRelatedBooks = (current) => {
    const archetypeBooks = books[current.vibe];
    return archetypeBooks.filter(b => b.title !== current.title).sort(() => 0.5 - Math.random()).slice(0, 3);
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
    if (user) {
      supabase.from('user_favorites').upsert({ user_id: user.id, data: newFavorites });
    }
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
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to Viberary!</h2>
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
          VIBE<span className="text-amber-500 italic">RARY</span>
        </h1>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-1">Audio Scout v1.2.6</p>

  <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out Viberary: AI audiobook recommendations!&url=https://viberary.vercel.app`, '_blank')} className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded flex items-center space-x-2 text-xs hover:scale-105 transition-all">
    <Twitter size={16} /> <span>Share Viberary</span>
  </button>
  {user && <button onClick={signOut} className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded text-xs ml-2">Logout</button>}
  {!isPremium && <button onClick={() => setShowSubscription(true)} className="bg-amber-600 hover:bg-amber-500 text-white py-2 px-4 rounded text-xs ml-2">Go Premium</button>}
  {user && accountId && <button onClick={() => setShowProductForm(true)} className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded text-xs ml-2">Create Product</button>}
  {user && <button onClick={() => setShowStorefront(true)} className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded text-xs ml-2">View Storefront</button>}
  {isPremium && <button onClick={() => setShowLibraryImport(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded text-xs ml-2">Import Library</button>}
      </header>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {archetypes.map((arch) => (
          <button
            key={arch.id}
            onClick={() => {
              if (arch.premium && !isPremium) {
                setShowSubscription(true);
              } else {
                setActiveArchetype(arch.id);
              }
            }}
            className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${
              activeArchetype === arch.id
                ? 'bg-amber-600/20 border-amber-500 text-amber-500 shadow-lg shadow-amber-900/20'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
            } ${arch.premium && !isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="relative mb-1">
              {arch.icon}
              {arch.premium && !isPremium && <Lock size={10} className="absolute -top-1 -right-1 text-amber-400" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{arch.label}</span>
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

          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-400 mb-4">You Might Also Like:</h3>
            <div className="space-y-3">
              {getRelatedBooks(recommendation).map(book => (
                <div key={book.title} className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-bold text-white">{book.title}</p>
                    <p className="text-xs text-slate-400">by {book.author}</p>
                    {book.description && <p className="text-xs text-slate-500 mt-1">{book.description}</p>}
                  </div>
                  <a href={getMarketLink(book)} target="_blank" rel="noopener noreferrer" className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded text-xs">Get on Amazon</a>
                </div>
              ))}
            </div>
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
        <button onClick={() => window.open('https://www.amazon.co.uk/s?k=audiobook+headphones&tag=vibeary06-21', '_blank')} className="bg-amber-500 hover:bg-amber-600 text-white py-1 px-3 rounded text-xs mt-2">Get Audiobook Headphones on Amazon</button>
      </div>

      {showSubscription && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full relative">
            <button onClick={() => setShowSubscription(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
              <X size={24} />
            </button>
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Plan</h2>
              <stripe-pricing-table 
                pricing-table-id="prctbl_1T1nNE5zp7Kd7fwDdCw2SIaP"
                publishable-key="pk_live_51T1Wtd5zp7Kd7fwDOSSzSKU12Q6b0Xe8LExqyrQA7azn5T36pJxZ2nokuMT8LuwkIC19U0K8jlmBBlonB2ewcmXJ000BefSaH9">
              </stripe-pricing-table>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Connect Modals */}
      {showProductForm && accountId && <ProductForm accountId={accountId} onClose={() => setShowProductForm(false)} />}
      {showStorefront && <Storefront accountId={accountId} />}
      {showLibraryImport && <LibraryImport user={user} onClose={() => setShowLibraryImport(false)} />}
    </div>
  );
}

export default App;
