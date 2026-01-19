
import React from 'react';
import { X, Moon, Sun, ChevronRight } from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS } from '../constants';
import { getAffiliateUrl } from '../utils';
import { useConfig } from '../contexts/ConfigContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, theme, toggleTheme }) => {
  const { affiliateTag, headerTitle } = useConfig();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-950 z-[70] shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header/Toggle Section */}
        <div className="flex flex-col p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-engaging tracking-tighter">
              {headerTitle}
            </h2>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Theme Toggle Button Container */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
            <button 
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${theme === 'light' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button 
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}
            >
              <Moon className="w-4 h-4" />
              Dark
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-150px)] py-4 no-scrollbar">
          <div className="px-6 mb-2">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">Shop Categories</h3>
          </div>
          <nav className="px-3 space-y-1">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon];
              return (
                <a
                  key={cat.name}
                  href={getAffiliateUrl(cat.url, affiliateTag)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-1 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 transition-all group"
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group-hover:bg-orange-500 transition-colors ${theme === 'light' ? cat.color : 'text-gray-400'}`}>
                    <Icon className="w-4 h-4 transition-colors group-hover:text-white" />
                  </div>
                  <span className="flex-1 group-hover:text-orange-600 dark:group-hover:text-orange-400">{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
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
