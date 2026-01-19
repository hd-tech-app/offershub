
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Zap, ViewIcon, SlidersHorizontal, ArrowUpNarrowWide, ArrowDownWideNarrow, Star, XCircle, TrendingUp, Grid, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

interface ProductRowProps {
  title: React.ReactNode;
  titleStr?: string;
  products: Product[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onQuickView: (product: Product) => void;
  isLoading?: boolean;
  headerActions?: React.ReactNode;
}

type SortOption = 'default' | 'priceAsc' | 'priceDesc' | 'rating';
type PriceRange = 'all' | 'under1k' | '1k-10k' | '10k-50k' | 'above50k';

const ProductRow: React.FC<ProductRowProps> = ({ 
  title,
  titleStr,
  products, 
  favorites, 
  onToggleFavorite, 
  onQuickView,
  isLoading = false,
  headerActions
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Filter & Sort State
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  
  // View All Modal State
  const [renderViewAll, setRenderViewAll] = useState(false);
  
  // Gesture Refs for Swipe Back
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const touchEndRef = useRef<{x: number, y: number} | null>(null);
  
  // State to track which products currently show the special top badge
  const [specialBadgeIndices, setSpecialBadgeIndices] = useState<Set<number>>(new Set());

  const handleOpenViewAll = () => {
    setRenderViewAll(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseViewAll = () => {
    setRenderViewAll(false);
    document.body.style.overflow = '';
  };

  // Cleanup body overflow on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Logic to randomly select 30% of indices
  const shuffleBadges = useCallback(() => {
    if (!products || products.length === 0) {
      setSpecialBadgeIndices(new Set());
      return;
    }

    const totalItems = products.length;
    // Target ~30% of products, ensuring at least 1 if products exist
    const badgeCount = Math.max(1, Math.ceil(totalItems * 0.3));
    
    // Create array of indices [0, 1, 2, ... N]
    const indices = Array.from({ length: totalItems }, (_, i) => i);
    
    // Fisher-Yates Shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Select the first 30%
    setSpecialBadgeIndices(new Set(indices.slice(0, badgeCount)));
  }, [products]);

  // Initial shuffle when products change
  useEffect(() => {
    shuffleBadges();
  }, [shuffleBadges]);

  // Rotate selection every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      shuffleBadges();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [shuffleBadges]);

  // --- Filtering Logic ---
  const getPrice = (p: Product) => parseFloat(p.price.replace(/[^\d.]/g, '')) || 0;

  const filteredProducts = useMemo(() => {
    if (isLoading) return [];
    
    let result = [...products];

    // 1. Price Range Filter
    switch (priceRange) {
      case 'under1k': result = result.filter(p => getPrice(p) < 1000); break;
      case '1k-10k': result = result.filter(p => { const v = getPrice(p); return v >= 1000 && v < 10000; }); break;
      case '10k-50k': result = result.filter(p => { const v = getPrice(p); return v >= 10000 && v < 50000; }); break;
      case 'above50k': result = result.filter(p => getPrice(p) >= 50000); break;
    }

    // 2. Sorting
    switch (sortBy) {
      case 'priceAsc': 
        result.sort((a, b) => getPrice(a) - getPrice(b)); 
        break;
      case 'priceDesc': 
        result.sort((a, b) => getPrice(b) - getPrice(a)); 
        break;
      case 'rating': 
        result.sort((a, b) => b.rating - a.rating); 
        break;
      default:
        // Keep original order or maybe sort by discount if default?
        // Let's keep original order as "Relevance"
        break;
    }
    
    return result;
  }, [products, priceRange, sortBy, isLoading]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollSnapType = 'none';
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDragging = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = 'x mandatory';
      scrollRef.current.style.scrollBehavior = 'smooth';
    }
  };

  const scrollByButton = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 150 : 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // --- Mobile Swipe Back Logic ---
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
    };
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const xDiff = touchStartRef.current.x - touchEndRef.current.x;
    const yDiff = touchStartRef.current.y - touchEndRef.current.y;

    // Detect horizontal swipe (Left to Right)
    // xDiff < 0 means end.x > start.x (Moving right)
    // Threshold of 50px
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50 && xDiff < 0) {
        handleCloseViewAll();
    }
  };

  const hasActiveFilters = sortBy !== 'default' || priceRange !== 'all';

  const resetFilters = () => {
    setSortBy('default');
    setPriceRange('all');
  };

