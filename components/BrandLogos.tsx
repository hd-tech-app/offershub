
import React from 'react';
import { getAffiliateUrl } from '../utils';
import { useConfig } from '../contexts/ConfigContext';

const BrandLogos: React.FC = () => {
  const { affiliateTag, brands } = useConfig();
  
  // Duplicate brands for seamless infinite loop
  const brandsList = [...brands, ...brands];

  return (
    <section className="relative py-6 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm overflow-hidden">
      
      {/* Section Header */}
      <div className="flex justify-center mb-8">
        <h3 className="text-xs sm:text-sm font-black text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase">
          Shop with Trusted Brands
        </h3>
      </div>

      {/* Enhanced Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-gray-950 to-transparent z-10 pointer-events-none" />

      <div className="relative w-full group/track">
        <div 
          className="animate-marquee flex items-center gap-4 pl-6"
          style={{ animationDuration: '80s' }}
        >
          {brandsList.map((brand, idx) => (
            <a
              key={`${brand.name}-${idx}`}
              href={getAffiliateUrl(brand.url, affiliateTag)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 relative flex items-center justify-center w-40 h-20 sm:w-52 sm:h-28 bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-500/20 dark:hover:bg-gray-100 transition-all duration-500 group/card"
              title={`Shop ${brand.name}`}
            >
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="relative z-10 h-12 sm:h-14 w-auto object-contain max-w-[85%]
                  opacity-50 grayscale 
                  group-hover/card:opacity-100 group-hover/card:grayscale-0 
                  dark:invert dark:opacity-50
                  dark:group-hover/card:invert-0 dark:group-hover/card:opacity-100
                  transition-all duration-500 ease-out transform group-hover/card:scale-110"
                loading="lazy"
                decoding="async"
                width="140" 
                height="140"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
