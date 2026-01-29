
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Zap, LayoutGrid, SlidersHorizontal, ArrowUpNarrowWide, ArrowDownWideNarrow, Star, XCircle, TrendingUp, Grid, X, ArrowRight, MessageSquare, RotateCcw } from 'lucide-react';
import { Product } from '../constants';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

interface ProductRowProps {
  title: React.ReactNode;
  titleStr?: string;
  products: Product[];
  favorites: Set<string>;
  onToggleFavorite: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isLoading?: boolean;
  headerActions?: React.ReactNode;
}

type SortOption = 'default' | 'priceAsc' | 'priceDesc' | 'rating' | 'reviews';
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
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const filterCloseRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Filter & Sort State
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  
  // View All Modal State
  const [renderViewAll, setRenderViewAll] = useState(false);
  
  // Gesture Refs
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
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

  useEffect(() => {
    if (showFilters) {
      setTimeout(() => filterCloseRef.current?.focus(), 100);
    }
  }, [showFilters]);

  // Logic to randomly select 30% of indices
  const shuffleBadges = useCallback(() => {
    if (!products || products.length === 0) {
      setSpecialBadgeIndices(new Set());
      return;
    }

    const totalItems = products.length;
    const badgeCount = Math.max(1, Math.ceil(totalItems * 0.3));
    const indices = Array.from({ length: totalItems }, (_, i) => i);
    
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    setSpecialBadgeIndices(new Set(indices.slice(0, badgeCount)));
  }, [products]);

  useEffect(() => {
    shuffleBadges();
  }, [shuffleBadges]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      shuffleBadges();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [shuffleBadges]);

  const getPrice = (p: Product) => parseFloat(p.price.replace(/[^\d.]/g, '')) || 0;

  const filteredProducts = useMemo(() => {
    if (isLoading) return [];
    let result = [...products];

    // Apply Price Filtering
    switch (priceRange) {
      case 'under1k': result = result.filter(p => getPrice(p) < 1000); break;
      case '1k-10k': result = result.filter(p => { const v = getPrice(p); return v >= 1000 && v < 10000; }); break;
      case '10k-50k': result = result.filter(p => { const v = getPrice(p); return v >= 10000 && v < 50000; }); break;
      case 'above50k': result = result.filter(p => getPrice(p) >= 50000); break;
    }

    // Apply Sorting
    switch (sortBy) {
      case 'priceAsc': result.sort((a, b) => getPrice(a) - getPrice(b)); break;
      case 'priceDesc': result.sort((a, b) => getPrice(b) - getPrice(a)); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'reviews': result.sort((a, b) => b.reviewsCount - a.reviewsCount); break;
      default: break;
    }
    
    return result;
  }, [products, priceRange, sortBy, isLoading]);

  // FIX: Reset scroll position when sort or filter changes to show results from start
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [sortBy, priceRange]);

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

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const scrollPos = gridScrollRef.current?.scrollTop || 0;

    // 1. Swipe Right to Close (Native back)
    if (isHorizontalSwipe && deltaX > 70) {
      handleCloseViewAll();
    }
    // 2. Swipe Down to Close (at the top of list)
    else if (!isHorizontalSwipe && deltaY > 70 && scrollPos <= 5) {
      handleCloseViewAll();
    }

    touchStartRef.current = null;
  };

  const hasActiveFilters = sortBy !== 'default' || priceRange !== 'all';
  const resetFilters = useCallback(() => {
    setSortBy('default');
    setPriceRange('all');
  }, []);

  const rowAriaLabel = typeof title === 'string' ? title : (titleStr || 'Product Row');

  return (
    <section className="px-2 max-w-[90rem] mx-auto overflow-hidden" aria-label={rowAriaLabel}>
      <div className="flex flex-col mb-2">
        <div className="flex flex-row items-center justify-between px-1 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {typeof title === 'string' ? (
               title && (
                 <>
                   <Zap className="w-4 h-4 text-orange-500 fill-current flex-shrink-0" aria-hidden="true" />
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
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 text-red-500 transition-all active:scale-95"
                title="Clear all filters"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider">Reset</span>
              </button>
            )}
            <button 
              onClick={() => setShowFilters(true)}
              className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border shadow-sm transition-all active:scale-95 ${
                hasActiveFilters
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400' 
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:text-orange-600'
              }`}
              title="Filter & Sort"
              aria-label={`Open filters for ${rowAriaLabel}`}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline text-xs font-bold">Filters</span>
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-orange-500" aria-hidden="true"></span>
              )}
            </button>
            <button 
              onClick={handleOpenViewAll}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all active:scale-95 hover:text-orange-600 dark:hover:text-orange-400"
              title="View All Products"
              aria-label={`View all products in ${rowAriaLabel}`}
            >
              <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline text-xs font-bold">View All</span>
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" aria-hidden="true"></div>
            <div className="flex gap-1">
              <button onClick={() => scrollByButton('left')} className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:text-orange-600 shadow-sm transition-all active:scale-95" aria-label={`Scroll ${rowAriaLabel} left`}>
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button onClick={() => scrollByButton('right')} className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:text-orange-600 shadow-sm transition-all active:scale-95" aria-label={`Scroll ${rowAriaLabel} right`}>
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 px-0 py-0" role="dialog" aria-modal="true" aria-labelledby="filter-title">
              <div 
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity"
                onClick={() => setShowFilters(false)}
                aria-hidden="true"
              />
              <div className="relative w-full sm:max-w-md bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-[slideUp_0.3s_ease-out] sm:animate-in sm:zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-orange-500" aria-hidden="true" />
                        <h3 id="filter-title" className="text-lg font-black font-engaging tracking-tight text-gray-900 dark:text-white">Filter & Sort</h3>
                     </div>
                     <button ref={filterCloseRef} onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Close filters">
                        <X className="w-5 h-5" aria-hidden="true" />
                     </button>
                  </div>
                  <div className="space-y-6 overflow-y-auto no-scrollbar pb-4">
                     <div className="space-y-3">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Sort By</span>
                        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sort options">
                           <button onClick={() => setSortBy('default')} aria-checked={sortBy === 'default'} role="radio" className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'default' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}><TrendingUp className="w-4 h-4" /> Relevance</button>
                           <button onClick={() => setSortBy('reviews')} aria-checked={sortBy === 'reviews'} role="radio" className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'reviews' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}><MessageSquare className="w-4 h-4" /> Most Reviewed</button>
                           <button onClick={() => setSortBy('priceAsc')} aria-checked={sortBy === 'priceAsc'} role="radio" className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'priceAsc' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}><ArrowUpNarrowWide className="w-4 h-4" /> Price: Low-High</button>
                           <button onClick={() => setSortBy('priceDesc')} aria-checked={sortBy === 'priceDesc'} role="radio" className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'priceDesc' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}><ArrowDownWideNarrow className="w-4 h-4" /> Price: High-Low</button>
                           <button onClick={() => setSortBy('rating')} aria-checked={sortBy === 'rating'} role="radio" className={`p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${sortBy === 'rating' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}><Star className="w-4 h-4" /> Top Rated</button>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Price Range</span>
                        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Price range options">
                            {[{ label: 'All', val: 'all' }, { label: 'Under ₹1k', val: 'under1k' }, { label: '₹1k - ₹10k', val: '1k-10k' }, { label: '₹10k - ₹50k', val: '10k-50k' }, { label: 'Over ₹50k', val: 'above50k' }].map((opt) => (
                              <button key={opt.val} role="radio" aria-checked={priceRange === opt.val} onClick={() => setPriceRange(opt.val as PriceRange)} className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${priceRange === opt.val ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{opt.label}</button>
                            ))}
                        </div>
                     </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                     <button onClick={resetFilters} className="flex-1 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">Reset</button>
                     <button onClick={() => setShowFilters(false)} className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-orange-500 dark:bg-white dark:text-gray-900 hover:bg-gray-600 dark:hover:bg-gray-200 transition-colors shadow-lg active:scale-95">Show Results</button>
                  </div>
              </div>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-1 px-1 snap-x snap-mandatory scroll-container ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollBehavior: 'smooth' }}
        role="list"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="snap-start shrink-0" role="listitem"><SkeletonCard /></div>
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <div key={product.id} className="snap-start shrink-0" role="listitem">
              <ProductCard 
                product={product} 
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={(e) => { e.preventDefault(); onToggleFavorite(product); }}
                onQuickView={onQuickView}
                showTopBadge={specialBadgeIndices.has(index)}
              />
            </div>
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-12 text-gray-400">
             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"><SlidersHorizontal className="w-8 h-8 opacity-50" aria-hidden="true" /></div>
             <p className="text-sm font-bold">No products match your filters</p>
             <button onClick={resetFilters} className="mt-2 text-orange-500 text-xs font-bold hover:underline inline-flex items-center gap-1">
               <RotateCcw className="w-3 h-3" /> Reset all filters
             </button>
          </div>
        )}
      </div>

      {renderViewAll && (
        <div 
          className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-all-title"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-orange-500" aria-hidden="true" />
              <h2 id="view-all-title" className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {titleStr ? `${titleStr} All Products` : (typeof title === 'string' ? `${title} All Products` : 'All Products')}
                <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{filteredProducts.length}</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowFilters(true)}
                  className={`p-2 rounded-full transition-all ${hasActiveFilters ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  aria-label="Filter & Sort results"
                >
                  <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
                </button>
                <button onClick={handleCloseViewAll} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Close view all">
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
            </div>
          </div>
          <div ref={gridScrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 no-scrollbar" role="region" aria-label="All products grid">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 max-w-[100rem] mx-auto">
              {filteredProducts.map((product) => (
                <ProductCard key={`grid-${product.id}`} product={product} isFavorite={favorites.has(product.id)} onToggleFavorite={(e) => { e.preventDefault(); onToggleFavorite(product); }} onQuickView={onQuickView} showTopBadge={false} variant="grid" />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"><SlidersHorizontal className="w-8 h-8 opacity-50" aria-hidden="true" /></div>
                  <p className="text-sm font-bold">No products match your filters</p>
                  <button onClick={resetFilters} className="mt-2 text-orange-500 text-xs font-bold hover:underline inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset all filters
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
