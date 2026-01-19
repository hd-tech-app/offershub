
import React, { useState, useRef } from 'react';
import { Menu, Search, Mic, Share2, Heart, Moon, Sun, Zap } from 'lucide-react';
import { performShare } from '../utils';
import { useConfig } from '../contexts/ConfigContext';

interface HeaderProps {
  onMenuToggle: () => void;
  favoritesCount: number;
  onFavoritesClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuToggle, 
  favoritesCount, 
  onFavoritesClick, 
  theme, 
  toggleTheme 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const config = useConfig();

  const executeSearch = (query: string) => {
    if (!query.trim()) return;
    const amazonSearchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss_2&tag=${config.affiliateTag}`;
    window.open(amazonSearchUrl, '_blank');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    executeSearch(searchQuery);
  };

  const handleGlobalShare = (e: React.MouseEvent) => {
    e.preventDefault();
    performShare({
      title: config.headerTitle,
      text: `${config.shareMessage}\n\nVisit:\n${window.location.href}`,
      url: window.location.href,
    });
  };

  const startVoiceSearch = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Explicitly request microphone permission when button is clicked
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we only needed to trigger the permission prompt.
      // SpeechRecognition will handle its own stream.
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Microphone permission denied:", err);
      alert("Microphone permission is required to use voice search. Please enable it in your browser settings.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        executeSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
    }

    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-500">
      {/* Background layer with glassmorphism */}
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm" />
      
      <div className="relative max-w-[95rem] mx-auto px-2 sm:px-6 h-14 sm:h-17 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Section: Menu & Logo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button 
            onClick={onMenuToggle}
            className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95 group"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:text-orange-600 transition-colors" />
          </button>
          
          <div className="flex flex-col select-none">
            <div className="flex items-center gap-1.5">
              <div 
                className="w-8 h-8 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20 transform transition-transform hover:scale-105 cursor-pointer" 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current" />
              </div>
              <div className="hidden md:flex flex-col">
                <h1 className="text-xl font-black bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent font-engaging tracking-tighter leading-none">
                  {config.headerTitle}
                </h1>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-500 leading-none mt-0.5">
                  {config.headerSubtitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Search Bar - Full Width / Middle */}
<div className="flex-1 w-full mx-auto pt-[0.9rem] sm:px-2 lg:px-6">
  <form onSubmit={handleSearchSubmit} className="relative group w-full">
    {/* Animated focus border glow */}
    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 via-amber-500 to-pink-600 rounded-full blur-md opacity-0 group-focus-within:opacity-20 transition-opacity duration-500" />
    
    <div className="relative flex items-center bg-gray-50 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800 rounded-full shadow-inner group-focus-within:shadow-2xl group-focus-within:bg-white dark:group-focus-within:bg-black group-focus-within:border-orange-500/40 transition-all duration-500 overflow-hidden w-full">
      
      <div className="pl-3 sm:pl-5 text-gray-400 group-focus-within:text-orange-500 transition-colors flex-shrink-0">
        <Search className="w-5 h-5 sm:w-5 h-5" />
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent border-none py-2 sm:py-2.5 pl-2 sm:pl-2.5 pr-12 sm:pr-24 text-sm font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-0 outline-none"
      />

      {/* Clear button - shows only when text exists */}
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="absolute right-11 sm:right-20 p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 transition-all duration-300 flex-shrink-0 z-10"
          title="Clear search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="absolute right-1 flex items-center gap-0.5">
        <button
          type="button"
          onClick={startVoiceSearch}
          className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-50 text-red-600 animate-pulse' 
              : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800'
          }`}
          title="Search by voice"
        >
          <Mic className="w-5 h-5 sm:w-5 h-5" />
        </button>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-0.5 hidden sm:block" />

        <button
          type="submit"
          className="hidden sm:flex p-2.5 bg-gray-950 dark:bg-gray-800 text-white rounded-full hover:bg-orange-600 dark:hover:bg-orange-600 transition-all duration-300 shadow-md active:scale-95"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
  </form>
</div>


        {/* Right Section: Actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
          {/* THEME TOGGLE - Visible on all devices */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all hover:text-orange-500"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onFavoritesClick}
            className="p-2 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all relative group"
            aria-label="View Watchlist"
          >
            <Heart className={`w-5 h-5 transition-all duration-300 ${favoritesCount > 0 ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:text-red-500 group-hover:scale-110'}`} />
            {favoritesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black ring-2 ring-white dark:ring-gray-950 animate-bounce">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={handleGlobalShare}
            className="p-2 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all hover:text-blue-500 group"
            aria-label="Share Website"
          >
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
