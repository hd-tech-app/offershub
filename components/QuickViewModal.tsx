
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Star, Share2, Heart, ArrowRight, StarHalf, CheckCircle2 } from 'lucide-react';
import { Product, ALL_ICONS } from '../constants';
import { getAffiliateUrl, formatPrice, shareProduct, fixAmazonThumbnail } from '../utils';
import { useConfig } from '../contexts/ConfigContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, isFavorite, onToggleFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const config = useConfig();
  const qv = config.quickView;
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // Reset closing state when product changes
  useEffect(() => {
    if (product) {
      setIsClosing(false);
      setImageLoaded(false);
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }
  }, [product]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      // We don't need to reset isClosing to false here because the component will unmount
      // or product will become null, triggering the useEffect above if it remounts.
    }, 200);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusables[0] as HTMLElement;
        const lastElement = focusables[focusables.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (product) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, handleClose]);
  
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

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const scrollPos = scrollContainerRef.current?.scrollTop || 0;

    if (isHorizontalSwipe && deltaX > 70) {
      handleClose();
    }
    else if (!isHorizontalSwipe && deltaY > 70 && scrollPos <= 5) {
      handleClose();
    }

    touchStartRef.current = null;
  };

  const resolveIcon = (iconName: string, Fallback: any) => {
    const trimmed = iconName.trim();
    return ALL_ICONS[trimmed] || ALL_ICONS[trimmed.charAt(0).toUpperCase() + trimmed.slice(1)] || Fallback;
  };

  if (!product) return null;

  const handleShare = () => {
    shareProduct(product, config.affiliateTag, config.productShareMessage);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    const ceilRating = Math.ceil(rating);

    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />);
      } else if (i === ceilRating && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-200 dark:text-gray-700" />);
      }
    }
    return stars;
  };

  // Resolve Icons
  const InStockIcon = resolveIcon(qv.inStock.icon, CheckCircle2);
  const PrimeIcon = resolveIcon(qv.prime.icon, ALL_ICONS.Truck);
  const AmazonVerifiedIcon = resolveIcon(qv.amazonVerified.icon, ALL_ICONS.ShieldCheck);
  const BuyIcon = resolveIcon(qv.buyButton.icon, ArrowRight);
  const DealPriceIcon = resolveIcon(qv.dealPrice.icon, ALL_ICONS.Zap);

  // Bottom Grid Items
  const gridItems = [qv.warranty, qv.verifiedSeller, qv.secureTransaction, qv.codReturns];

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden ${isClosing ? 'pointer-events-none' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className={`absolute inset-0 bg-gray-950/80 backdrop-blur-md transition-opacity duration-200 ease-out ${isClosing ? 'opacity-0' : 'animate-in fade-in opacity-100'}`} 
        onClick={handleClose}
        aria-hidden="true"
      />
      
      <div 
        ref={modalRef}
        className={`relative w-full max-w-5xl h-[88vh] sm:h-auto sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col sm:grid sm:grid-cols-12 overflow-hidden border border-white/10 transition-all duration-200 ease-out ${isClosing ? 'animate-out fade-out zoom-out-95 slide-out-to-bottom-[80%]' : 'animate-in fade-in zoom-in-95 slide-in-from-bottom-[50%]'}`}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-full sm:hidden z-20" aria-hidden="true" />

        <button 
          ref={closeButtonRef}
          onClick={handleClose} 
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-md rounded-full z-[110] transition-all border border-gray-200 dark:border-gray-700 shadow-sm group flex items-center justify-center"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
        </button>

        <div className="relative col-span-5 bg-gray-50/50 dark:bg-gray-950/40 flex items-center justify-center p-6 sm:p-8 overflow-hidden border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800/50 group/img shrink-0 sm:shrink">
          <div className="absolute -inset-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent blur-2xl opacity-60 pointer-none pointer-events-none" aria-hidden="true" />
          
          <div className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ease-out ${imageLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
            <a 
              href={getAffiliateUrl(product.url, config.affiliateTag)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="contents cursor-pointer"
            >
              <img 
                src={fixAmazonThumbnail(product.image, 1000)} 
                alt={product.title} 
                onLoad={() => setImageLoaded(true)}
                className="max-w-full max-h-[180px] sm:max-h-[350px] object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-lg group-hover/img:scale-125 transition-transform duration-500 ease-out"
              />
            </a>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 w-max flex gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg text-[10px] font-bold shadow-sm border border-gray-100 dark:border-gray-800 uppercase tracking-wider ${qv.amazonVerified.color}`}>
              <AmazonVerifiedIcon className="w-5 h-5" aria-hidden="true" /> {qv.amazonVerified.text}
            </span>
          </div>
        </div>

        <div className="col-span-7 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-6 no-scrollbar">
            <div className="max-w-xl mx-auto sm:mx-0 space-y-4">
              
              <div className="flex flex-row items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {product.discountPercentage ? (
                    <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-bold rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                      {product.discountPercentage} OFF
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-orange-600 text-white text-[9px] font-bold rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <DealPriceIcon className="w-3 h-3" /> Trending
                    </span>
                  )}
                  <span className={`flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-[9px] font-bold rounded-md uppercase tracking-wider border border-gray-200 dark:border-gray-700 ${qv.inStock.color}`}>
                    <InStockIcon className="w-3 h-3" aria-hidden="true" /> {qv.inStock.text}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 pr-6" aria-label={`${product.rating} stars out of 5 based on ${product.reviewsCount} reviews`}>
                   <div className="flex items-center gap-0.5" aria-hidden="true">
                      {renderStars(product.rating)}
                   </div>
                   <span className="text-xs font-bold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
                   <span className="text-[10px] text-gray-500 font-medium">({product.reviewsCount})</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 id="quick-view-title" className="text-base sm:text-xl font-medium text-gray-800 dark:text-white leading-normal">
                  {product.title}
                </h2>
                <div className="h-1 w-12 bg-orange-500 rounded-full" aria-hidden="true" />
              </div>

              <div className="bg-blue-50 dark:bg-gray-950/40 rounded-2xl p-3 sm:p-6 border border-gray-100 dark:border-gray-800/60 relative overflow-hidden">
                <div className="flex flex-row items-end justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className={`text-[12px] font-bold uppercase tracking-wider flex items-center gap-1 ${qv.dealPrice.color}`}>
                      {qv.dealPrice.text}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight font-engaging">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    {product.originalPrice && (
                       <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 dark:text-gray-600 line-through font-medium">
                            {formatPrice(product.originalPrice)}
                          </span>
                       </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-1.5 mb-1 ${qv.prime.color}`}>
                      <PrimeIcon className="w-4 h-4" aria-hidden="true" />
                      <span className="text-[12px] font-bold uppercase tracking-wider">{qv.prime.text}</span>
                    </div>
                    <span className={`text-[15px] ${qv.freeDelivery.color}`}>{qv.freeDelivery.text}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {gridItems.map((item, i) => {
                  const ItemIcon = resolveIcon(item.icon, CheckCircle2);
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-800/50">
                      <ItemIcon className={`w-5 h-5 flex-shrink-0 ${item.color}`} aria-hidden="true" />
                      <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 backdrop-blur-xl">
            <div className="flex flex-row gap-2">
              <button 
                onClick={onToggleFavorite} 
                className={`flex-1 flex items-center justify-center rounded-xl border transition-all duration-300 active:scale-95 ${
                  isFavorite 
                    ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200'
                }`}
                aria-label={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" /> 
              </button>

              <a
                href={getAffiliateUrl(product.url, config.affiliateTag)}
                target="_blank"
                className={`flex-[3] py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all duration-300 ${qv.buyButton.bgColor} ${qv.buyButton.color} ${qv.buyButton.hoverColor}`}
              >
                {qv.buyButton.text}
                <BuyIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </a>
              
              <button 
                onClick={handleShare} 
                className="flex-1 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all active:scale-95"
                aria-label="Share this product"
              >
                <Share2 className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
