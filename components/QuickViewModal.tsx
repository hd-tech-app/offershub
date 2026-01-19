
import React, { useState } from 'react';
import { X, Star, Share2, Heart, Zap, ShieldCheck, Truck, ArrowRight, StarHalf, Info, CheckCircle2, Package, Globe, TrendingUp, Clock } from 'lucide-react';
import { Product } from '../types';
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
  const config = useConfig();
  
  if (!product) return null;

  const handleShare = () => {
    shareProduct(product, config.affiliateTag, config.productShareMessage);
  };

  // Premium Star Rating System
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop - Animation Removed */}
      <div 
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal Showroom - Animation Removed */}
      <div className="relative w-full max-w-5xl h-[95vh] sm:h-auto sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col sm:grid sm:grid-cols-12 overflow-hidden border border-white/10">
        
        {/* Mobile Indicator Bar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-200 dark:bg-gray-800 rounded-full sm:hidden z-20" />

        {/* PROMINENT Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-md rounded-full z-[110] transition-all border border-gray-200 dark:border-gray-700 shadow-sm group flex items-center justify-center"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* 1. VISUAL CANVAS - Optimized Spacing */}
        <div className="relative col-span-5 bg-gray-50/50 dark:bg-gray-950/40 flex items-center justify-center p-6 sm:p-8 overflow-hidden border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800/50 group/img shrink-0 sm:shrink">
          <div className="absolute -inset-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent blur-2xl opacity-60 pointer-events-none" />
          
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
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-blue-900 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-gray-800 uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> Amazon Verified
            </span>
          </div>
        </div>

        {/* 2. DETAIL SHOWROOM - Compact Layout */}
        <div className="col-span-7 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 no-scrollbar">
            <div className="max-w-xl mx-auto sm:mx-0 space-y-4">
              
              {/* Status & Engagement Bar */}
              <div className="flex flex-row items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {product.discountPercentage ? (
                    <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-bold rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                      {product.discountPercentage} OFF
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-orange-600 text-white text-[9px] font-bold rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Trending
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[9px] font-bold rounded-md uppercase tracking-wider border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3" /> In Stock
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 pr-6">
                   <div className="flex items-center gap-0.5">
                      {renderStars(product.rating)}
                   </div>
                   <span className="text-xs font-bold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
                   <span className="text-[10px] text-gray-500 font-medium">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Product Header */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white leading-normal">
                  {product.title}
                </h2>
                <div className="h-1 w-12 bg-orange-500 rounded-full" />
              </div>

              {/* Pricing Canvas */}
              <div className="bg-blue-50 dark:bg-gray-950/40 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800/60 relative overflow-hidden">
                <div className="flex flex-row items-end justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[12px] text-orange-400 font-bold uppercase tracking-wider">Deal Price</span>
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
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                      <Truck className="w-4 h-4" />
                      <span className="text-[12px] font-bold uppercase tracking-wider">Prime</span>
                    </div>
                    <span className="text-[15px] text-gray-500 dark:text-gray-400">Free Delivery</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Manufacturer Warranty",
                  "Verified Seller",
                  "Secure Transaction",
                  "COD & Easy Returns"
                ].map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-800/50">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION FOOTER */}
          <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 backdrop-blur-xl">
            <div className="flex flex-row gap-3">
              <button 
                onClick={onToggleFavorite} 
                className={`flex-1 flex items-center justify-center rounded-xl border transition-all duration-300 active:scale-95 ${
                  isFavorite 
                    ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} /> 
              </button>

              <a
                href={getAffiliateUrl(product.url, config.affiliateTag)}
                target="_blank"
                className="flex-[3] bg-gray-900 dark:bg-orange-600 hover:[background-color:rgb(234_88_12/var(--tw-bg-opacity,1))] dark:hover:bg-orange-500 text-white py-3 sm:py-3.5 rounded-xl font-bold text-lm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all duration-300 [background-color:rgb(255_179_4/var(--tw-bg-opacity,1))]"
              >
                Buy on Amazon
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              
              <button 
                onClick={handleShare} 
                className="flex-1 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all active:scale-95"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