  return (
    <section className="py-2 px-4 max-w-[90rem] mx-auto overflow-hidden">
      <div className="flex flex-col mb-3">
        {/* Header Row */}
        <div className="flex flex-row items-center justify-between px-1 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {typeof title === 'string' ? (
               title && (
                 <>
                   <Zap className="w-4 h-4 text-orange-500 fill-current flex-shrink-0" />
                   <h2 className="text-xs sm:text-sm font-black dark:text-gray-100 uppercase tracking-widest font-engaging truncate">
                     {title}
                   </h2>
                 </>
               )
            ) : (
              title
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerActions}
            
            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFilters(true)}
              className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border shadow-sm transition-all active:scale-95 ${
                hasActiveFilters
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400' 
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:text-orange-600'
              }`}
              title="Filter & Sort"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold">Filters</span>
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-orange-500"></span>
              )}
            </button>

            {/* View All Button */}
            <button 
              onClick={handleOpenViewAll}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all active:scale-95 hover:text-orange-600 dark:hover:text-orange-400"
              title="View All Products"
            >
              <ViewIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold">View All</span>
            </button>

            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

            <div className="flex gap-1">
              <button onClick={() => scrollByButton('left')} className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:text-orange-600 shadow-sm transition-all active:scale-95" aria-label="Scroll Left">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scrollByButton('right')} className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:text-orange-600 shadow-sm transition-all active:scale-95" aria-label="Scroll Right">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Popup Modal (Increased z-index to 110 to show over View All modal) */}
        {showFilters && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 px-0 py-0">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity"
                onClick={() => setShowFilters(false)}
              />
              
              {/* Modal Content */}
              <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-[slideUp_0.3s_ease-out] sm:animate-in sm:zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
                  
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-black font-engaging tracking-tight text-gray-900 dark:text-white">Filter & Sort</h3>
                     </div>
                     <button 
                       onClick={() => setShowFilters(false)}
                       className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="space-y-6 overflow-y-auto no-scrollbar pb-4">
                     {/* Sort Section */}
                     <div className="space-y-3">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Sort By</span>
                        <div className="grid grid-cols-2 gap-2">
                           <button 
                             onClick={() => setSortBy('default')}
                             className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'default' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                           >
                             <TrendingUp className="w-4 h-4" /> Relevance
                           </button>
                           <button 
                             onClick={() => setSortBy('priceAsc')}
                             className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'priceAsc' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                           >
                             <ArrowUpNarrowWide className="w-4 h-4" /> Price: Low to High
                           </button>
                           <button 
                             onClick={() => setSortBy('priceDesc')}
                             className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'priceDesc' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                           >
                             <ArrowDownWideNarrow className="w-4 h-4" /> Price: High to Low
                           </button>
                           <button 
                             onClick={() => setSortBy('rating')}
                             className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'rating' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                           >
                             <Star className="w-4 h-4" /> Top Rated
                           </button>
                        </div>
                     </div>

                     {/* Price Section */}
                     <div className="space-y-3">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Price Range</span>
                        <div className="flex flex-wrap gap-2">
                            {[
                              { label: 'All', val: 'all' },
                              { label: 'Under ₹1k', val: 'under1k' },
                              { label: '₹1k - ₹10k', val: '1k-10k' },
                              { label: '₹10k - ₹50k', val: '10k-50k' },
                              { label: 'Over ₹50k', val: 'above50k' },
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                onClick={() => setPriceRange(opt.val as PriceRange)}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                                  priceRange === opt.val
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg' 
                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                     <button 
                       onClick={resetFilters}
                       className="flex-1 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                     >
                       Reset
                     </button>
                     <button 
                       onClick={() => setShowFilters(false)}
                       className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                     >
                       Show Results
                     </button>
                  </div>
              </div>
          </div>
        )}
      </div>

      {/* Horizontal Scroll View */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-1 px-1 snap-x snap-mandatory scroll-container ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="snap-start shrink-0">
              <SkeletonCard />
            </div>
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div key={product.id} className="snap-start shrink-0">
              <ProductCard 
                product={product} 
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={(e) => { e.preventDefault(); onToggleFavorite(product.id); }}
                onQuickView={onQuickView}
                showTopBadge={specialBadgeIndices.has(index)}
              />
            </div>
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-12 text-gray-400">
             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-8 h-8 opacity-50" />
             </div>
             <p className="text-sm font-bold">No products match your filters</p>
             <button onClick={resetFilters} className="mt-2 text-orange-500 text-xs font-bold hover:underline">
               Reset all filters
             </button>
          </div>
        )}
      </div>

      {/* View All Overlay Modal */}
      {renderViewAll && (
        <div 
          className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {titleStr ? `${titleStr} All Products` : (typeof title === 'string' ? `${title} All Products` : 'All Products')}
                <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {filteredProducts.length}
                </span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Filter Button in View All */}
                <button 
                  onClick={() => setShowFilters(true)}
                  className={`p-2 rounded-full transition-all ${
                    hasActiveFilters
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="Filter & Sort"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={handleCloseViewAll}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 no-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 max-w-[100rem] mx-auto">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={`grid-${product.id}`}
                  product={product}
                  isFavorite={favorites.has(product.id)}
                  onToggleFavorite={(e) => { e.preventDefault(); onToggleFavorite(product.id); }}
                  onQuickView={onQuickView}
                  showTopBadge={false}
                  variant="grid"
                />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <SlidersHorizontal className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm font-bold">No products match your filters</p>
                  <button onClick={resetFilters} className="mt-2 text-orange-500 text-xs font-bold hover:underline">
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductRow;
