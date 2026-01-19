
import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Share2, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { getAffiliateUrl, formatPrice, fixAmazonThumbnail, shareProduct } from '../utils';
import { useConfig } from '../contexts/ConfigContext';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onQuickView: (product: Product) => void;
  showTopBadge?: boolean;
  variant?: 'default' | 'grid';
}

const BADGE_OPTIONS = [
  { label: 'Best Seller', className: 'bg-blue-600 shadow-blue-600/20' },
  { label: 'Top Rated', className: 'bg-amber-500 shadow-amber-500/20' },
  { label: 'Super Deal', className: 'bg-purple-600 shadow-purple-600/20' },
  { label: 'Trending', className: 'bg-emerald-500 shadow-emerald-500/20' },
  { label: "Editor's Choice", className: 'bg-indigo-600 shadow-indigo-600/20' },
  { label: 'Flash Sale', className: 'bg-orange-500 shadow-orange-500/20' },
  { label: 'Limited Time', className: 'bg-red-500 shadow-red-500/20' },
  { label: 'New Arrival', className: 'bg-teal-500 shadow-teal-500/20' },
  { label: 'Most Loved', className: 'bg-pink-500 shadow-pink-500/20' },
  { label: 'Premium Pick', className: 'bg-cyan-600 shadow-cyan-600/20' }
];

const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  isFavorite, 
  onToggleFavorite, 
  onQuickView,
  showTopBadge = false,
  variant = 'default'
}) => {
  const imageUrl = fixAmazonThumbnail(product.image, 500);
  const [badgeIndex, setBadgeIndex] = useState(0);
  const [isBadgeVisible, setIsBadgeVisible] = useState(true);
  const config = useConfig();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareProduct(product, config.affiliateTag, config.productShareMessage);
  };

  // Effect to manage badge lifecycle
  useEffect(() => {
    if (!showTopBadge) return;

    // Pick a random starting badge when activated to ensure variety
    setBadgeIndex(Math.floor(Math.random() * BADGE_OPTIONS.length));
    setIsBadgeVisible(true);

    // Random duration between 3s and 7s to cycle badges if they stay on screen
    const intervalTime = 3000 + Math.random() * 4000;

    const interval = setInterval(() => {
      setIsBadgeVisible(false); // Fade out
      
      setTimeout(() => {
        setBadgeIndex(prev => {
          // Pick a random next badge different from current
          let next = Math.floor(Math.random() * BADGE_OPTIONS.length);
          if (next === prev) next = (next + 1) % BADGE_OPTIONS.length;
          return next;
        });
        setIsBadgeVisible(true); // Fade in
      }, 300); // Wait for CSS transition
    }, intervalTime);

    return () => clearInterval(interval);
  }, [showTopBadge]);

  const currentBadge = BADGE_OPTIONS[badgeIndex];
  const widthClass = variant === 'grid' ? 'w-full' : 'w-40 sm:w-52';

  return (
    <div 
      className={`group relative ${widthClass} bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-500/15 transition-all duration-500 border border-gray-200 dark:border-gray-800 flex flex-col transform hover:-translate-y-2 cursor-pointer`}
      onClick={() => onQuickView(product)}
    >
      {/* Image Wrapper */}
      <div className="relative aspect-square overflow-hidden bg-white dark:bg-gray-800/30 flex items-center justify-center">
        {/* Subtle background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-colors duration-500" />
        
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400?text=View+on+Amazon`;
          }}
        />

        {/* Top Badges - Dynamic changing badge OR discount badge */}
        <div className="absolute top-[0.4rem] left-[0.4rem] flex flex-col gap-1.5 z-10 pointer-events-none">
          {showTopBadge ? (
            <div 
              className={`
                ${currentBadge.className} 
                text-white text-[9px] font-medium px-2 py-0.5 rounded-md shadow-lg uppercase tracking-wider
                transition-all duration-300 ease-in-out transform
                ${isBadgeVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-1'}
                animate-[fadeIn_0.5s_ease-out]
              `}
            >
              {currentBadge.label}
            </div>
          ) : (
            product.discountPercentage && (
              <div className="bg-red-600 text-white text-[9px] font-medium px-2 py-0.5 rounded-md shadow-lg shadow-red-600/20 uppercase tracking-wider animate-[fadeIn_0.5s_ease-out]">
                {product.discountPercentage} OFF
              </div>
            )
          )}
        </div>

        {/* Action Buttons (Permanent) */}
        <div className="absolute top-[0.4rem] right-[0.4rem] flex flex-col gap-2 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
            className={`p-2 rounded-xl shadow-lg backdrop-blur-md border transition-all active:scale-90 hover:scale-110 ${
              isFavorite 
                ? 'bg-red-500 text-white border-red-500' 
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800'
            }`}
            title={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-xl shadow-lg backdrop-blur-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-300 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800 transition-all active:scale-90 hover:scale-110"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white dark:bg-gray-900">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md">
            <Star className="w-3 h-3 text-orange-500 fill-current mr-1" />
            <span className="text-[10px] sm:text-xs font-black text-orange-500 dark:text-orange-400">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-tight">
            {product.reviewsCount.toLocaleString()} Reviews
          </span>
        </div>

        <h3 className="text-sm sm:text-sm font-medium text-gray-600 dark:text-gray-100 line-clamp-3 min-h-[2.4rem] leading-tight mb-3 transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400 font-engaging">
          {product.title}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-medium text-gray-700 dark:text-white font-engaging tracking-tighter leading-none">
                {formatPrice(product.price)}
              </span>
            </div>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-bold opacity-70">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <a
            href={getAffiliateUrl(product.url, config.affiliateTag)}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-[rgb(255,179,4)] dark:bg-orange-600 text-white rounded-xl shadow-lg shadow-gray-900/10 dark:shadow-orange-600/20 hover:bg-orange-600 dark:hover:bg-orange-500 transition-all duration-300 group/btn transform hover:scale-110 active:scale-95"
            aria-label="View on Amazon"
          >
            <ExternalLink className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
