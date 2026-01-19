
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import Sidebar from './components/Sidebar';
import ProductRow from './components/ProductRow';
import BrandLogos from './components/BrandLogos';
import QuickViewModal from './components/QuickViewModal';
import ScrollToTop from './components/ScrollToTop';
import NewsletterPopup from './components/NewsletterPopup';
import { performShare, parseCSV } from './utils';
import { Product } from './types';
import { Heart, Share2, Zap, CheckCircle2, Table, AlertCircle, RefreshCw, Sparkles, Flame } from 'lucide-react';
import { ConfigProvider, AppConfig, defaultConfig } from './contexts/ConfigContext';

const SHEET_ID = '1qrcB3H48Z-5N9JVThXUfQeIL55eAYcaigZqz5ZKQzD8';
// Using the /export?format=csv endpoint for better reliability and CORS handling
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-1',
    title: 'Apple iPhone 15 (128 GB) - Black',
    image: 'https://m.media-amazon.com/images/I/71657Zgn8rL._SL1500_.jpg',
    price: '71290',
    originalPrice: '79900',
    discountPercentage: '11%',
    rating: 4.6,
    reviewsCount: 12450,
    url: 'https://www.amazon.in/dp/B0CHX2F5QT'
  },
  {
    id: 'sample-2',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    image: 'https://m.media-amazon.com/images/I/51aB6U795QL._SL1500_.jpg',
    price: '29990',
    originalPrice: '34990',
    discountPercentage: '14%',
    rating: 4.5,
    reviewsCount: 8900,
    url: 'https://www.amazon.in/dp/B09XS7JWHH'
  },
  {
    id: 'sample-3',
    title: 'Samsung Galaxy Watch6 Bluetooth (44mm, Graphite)',
    image: 'https://m.media-amazon.com/images/I/61K-K8T0XvL._SL1500_.jpg',
    price: '21999',
    originalPrice: '32999',
    discountPercentage: '33%',
    rating: 4.3,
    reviewsCount: 3200,
    url: 'https://www.amazon.in/dp/B0C9HCYF7M'
  }
];

