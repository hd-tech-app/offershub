
import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ShoppingCart, Star, Send, Share2, ExternalLink } from 'lucide-react';
import { Product, ALL_ICONS } from '../constants';
import { getAffiliateUrl, formatPrice, fixAmazonThumbnail, shareProduct } from '../utils';
import { useConfig } from '../contexts/ConfigContext';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onQuickView: (product: Product) => void;
  showTopBadge?: boolean;
  variant?: 'default' | 'grid';
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  isFavorite, 
  onToggleFavorite, 
  onQuickView,
  showTopBadge = false,
  variant = 'default',
  priority = false
}) => {
  const imageUrl = fixAmazonThumbnail(product.image, 500);
  const [badgeIndex, setBadgeIndex] = useState(0);
  const [isBadgeVisible, setIsBadgeVisible] = useState(true);
  const config = useConfig();
  const { productCardBuyButton, themeOverrides } = config;
  const customStarColor = themeOverrides?.starRatingColor;

  const resolveIcon = (iconName: string, Fallback: any) => {
    const trimmed = iconName?.trim() || '';
    return ALL_ICONS[trimmed] || ALL_ICONS[trimmed.charAt(0).toUpperCase() + trimmed.slice(1)] || Fallback;
  };

  const BuyIcon = resolveIcon(productCardBuyButton.icon, ExternalLink);

  const handleShare = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    shareProduct(product, config.affiliateTag, config.productShareMessage);
  }, [product, config.affiliateTag, config.productShareMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onQuickView(product);
    }
  }, [product, onQuickView]);

  useEffect(() => {
    if (!showTopBadge || !config.showBadges || config.badgeOptions.length === 0) return;

    setBadgeIndex(Math.floor(Math.random() * config.badgeOptions.length));
    setIsBadgeVisible(true);

    const intervalTime = 6000 + Math.random() * 4000;

    const interval = setInterval(() => {
      setIsBadgeVisible(false);
      
      const timeout = setTimeout(() => {
        setBadgeIndex(prev => (prev + 1) % config.badgeOptions.length);
        setIsBadgeVisible(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [showTopBadge, config.showBadges, config.badgeOptions]);

  const currentBadge = config.badgeOptions.length > 0 ? config.badgeOptions[badgeIndex] : null;
  const widthClass = variant === 'grid' ? 'w-full' : 'w-36 sm:w-48';

  return (
    <div 
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.title}`}
      className={`group relative ${widthClass} bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-sky-400/15 transition-all duration-500 border border-gray-200 dark:border-gray-800 flex flex-col transform hover:-translate-y-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none`}
      onClick={() => onQuickView(product)}
      onKeyDown={handleKeyDown}
    >
      <div className="relative aspect-square overflow-hidden bg-white dark:bg-gray-800/30 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 to-orange-500/0 group-hover:from-orange-400/5 group-hover:to-pink-500/10 transition-colors duration-500" />
        
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full bg-white object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400?text=View+on+Amazon`;
          }}
        />

        <div className="absolute top-[0.4rem] left-[0.4rem] flex flex-col gap-1.5 z-10 pointer-events-none">
          {config.showBadges && showTopBadge && currentBadge ? (
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
            config.showDiscounts && product.discountPercentage && (
              <div className="bg-red-600 text-white text-[9px] font-medium px-2 py-0.5 rounded-md shadow-lg shadow-red-600/20 uppercase tracking-wider animate-[fadeIn_0.5s_ease-out]">
                {product.discountPercentage} OFF
              </div>
            )
          )}
        </div>

        <div className="absolute top-[0.4rem] right-[0.4rem] flex flex-col gap-2 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(e); }}
            className={`p-2 rounded-xl shadow-lg backdrop-blur-md border transition-all active:scale-90 hover:scale-110 ${
              isFavorite 
                ? 'bg-red-500 text-white border-red-500' 
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800'
            }`}
            title={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
            aria-label={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-xl shadow-lg backdrop-blur-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-300 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800 transition-all active:scale-90 hover:scale-110"
            title="Share"
            aria-label={`Share ${product.title}`}
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="p-2 sm:p-4 flex flex-col flex-grow bg-white dark:bg-gray-900">
        <div className="flex items-center gap-1.5 mb-2">
          <div 
             className="flex items-center bg-gray-50 dark:bg-gray-900/20 px-1.5 py-0.5 rounded-md"
             style={customStarColor ? { color: customStarColor } : undefined}
          >
            <Star 
               className={`w-3 h-3 fill-current mr-1 ${!customStarColor ? 'text-orange-500' : ''}`} 
               aria-hidden="true" 
            />
            <span 
               className={`text-[10px] sm:text-xs font-black ${!customStarColor ? 'text-orange-500 dark:text-orange-400' : ''}`}
            >
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
            className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-lg shadow-gray-900/10 dark:shadow-orange-600/20 transition-all duration-300 group/btn transform hover:scale-110 active:scale-95 ${productCardBuyButton.bgColor} ${productCardBuyButton.color} ${productCardBuyButton.hoverColor}`}
            title={productCardBuyButton.text || `Buy ${product.title} on Amazon`}
            aria-label={productCardBuyButton.text || `Buy ${product.title} on Amazon`}
          >
            <BuyIcon className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" aria-hidden="true" />
          </a>
        </div>

      </div>
    </div>
  );
});

export default ProductCard;
