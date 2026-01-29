
import React, { useEffect, useRef } from 'react';
import { X, Moon, Sun, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { ALL_ICONS } from '../constants';
import { getAffiliateUrl } from '../utils';
import { useConfig } from '../contexts/ConfigContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, toggleTheme, isFullscreen, onToggleFullscreen }) => {
  const { affiliateTag, headerTitle, headerTitleColor, categories } = useConfig();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Focus management when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeBtnRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchStartRef.current.x - touchEnd.x;
    const deltaY = touchStartRef.current.y - touchEnd.y;

    // Detect Right-to-Left swipe (swipe back to close)
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 70) {
      onClose();
    }
    touchStartRef.current = null;
  };

  const titleColorClass = headerTitleColor || 'bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent';

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-950 z-[70] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Navigation Sidebar"
        aria-hidden={!isOpen}
        role="complementary"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-black ${titleColorClass} font-engaging tracking-tighter`}>
              {headerTitle}
            </h2>
            <button 
              ref={closeBtnRef}
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95"
              aria-label="Close navigation menu"
            >
              <X className="w-6 h-6 text-gray-400" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl" role="radiogroup" aria-label="Appearance Mode">
              <button 
                onClick={() => theme === 'dark' && toggleTheme()}
                role="radio"
                aria-checked={theme === 'light'}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${theme === 'light' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Sun className="w-4 h-4" aria-hidden="true" />
                Light
              </button>
              <button 
                onClick={() => theme === 'light' && toggleTheme()}
                role="radio"
                aria-checked={theme === 'dark'}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}
              >
                <Moon className="w-4 h-4" aria-hidden="true" />
                Dark
              </button>
            </div>

            <button 
              onClick={onToggleFullscreen}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200/50 dark:border-gray-800"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (App Mode)"}
            >
              <div className="flex items-center gap-3">
                {isFullscreen ? <Minimize className="w-5 h-5 text-orange-500" /> : <Maximize className="w-5 h-5 text-orange-500" />}
                <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen Mode'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-210px)] py-4 no-scrollbar">
          <div className="px-6 mb-2">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Shop Categories</h3>
          </div>
          <nav className="px-3 space-y-1" role="navigation">
            {categories.map((cat, idx) => {
              const exactMatch = ALL_ICONS[cat.icon.trim()];
              const pascalMatch = ALL_ICONS[cat.icon.trim().charAt(0).toUpperCase() + cat.icon.trim().slice(1)];
              const Icon = exactMatch || pascalMatch || ALL_ICONS.CircleSmall;
              
              return (
                <a
                  key={`${cat.name}-${idx}`}
                  href={getAffiliateUrl(cat.url, affiliateTag)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-1 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 transition-all group"
                  aria-label={`Browse ${cat.name} category on Amazon`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group-hover:bg-orange-500 transition-colors ${theme === 'light' ? cat.color : 'text-gray-400'}`}>
                    <Icon className="w-4 h-4 transition-colors group-hover:text-white" aria-hidden="true" />
                  </div>
                  <span className="flex-1 group-hover:text-orange-600 dark:group-hover:text-orange-400">{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </a>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