// Helper to map CSV rows to Product objects
const mapRowsToProducts = (rows: string[][], idPrefix: string): Product[] => {
  return rows.map((row, index) => {
    const getVal = (idx: number) => (row[idx] ? row[idx].toString().trim() : '');
    
    // Mapping: B=Title(1), C=URL(2), D=Image(3), E=Ratings/Reviews(4), F=Rate/Price(5)
    const title = getVal(1) || 'Untitled Product';
    const url = getVal(2) || '#';
    const image = getVal(3); 
    const price = getVal(5).replace(/[^\d.]/g, '') || '0';
    const rawColE = getVal(4);
    
    // Deterministic random generation for consistent UI based on title/index
    const seed = title.length + index;
    const rand = (offset: number) => {
       const x = Math.sin(seed + offset) * 10000;
       return x - Math.floor(x);
    };
    
    // Auto-generate rating if not explicitly parsed (keeping consistent with previous logic)
    const autoRating = 3.8 + (rand(0) * 1.2);
    const rating = parseFloat(autoRating.toFixed(1));

    // Parse reviews from Column E
    let reviewsCount = Math.floor(100 + (rand(1) * 19900));
    if (rawColE) {
        // Try to match "(12,345)" format
        const parenMatch = rawColE.match(/\(([\d,]+)\)/);
        if (parenMatch) {
             const val = parseInt(parenMatch[1].replace(/,/g, ''), 10);
             if (!isNaN(val)) reviewsCount = val;
        } else {
             // Try to match just numbers
             const cleanStr = rawColE.replace(/,/g, '').trim();
             const val = parseInt(cleanStr, 10);
             if (!isNaN(val) && val > 5) reviewsCount = val;
        }
    }

    // Calculate a fake original price for display if not provided (adding 15-40%)
    const numPrice = parseFloat(price);
    const originalPrice = numPrice > 0 ? (numPrice * (1 + (0.15 + rand(2) * 0.25))).toFixed(0) : undefined;
    const discountPercentage = originalPrice 
      ? Math.round(((parseInt(originalPrice) - numPrice) / parseInt(originalPrice)) * 100) + '%'
      : undefined;

    return {
      id: `${idPrefix}-${index}`,
      title, 
      image, 
      price,
      originalPrice,
      discountPercentage,
      rating, 
      reviewsCount, 
      url
    };
  }).filter(p => p.title !== 'Untitled Product' && p.image && p.image !== 'undefined' && p.price !== '0');
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [fetchError, setFetchError] = useState<boolean>(false);
  
  // Theme state initialization with System Sync logic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      // 1. Check local storage (Manual Override)
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      
      // 2. Fallback to System Preference
      try {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      } catch (e) {
        return 'light';
      }
    }
    return 'light';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [row1Title, setRow1Title] = useState<string>('Bestsellers');
  
  const [secondRowProducts, setSecondRowProducts] = useState<Product[]>([]);
  const [secondRowTitle, setSecondRowTitle] = useState<string>('Recommended');

  const [thirdRowProducts, setThirdRowProducts] = useState<Product[]>([]);
  const [thirdRowTitle, setThirdRowTitle] = useState<string>('Hot Deals');
  
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  // Effect to apply theme class to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Effect to listen for system preference changes (Only if no manual override exists)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if the user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern addEventListener
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Manual toggle handler - persists choice to storage
  const handleThemeToggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next); // Persist override
      return next;
    });
  }, []);

  const fetchSheetData = useCallback(async () => {
    try {
      setFetchError(false);
      const response = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      
      const text = await response.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        setProducts(SAMPLE_PRODUCTS);
        return;
      }

      // --- Configuration Logic (Rows 9-17, Col I) ---
      // I9 -> Row 8, Col 8 (0-indexed)
      const getCell = (r: number, c: number) => rows[r] && rows[r][c] ? rows[r][c].trim() : '';
      
      const fetchedConfig: AppConfig = {
        affiliateTag: getCell(8, 8) || defaultConfig.affiliateTag,         // I9
        shareMessage: getCell(9, 8) || defaultConfig.shareMessage,         // I10
        productShareMessage: getCell(10, 8) || defaultConfig.productShareMessage, // I11
        headerTitle: getCell(12, 8) || defaultConfig.headerTitle,          // I13
        headerSubtitle: getCell(13, 8) || defaultConfig.headerSubtitle,    // I14
        footerText: getCell(15, 8) || defaultConfig.footerText,            // I16
        footerDisclaimer: getCell(16, 8) || defaultConfig.footerDisclaimer // I17
      };
      setConfig(fetchedConfig);

      // --- Row 1 Logic ---
      if (rows.length > 0 && rows[0][0]) {
        setRow1Title(rows[0][0]);
      } else {
        setRow1Title('Bestsellers');
      }

      const dataRows1 = rows.slice(1, 31);
      const mappedProducts1 = mapRowsToProducts(dataRows1, 'sheet-prod');

      if (mappedProducts1.length === 0) {
        setProducts(SAMPLE_PRODUCTS);
      } else {
        setProducts(mappedProducts1);
      }

      // --- Row 2 Logic ---
      if (rows.length > 32) {
        const titleVal = rows[32][0];
        setSecondRowTitle(titleVal || 'Recommended Deals');

        const dataRows2 = rows.slice(33, 63);
        const mappedProducts2 = mapRowsToProducts(dataRows2, 'sheet-prod-row2');
        setSecondRowProducts(mappedProducts2);
      } else {
        setSecondRowProducts([]);
      }

      // --- Row 3 Logic ---
      if (rows.length > 64) {
        const titleVal = rows[64][0];
        setThirdRowTitle(titleVal || 'Hot Deals');

        const dataRows3 = rows.slice(65, 95);
        const mappedProducts3 = mapRowsToProducts(dataRows3, 'sheet-prod-row3');
        setThirdRowProducts(mappedProducts3);
      } else {
        setThirdRowProducts([]);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Sheet Sync Failed. Ensure sheet is Public (Anyone with link can view). Error:", error);
      setFetchError(true);
      if (products.length === 0) setProducts(SAMPLE_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, [products.length]);

  useEffect(() => { 
    fetchSheetData(); 
    const intervalId = setInterval(fetchSheetData, 60000); // 1 minute interval
    return () => clearInterval(intervalId);
  }, [fetchSheetData]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) { try { setFavorites(new Set(JSON.parse(saved))); } catch (e) {} }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('favorites', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const favoriteList = useMemo(() => {
    const allProducts = [...products, ...secondRowProducts, ...thirdRowProducts];
    const seen = new Set();
    return allProducts.filter(p => favorites.has(p.id) && !seen.has(p.id) && seen.add(p.id));
  }, [favorites, products, secondRowProducts, thirdRowProducts]);

  return (
    <ConfigProvider value={config}>
      <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-950">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(true)} 
          favoritesCount={favorites.size} 
          onFavoritesClick={() => document.getElementById('favorites-row')?.scrollIntoView({ behavior: 'smooth' })} 
          theme={theme} 
          toggleTheme={handleThemeToggle} 
        />
        
        <CategoryBar />
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          theme={theme}
          toggleTheme={handleThemeToggle}
        />

        <main className="pb-3">
          {/* Row 1 */}
          <div className="mt-3">
            <ProductRow 
              title={
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 fill-current" />
                  <h1 className="text-lg sm:text-2xl font-medium font-engaging tracking-tighter text-gray-700 dark:text-white">
                    {fetchError ? 'Trending Now' : row1Title}
                  </h1>
                </div>
              }
              titleStr={fetchError ? 'Trending Now' : row1Title}
              headerActions={
                <button 
                  onClick={() => { setIsLoading(true); fetchSheetData(); }} 
                  className={`flex items-center gap-2 px-2 py-1 rounded-full border transition-all active:scale-95 group ${
                    fetchError 
                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-500' 
                      : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
                  }`}
                  title={fetchError ? "Retry Connection" : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                >
                  <div className="relative flex items-center justify-center w-2 h-2">
                    {!fetchError && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${fetchError ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </div>
                  <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest leading-none">
                    {fetchError ? 'Offline' : 'Live Sync'}
                  </span>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`} />
                </button>
              }
              products={products} 
              favorites={favorites} 
              onToggleFavorite={toggleFavorite} 
              onQuickView={setQuickViewProduct} 
              isLoading={isLoading} 
            />
          </div>

          {/* Row 2 */}
          {secondRowProducts.length > 0 && (
            <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
              <ProductRow 
                title={
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 fill-current" />
                    <h1 className="text-lg sm:text-2xl font-medium font-engaging tracking-tighter text-gray-700 dark:text-white">
                      {secondRowTitle}
                    </h1>
                  </div>
                }
                titleStr={secondRowTitle}
                products={secondRowProducts} 
                favorites={favorites} 
                onToggleFavorite={toggleFavorite} 
                onQuickView={setQuickViewProduct} 
                isLoading={isLoading} 
              />
            </div>
          )}

          {/* Row 3 */}
          {thirdRowProducts.length > 0 && (
            <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
              <ProductRow 
                title={
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-current" />
                    <h1 className="text-lg sm:text-2xl font-medium font-engaging tracking-tighter text-gray-700 dark:text-white">
                      {thirdRowTitle}
                    </h1>
                  </div>
                }
                titleStr={thirdRowTitle}
                products={thirdRowProducts} 
                favorites={favorites} 
                onToggleFavorite={toggleFavorite} 
                onQuickView={setQuickViewProduct} 
                isLoading={isLoading} 
              />
            </div>
          )}

          {fetchError && (
            <div className="max-w-[90rem] mx-auto px-6 mt-2 mb-4">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-[11px] font-bold">Failed to sync with Google Sheets. Displaying cached trending products.</p>
              </div>
            </div>
          )}

          {favorites.size > 0 && (
            <div id="favorites-row" className="mt-3 border-t border-gray-100 dark:border-gray-800 bg-orange-50/10 dark:bg-orange-950/5 pt-3 pb-4">
               <ProductRow 
                 title={
                   <div className="flex items-center gap-2">
                     <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-current" />
                     <h1 className="text-lg sm:text-2xl font-medium font-engaging tracking-tighter text-gray-700 dark:text-white">
                       Watchlist
                     </h1>
                   </div>
                 }
                 titleStr="Watchlist"
                 products={favoriteList} 
                 favorites={favorites} 
                 onToggleFavorite={toggleFavorite} 
                 onQuickView={setQuickViewProduct} 
               />
            </div>
          )}

          <BrandLogos />
        </main>

        <NewsletterPopup />

        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
          isFavorite={!!quickViewProduct && favorites.has(quickViewProduct.id)} 
          onToggleFavorite={() => quickViewProduct && toggleFavorite(quickViewProduct.id)} 
        />
        
        <ScrollToTop />
        
        <button 
          onClick={() => performShare({ 
            title: config.headerTitle, 
            text: `${config.shareMessage}\n\nVisit:\n`,
            url: window.location.href 
          })} 
          className="fixed bottom-6 right-4 p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl z-40 transition-transform active:scale-95 border-2 border-white dark:border-gray-800"
          aria-label="Share App"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <footer className="relative bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 overflow-hidden">
          {/* Decorative Top Gradient Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
          
          <div className="max-w-4xl mx-auto px-6 py-6 text-center">
            
            {/* Main Footer Text */}
            <h3 className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 mb-2">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>{config.footerText}</span>
            </h3>

            {/* Amazon Disclaimer */}
            <p className="text-[10px] leading-relaxed text-gray-400 dark:text-gray-500 max-w-lg mx-auto font-medium opacity-80">
              {config.footerDisclaimer}
            </p>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
};

export default App;
