
import React, { useRef, useState, useEffect } from 'react';
import { ALL_ICONS } from '../constants';
import { getAffiliateUrl } from '../utils';
import { Zap, Sparkles, Flame } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

const CategoryBar: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { affiliateTag, categories } = useConfig();

  // Enable horizontal scroll with mouse wheel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDragging = () => setIsDragging(false);

  // Mock engagement status for visual interest
  const getBadge = (name: string) => {
    if (name === 'Electronics' || name === 'Video Games') return 'HOT';
    if (name === 'Beauty' || name === 'Home & Kitchen') return 'LIVE';
    if (name === 'Clothing & Accessories') return 'NEW';
    return null;
  };

  return (
    <div className="w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
      <div className="max-w-[95rem] mx-auto relative group/bar">
        {/* Subtle Gradient Masks for scroll indication */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/90 dark:from-gray-950/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/90 dark:from-gray-950/90 to-transparent z-10 pointer-events-none" />

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          className={`flex items-center gap-3 overflow-x-auto no-scrollbar px-4 sm:px-6 py-2 scroll-container select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {categories.map((cat, idx) => {
            // Lookup icon dynamically from ALL_ICONS
            // 1. Try exact match
            // 2. Try PascalCase match
            const exactMatch = ALL_ICONS[cat.icon.trim()];
            const pascalMatch = ALL_ICONS[cat.icon.trim().charAt(0).toUpperCase() + cat.icon.trim().slice(1)];
            
            const Icon = exactMatch || pascalMatch || ALL_ICONS.ChevronRight;
            const badge = getBadge(cat.name);
            
            return (
              <a
                key={`${cat.name}-${idx}`}
                href={getAffiliateUrl(cat.url, affiliateTag)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => isDragging && e.preventDefault()}
                className="group relative flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-150/50 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 hover:bg-orange-500 dark:hover:bg-white hover:border-gray dark:hover:border-white transition-all duration-300 active:scale-95"
              >
                {/* Icon */}
                {Icon && (
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${cat.color} group-hover:text-white dark:group-hover:text-black`} />
                )}

                {/* Text */}
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-white dark:group-hover:text-black whitespace-nowrap tracking-tight transition-colors duration-300">
                  {cat.name}
                </span>

                {/* Badge (Dot or Mini Pill) */}
                {badge && (
                  <div className={`ml-1 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none uppercase tracking-wider ${
                    badge === 'HOT' ? 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white' : 
                    badge === 'LIVE' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 
                    'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                  } transition-colors duration-300`}>
                    {badge === 'HOT' && <Flame className="w-2 h-2 fill-current" />}
                    {badge === 'LIVE' && <Zap className="w-2 h-2 fill-current" />}
                    {badge === 'NEW' && <Sparkles className="w-2 h-2" />}
                    <span className="hidden sm:inline">{badge}</span>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
