
import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import Sidebar from './components/Sidebar';
import ProductRow from './components/ProductRow';
import ScrollToTop from './components/ScrollToTop';
import { performShare, parseCSV } from './utils';
import { Product, ALL_ICONS, Category, DEFAULT_CATEGORIES, Brand, DEFAULT_BRANDS } from './constants';
import { Heart, Rocket, Zap, RefreshCw, Sparkles, Flame, Gift, TrendingUp, Tag, Mail } from 'lucide-react';
import { ConfigProvider, AppConfig, defaultConfig, SocialLink, RowConfig, QuickViewSettings, defaultQuickViewSettings, BadgeOption, DEFAULT_BADGE_OPTIONS, SmartMessageConfig, ThemeOverrides } from './contexts/ConfigContext';

// Lazy load non-critical components to reduce initial bundle size
const BrandLogos = React.lazy(() => import('./components/BrandLogos'));
const QuickViewModal = React.lazy(() => import('./components/QuickViewModal'));
const NewsletterPopup = React.lazy(() => import('./components/NewsletterPopup'));
const SmartMessagePopup = React.lazy(() => import('./components/SmartMessagePopup'));
const ContactUsPopup = React.lazy(() => import('./components/ContactUsPopup'));
const InAppBrowserBypass = React.lazy(() => import('./components/InAppBrowserBypass'));
const OfflinePopup = React.lazy(() => import('./components/OfflinePopup'));

const SHEET_ID = '1qrcB3H48Z-5N9JVThXUfQeIL55eAYcaigZqz5ZKQzD8';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// Performance Optimization: Prefetch data immediately before React mounts to minimize TTI (Time to Interactive)
const prefetchData = () => {
  if (typeof window === 'undefined') return null;
  return fetch(`${SHEET_CSV_URL}&t=${Date.now()}`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.text();
    })
    .catch(err => {
      console.warn('Prefetch failed:', err);
      return null;
    });
};

// Initiate prefetch immediately
const preloadedDataPromise = prefetchData();

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

const LazySection: React.FC<{ children: React.ReactNode; threshold?: number }> = ({ children, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Optimization: If IO not supported, show immediately
    if (!('IntersectionObserver' in window)) {
        setIsVisible(true);
        return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      // Increase rootMargin to 200px to start loading content before it enters viewport
      // This makes scrolling feel faster and smoother
      { threshold, rootMargin: '200px' } 
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return <div ref={ref} className="min-h-[100px]">{isVisible ? children : null}</div>;
};

const mapRowsToProducts = (rows: string[][], idPrefix: string): Product[] => {
  return rows.map((row, index) => {
    const getVal = (idx: number) => (row[idx] ? row[idx].toString().trim() : '');
    const title = getVal(1) || 'Untitled Product';
    const url = getVal(2) || '#';
    const image = getVal(3); 
    const price = getVal(5).replace(/[^\d.]/g, '') || '0';
    const rawColE = getVal(4);
    const seed = title.length + index;
    const rand = (offset: number) => {
       const x = Math.sin(seed + offset) * 10000;
       return x - Math.floor(x);
    };
    const autoRating = 3.8 + (rand(0) * 1.2);
    const rating = parseFloat(autoRating.toFixed(1));
    let reviewsCount = Math.floor(100 + (rand(1) * 19900));
    if (rawColE) {
        const parenMatch = rawColE.match(/\(([\d,]+)\)/);
        if (parenMatch) {
             const val = parseInt(parenMatch[1].replace(/,/g, ''), 10);
             if (!isNaN(val)) reviewsCount = val;
        } else {
             const cleanStr = rawColE.replace(/,/g, '').trim();
             const val = parseInt(cleanStr, 10);
             if (!isNaN(val) && val > 5) reviewsCount = val;
        }
    }
    const numPrice = parseFloat(price);
    const originalPrice = numPrice > 0 ? (numPrice * (1 + (0.21 + rand(2) * 0.85))).toFixed(0) : undefined;
    const discountPercentage = originalPrice 
      ? Math.round(((parseInt(originalPrice) - numPrice) / parseInt(originalPrice)) * 100) + '%'
      : undefined;
    return { id: `${idPrefix}-${index}`, title, image, price, originalPrice, discountPercentage, rating, reviewsCount, url };
  }).filter(p => p.title !== 'Untitled Product' && p.image && p.image !== 'undefined' && p.price !== '0');
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, Product>>({});
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [message1Finished, setMessage1Finished] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved as 'light' | 'dark';
    }
    return 'light';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [row1Title, setRow1Title] = useState<string>('Bestsellers');
  const [secondRowProducts, setSecondRowProducts] = useState<Product[]>([]);
  const [secondRowTitle, setSecondRowTitle] = useState<string>('Recommended');
  const [thirdRowProducts, setThirdRowProducts] = useState<Product[]>([]);
  const [thirdRowTitle, setThirdRowTitle] = useState<string>('Hot Deals');
  const [fourthRowProducts, setFourthRowProducts] = useState<Product[]>([]);
  const [fourthRowTitle, setFourthRowTitle] = useState<string>('Special Selection');
  const [fifthRowProducts, setFifthRowProducts] = useState<Product[]>([]);
  const [fifthRowTitle, setFifthRowTitle] = useState<string>('Trending Now');
  const [sixthRowProducts, setSixthRowProducts] = useState<Product[]>([]);
  const [sixthRowTitle, setSixthRowTitle] = useState<string>('Editor\'s Pick');
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  // Performance Optimization: Track last data to avoid unnecessary parsing
  const lastFetchedData = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.warn(`Fullscreen failed: ${e.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const fetchSheetData = useCallback(async () => {
    try {
      setFetchError(false);
      let text: string | null = null;
      
      // Use preloaded data only on the very first render
      if (isFirstLoad.current && preloadedDataPromise) {
        text = await preloadedDataPromise;
        isFirstLoad.current = false;
      }
      
      // If preloaded data was not available or already used, fetch fresh
      if (!text) {
        const response = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        text = await response.text();
      }

      if (!text) throw new Error("Empty data received");
      
      // Optimization: Skip expensive parsing if data hasn't changed
      if (text === lastFetchedData.current) {
         setIsLoading(false);
         setLastUpdated(new Date());
         return;
      }
      lastFetchedData.current = text;

      const rows = parseCSV(text);
      if (rows.length < 2) {
        setProducts(SAMPLE_PRODUCTS);
        return;
      }
      const getCell = (r: number, c: number) => rows[r] && rows[r][c] ? rows[r][c].trim() : '';
      const socialLinks: SocialLink[] = [];
      for (let i = 19; i <= 24; i++) {
        if (rows.length > i) {
          const name = getCell(i, 7); const url = getCell(i, 8); const icon = getCell(i, 9); const color = getCell(i, 10);
          if (name && url) socialLinks.push({ name, url, icon, color });
        }
      }
      const parsedCategories: Category[] = [];
      for (let i = 33; i <= 61; i++) {
        if (rows.length > i) {
          const name = getCell(i, 7); const url = getCell(i, 8); const icon = getCell(i, 9); const color = getCell(i, 10);
          if (name && url) parsedCategories.push({ name, url, icon: icon || 'Circle', color: color || 'text-gray-600' });
        }
      }
      const parsedBrands: Brand[] = [];
      for (let i = 69; i <= 93; i++) {
        if (rows.length > i) {
          const name = getCell(i, 7); const logo = getCell(i, 8); const url = getCell(i, 9);
          if (name && logo) parsedBrands.push({ name, logo, url: url || '#' });
        }
      }
      const headerIcon = (rows.length > 12 ? getCell(12, 9) : '') || defaultConfig.headerIcon;
      // Row 13 (index 12), Column K (index 10) for Header Icon Bg Color (K13)
      const headerIconColor = (rows.length > 12 ? getCell(12, 10) : '') || defaultConfig.headerIconColor;
      const headerIconShadow = (rows.length > 12 ? getCell(12, 11) : '') || defaultConfig.headerIconShadow;
      // Row 13 (index 12), Column M (index 12) for Header Title Color (M13)
      const headerTitleColor = (rows.length > 12 ? getCell(12, 12) : '') || defaultConfig.headerTitleColor;
      // Row 14 (index 13), Column K (index 10) for Header Subtitle Color (K14)
      const headerSubtitleColor = (rows.length > 13 ? getCell(13, 10) : '') || defaultConfig.headerSubtitleColor;
      const productRowConfigs: RowConfig[] = [];
      for (let i = 1; i <= 6; i++) {
        if (rows.length > i) {
          const icon = getCell(i, 9) || 'Zap';
          const color = getCell(i, 10) || 'text-orange-500';
          productRowConfigs.push({ icon, color });
        } else {
          productRowConfigs.push(defaultConfig.productRowConfigs[i-1] || { icon: 'Circle', color: 'text-gray-500' });
        }
      }
      
      const quickView: QuickViewSettings = {
        inStock: { text: getCell(99, 8) || defaultQuickViewSettings.inStock.text, icon: getCell(99, 9) || defaultQuickViewSettings.inStock.icon, color: getCell(99, 10) || defaultQuickViewSettings.inStock.color },
        prime: { text: getCell(100, 8) || defaultQuickViewSettings.prime.text, icon: getCell(100, 9) || defaultQuickViewSettings.prime.icon, color: getCell(100, 10) || defaultQuickViewSettings.prime.color },
        freeDelivery: { text: getCell(101, 8) || defaultQuickViewSettings.freeDelivery.text, icon: getCell(101, 9) || defaultQuickViewSettings.freeDelivery.icon, color: getCell(101, 10) || defaultQuickViewSettings.freeDelivery.color },
        amazonVerified: { text: getCell(102, 8) || defaultQuickViewSettings.amazonVerified.text, icon: getCell(102, 9) || defaultQuickViewSettings.amazonVerified.icon, color: getCell(102, 10) || defaultQuickViewSettings.amazonVerified.color },
        dealPrice: { text: getCell(103, 8) || defaultQuickViewSettings.dealPrice.text, icon: getCell(103, 9) || defaultQuickViewSettings.dealPrice.icon, color: getCell(103, 10) || defaultQuickViewSettings.dealPrice.color },
        warranty: { text: getCell(104, 8) || defaultQuickViewSettings.warranty.text, icon: getCell(104, 9) || defaultQuickViewSettings.warranty.icon, color: getCell(104, 10) || defaultQuickViewSettings.warranty.color },
        verifiedSeller: { text: getCell(105, 8) || defaultQuickViewSettings.verifiedSeller.text, icon: getCell(105, 9) || defaultQuickViewSettings.verifiedSeller.icon, color: getCell(105, 10) || defaultQuickViewSettings.verifiedSeller.color },
        secureTransaction: { text: getCell(106, 8) || defaultQuickViewSettings.secureTransaction.text, icon: getCell(106, 9) || defaultQuickViewSettings.secureTransaction.icon, color: getCell(106, 10) || defaultQuickViewSettings.secureTransaction.color },
        codReturns: { text: getCell(107, 8) || defaultQuickViewSettings.codReturns.text, icon: getCell(107, 9) || defaultQuickViewSettings.codReturns.icon, color: getCell(107, 10) || defaultQuickViewSettings.codReturns.color },
        buyButton: { 
          text: getCell(108, 8) || defaultQuickViewSettings.buyButton.text, 
          icon: getCell(108, 9) || defaultQuickViewSettings.buyButton.icon, 
          color: getCell(108, 10) || defaultQuickViewSettings.buyButton.color,
          bgColor: getCell(108, 11) || defaultQuickViewSettings.buyButton.bgColor,
          hoverColor: getCell(108, 12) || defaultQuickViewSettings.buyButton.hoverColor
        }
      };

      const productCardBuyButton = {
        text: getCell(109, 8) || defaultConfig.productCardBuyButton.text,
        icon: getCell(109, 9) || defaultConfig.productCardBuyButton.icon,
        color: getCell(109, 10) || defaultConfig.productCardBuyButton.color,
        bgColor: getCell(109, 11) || defaultConfig.productCardBuyButton.bgColor,
        hoverColor: getCell(109, 12) || defaultConfig.productCardBuyButton.hoverColor,
      };

      const checkToggle = (val: string) => {
        const up = val.toUpperCase().trim();
        return up === 'ON' || up === 'TRUE';
      };

      const showBadges = checkToggle(getCell(112, 9) || 'ON');
      const showDiscounts = checkToggle(getCell(113, 9) || 'ON');
      const liveSyncText = getCell(114, 8) || defaultConfig.liveSyncText;
      const showLiveSync = checkToggle(getCell(114, 9) || 'ON');
      
      const badgeOptions: BadgeOption[] = [];
      for(let i=115; i<=124; i++) {
        const label = getCell(i, 8);
        const className = getCell(i, 10);
        if(label && className) badgeOptions.push({ label, className });
      }

      const rawShowsPerDay = parseFloat(getCell(129, 9));
      const smartMessage: SmartMessageConfig = {
        show: checkToggle(getCell(128, 9) || 'OFF'),
        delay: parseInt(getCell(129, 8).replace(/\D/g, '')) || 2000,
        showsPerDay: !isNaN(rawShowsPerDay) ? rawShowsPerDay : 1, 
        imageUrl: getCell(130, 8),
        headline: getCell(131, 8),
        body: getCell(132, 8),
        buttonLink: getCell(133, 8),
        buttonClass: getCell(133, 10),
        buttonText: getCell(134, 8),
        buttonColor: getCell(134, 10),
      };

      const rawShowsPerDay2 = parseFloat(getCell(138, 9)); 
      const smartMessage2: SmartMessageConfig = {
        show: checkToggle(getCell(137, 9) || 'OFF'), 
        delay: parseInt(getCell(138, 8).replace(/\D/g, '')) || 2000, 
        showsPerDay: !isNaN(rawShowsPerDay2) ? rawShowsPerDay2 : 1, 
        imageUrl: getCell(139, 8), 
        headline: getCell(140, 8), 
        body: getCell(141, 8), 
        buttonLink: getCell(142, 8), 
        buttonClass: getCell(142, 10), 
        buttonText: getCell(143, 8), 
        buttonColor: '' 
      };

      const themeOverrides: ThemeOverrides = {
        primaryColor: getCell(147, 8), 
        backgroundColorLight: getCell(147, 9), 
        backgroundColorDark: getCell(147, 10), 
        starRatingColor: getCell(148, 8) 
      };

      const googlePlayLink = rows.length > 25 ? getCell(25, 8) : '';
      const newsletterTitle = (rows.length > 27 ? getCell(27, 8) : '') || defaultConfig.newsletterTitle;
      const newsletterSubtitle = (rows.length > 28 ? getCell(28, 8) : '') || defaultConfig.newsletterSubtitle;
      const newsletterFooter = (rows.length > 29 ? getCell(29, 8) : '') || defaultConfig.newsletterFooter;
      
      const newsletterScriptUrl = getCell(153, 8) || defaultConfig.newsletterScriptUrl;
      const contactScriptUrl = getCell(154, 8) || defaultConfig.contactScriptUrl;

      const fetchedConfig: AppConfig = {
        affiliateTag: getCell(8, 8) || defaultConfig.affiliateTag,
        shareMessage: getCell(9, 8) || defaultConfig.shareMessage,
        productShareMessage: getCell(10, 8) || defaultConfig.productShareMessage,
        headerTitle: getCell(12, 8) || defaultConfig.headerTitle, 
        headerTitleColor,
        headerSubtitle: getCell(13, 8) || defaultConfig.headerSubtitle,
        headerSubtitleColor, footerText: getCell(15, 8) || defaultConfig.footerText,
        footerDisclaimer: getCell(16, 8) || defaultConfig.footerDisclaimer,
        socialLinks, googlePlayLink, categories: parsedCategories.length > 0 ? parsedCategories : DEFAULT_CATEGORIES,
        newsletterTitle, newsletterSubtitle, newsletterFooter, brands: parsedBrands.length > 0 ? parsedBrands : DEFAULT_BRANDS,
        headerIcon, headerIconColor, headerIconShadow, productRowConfigs,
        quickView,
        liveSyncText,
        showLiveSync,
        showBadges,
        showDiscounts,
        badgeOptions: badgeOptions.length > 0 ? badgeOptions : DEFAULT_BADGE_OPTIONS,
        productCardBuyButton,
        smartMessage,
        smartMessage2,
        themeOverrides,
        newsletterScriptUrl,
        contactScriptUrl
      };
      setConfig(fetchedConfig);

      if (rows.length > 0 && rows[0][0]) setRow1Title(rows[0][0]);
      const dataRows1 = rows.slice(1, 31);
      const mappedProducts1 = mapRowsToProducts(dataRows1, 'sheet-prod');
      if (mappedProducts1.length === 0) setProducts(SAMPLE_PRODUCTS);
      else setProducts(mappedProducts1);

      if (rows.length > 34) {
        setSecondRowTitle(rows[34][0] || 'Recommended Deals');
        setSecondRowProducts(mapRowsToProducts(rows.slice(35, 65), 'sheet-prod-row2'));
      }
      if (rows.length > 68) {
        setThirdRowTitle(rows[68][0] || 'Hot Deals');
        setThirdRowProducts(mapRowsToProducts(rows.slice(69, 99), 'sheet-prod-row3'));
      }
      if (rows.length > 102) {
        setFourthRowTitle(rows[102][0] || 'Special Selection');
        setFourthRowProducts(mapRowsToProducts(rows.slice(103, 133), 'sheet-prod-row4'));
      }
      if (rows.length > 136) {
        setFifthRowTitle(rows[136][0] || 'Trending Now');
        setFifthRowProducts(mapRowsToProducts(rows.slice(137, 167), 'sheet-prod-row5'));
      }
      if (rows.length > 170) {
        setSixthRowTitle(rows[170][0] || 'Editor\'s Pick');
        setSixthRowProducts(mapRowsToProducts(rows.slice(171, 201), 'sheet-prod-row6'));
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Sheet Sync Failed.", error);
      setFetchError(true);
      if (products.length === 0) setProducts(SAMPLE_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array as this function is self-contained and uses refs for state

  useEffect(() => { 
    fetchSheetData(); 
    const intervalId = setInterval(fetchSheetData, 60000); 
    return () => clearInterval(intervalId);
  }, [fetchSheetData]);

  const customThemeStyles = useMemo(() => {
    const { primaryColor, backgroundColorLight, backgroundColorDark } = config.themeOverrides;
    if (!primaryColor && !backgroundColorLight && !backgroundColorDark) return null;

    return (
      <style>{`
        ${primaryColor ? `
          :root { --primary-color: ${primaryColor}; }
          .text-orange-500, .text-orange-600, .dark\\:text-orange-400, .dark\\:text-orange-500, .group:hover .group-hover\\:text-orange-600, .hover\\:text-orange-500:hover, .hover\\:text-orange-600:hover, .dark .group:hover .dark\\:group-hover\\:text-orange-400 { color: ${primaryColor} !important; }
          .bg-orange-500, .bg-orange-600, .hover\\:bg-orange-500:hover, .hover\\:bg-orange-600:hover, .dark\\:bg-orange-600, .dark\\:hover\\:bg-orange-600:hover, .group:hover .group-hover\\:bg-orange-500, .group:hover .group-hover\\:bg-orange-600 { background-color: ${primaryColor} !important; }
          .border-orange-200, .border-orange-500, .hover:shadow-orange-400/15, .focus-visible\\:ring-orange-500:focus-visible { border-color: ${primaryColor} !important; outline-color: ${primaryColor} !important; }
          .fill-orange-500 { fill: ${primaryColor} !important; }
          .bg-orange-50, { background-color: ${primaryColor}15 !important; } 
          .hover\\:bg-orange-50:hover { background-color: ${primaryColor}20 !important; }
          .bg-orange-100 { background-color: ${primaryColor}33 !important; }
          .hover\\:bg-orange-100:hover { background-color: ${primaryColor}40 !important; }
        ` : ''}
        ${backgroundColorLight ? `html:not(.dark) body, html:not(.dark) .bg-white, .bg-gray-50 { background-color: ${backgroundColorLight} !important; }` : ''}
        ${backgroundColorDark ? `html.dark body, html.dark .bg-gray-950, html.dark .bg-gray-900 { background-color: ${backgroundColorDark} !important; }` : ''}
      `}</style>
    );
  }, [config.themeOverrides]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites_v2');
    if (saved) { try { setFavorites(JSON.parse(saved)); } catch (e) {} }
  }, []);

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites(prev => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = product;
      }
      localStorage.setItem('favorites_v2', JSON.stringify(next));
      return next;
    });
  }, []);

  const favoriteList = useMemo(() => Object.values(favorites), [favorites]);
  const favoritesIds = useMemo(() => new Set(Object.keys(favorites)), [favorites]);
  const favoritesCount = useMemo(() => Object.keys(favorites).length, [favorites]);

  const renderRowTitle = useCallback((titleText: string, rowIndex: number, fallbackIcon: any, fallbackColor: string) => {
    const rowConfig = config.productRowConfigs[rowIndex];
    const iconName = rowConfig?.icon || '';
    const colorClass = rowConfig?.color || fallbackColor;
    const DynamicIcon = ALL_ICONS[iconName.trim()] || ALL_ICONS[iconName.trim().charAt(0).toUpperCase() + iconName.trim().slice(1)] || fallbackIcon;
    return (
      <div className="flex items-center gap-2">
        <DynamicIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass} fill-current`} />
        <h1 className="text-lg sm:text-2xl font-medium font-engaging tracking-tighter text-gray-700 dark:text-white">{titleText}</h1>
      </div>
    );
  }, [config.productRowConfigs]);

  const headerActions = useMemo(() => {
    if (!config.showLiveSync) return null;
    return (
      <button 
        onClick={() => { setIsLoading(true); fetchSheetData(); }} 
        className={`flex items-center gap-2 px-2 py-1 rounded-full border transition-all active:scale-95 group ${fetchError ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-500' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20'}`} 
        title={fetchError ? "Retry Connection" : `Last updated: ${lastUpdated.toLocaleTimeString()}`}
      >
        <div className="relative flex items-center justify-center w-2 h-2">
          {!fetchError && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${fetchError ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        </div>
        <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest leading-none">{fetchError ? 'Offline' : config.liveSyncText}</span>
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`} />
      </button>
    );
  }, [fetchError, lastUpdated, isLoading, fetchSheetData, config.liveSyncText, config.showLiveSync]);

  const onQuickViewClose = useCallback(() => setQuickViewProduct(null), []);
  const onFavoritesClick = useCallback(() => document.getElementById('favorites-row')?.scrollIntoView({ behavior: 'smooth' }), []);
  const onMenuToggle = useCallback(() => setIsSidebarOpen(true), []);
  const onSidebarClose = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <ConfigProvider value={config}>
      {customThemeStyles}
      <Suspense fallback={null}>
         <InAppBrowserBypass />
         <OfflinePopup />
      </Suspense>
      <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-950">
        <Header 
          onMenuToggle={onMenuToggle} 
          favoritesCount={favoritesCount} 
          onFavoritesClick={onFavoritesClick} 
          theme={theme} 
          toggleTheme={handleThemeToggle} 
        />
        <CategoryBar />
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={onSidebarClose} 
          theme={theme} 
          toggleTheme={handleThemeToggle} 
          isFullscreen={isFullscreen} 
          onToggleFullscreen={handleToggleFullscreen} 
        />
        <main className="pb-0">
          <div className="mt-3">
            <ProductRow 
              title={renderRowTitle(fetchError ? 'Trending Now' : row1Title, 0, Zap, 'text-orange-500')} 
              titleStr={fetchError ? 'Trending Now' : row1Title} 
              headerActions={headerActions} 
              products={products} 
              favorites={favoritesIds} 
              onToggleFavorite={toggleFavorite} 
              onQuickView={setQuickViewProduct} 
              isLoading={isLoading}
              isPriority={true} // Priority loading for above-the-fold content
            />
          </div>
          {secondRowProducts.length > 0 && (
            <LazySection>
              <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
                <ProductRow title={renderRowTitle(secondRowTitle, 1, Sparkles, 'text-purple-500')} titleStr={secondRowTitle} products={secondRowProducts} favorites={favoritesIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} isLoading={isLoading} />
              </div>
            </LazySection>
          )}
          {thirdRowProducts.length > 0 && (
            <LazySection>
              <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
                <ProductRow title={renderRowTitle(thirdRowTitle, 2, Flame, 'text-red-500')} titleStr={thirdRowTitle} products={thirdRowProducts} favorites={favoritesIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} isLoading={isLoading} />
              </div>
            </LazySection>
          )}
          {fourthRowProducts.length > 0 && (
            <LazySection>
              <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
                <ProductRow title={renderRowTitle(fourthRowTitle, 3, Gift, 'text-pink-500')} titleStr={fourthRowTitle} products={fourthRowProducts} favorites={favoritesIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} isLoading={isLoading} />
              </div>
            </LazySection>
          )}
          {fifthRowProducts.length > 0 && (
            <LazySection>
              <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2">
                <ProductRow title={renderRowTitle(fifthRowTitle, 4, TrendingUp, 'text-blue-500')} titleStr={fifthRowTitle} products={fifthRowProducts} favorites={favoritesIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} isLoading={isLoading} />
              </div>
            </LazySection>
          )}
          {sixthRowProducts.length > 0 && (
            <LazySection>
              <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-2 pb-2">
                <ProductRow title={renderRowTitle(sixthRowTitle, 5, Tag, 'text-green-500')} titleStr={sixthRowTitle} products={sixthRowProducts} favorites={favoritesIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} isLoading={isLoading} />
              </div>
            </LazySection>
          )}
          
          {favoritesCount > 0 && (
            <div id="favorites-row" className="mt-3 border-t border-gray-100 dark:border-gray-800 bg-orange-50/10 dark:bg-orange-950/5 pt-2 pb-2">
               <ProductRow title={<div className="flex items-center gap-2"><Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-current" /><h1 className="text-lg sm:text-2xl font-medium font-engaging tracking-tighter text-gray-700 dark:text-white">Watchlist</h1></div>} titleStr="Watchlist" products={favoriteList} favorites={favoritesIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} />
            </div>
          )}
          
          <LazySection>
             <Suspense fallback={<div className="h-32 bg-gray-50 dark:bg-gray-900/30 animate-pulse" />}>
                <BrandLogos />
             </Suspense>
          </LazySection>
        </main>
        
        <Suspense fallback={null}>
            <SmartMessagePopup 
                config={config.smartMessage} 
                storageKey="smart_app_message_status_v2" 
                shouldStart={!isLoading} 
                onComplete={() => setMessage1Finished(true)}
            />
            <SmartMessagePopup 
                config={config.smartMessage2} 
                storageKey="smart_app_message_status_2_v2"
                shouldStart={message1Finished}
            />
            <NewsletterPopup onOpenContact={() => setIsContactOpen(true)} />
            <ContactUsPopup isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
            
            <QuickViewModal product={quickViewProduct} onClose={onQuickViewClose} isFavorite={!!quickViewProduct && favoritesIds.has(quickViewProduct.id)} onToggleFavorite={() => quickViewProduct && toggleFavorite(quickViewProduct)} />
        </Suspense>
        
        <ScrollToTop />
        <button onClick={() => performShare({ title: config.headerTitle, text: `${config.shareMessage}\n\nVisit:\n`, url: window.location.href })} className="fixed bottom-6 right-4 p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl z-40 transition-transform active:scale-95 border-2 border-white dark:border-gray-800" aria-label="Share App"><Rocket className="w-4 h-4" /></button>
        <footer className="relative bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 overflow-hidden"><div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" /><div className="max-w-4xl mx-auto px-10 py-6 text-center"><div className="flex flex-col md:flex-row items-center justify-center gap-2 mb-3">{config.socialLinks.length > 0 && (<div className="flex items-center gap-3">{config.socialLinks.map((link, idx) => { const exactMatch = ALL_ICONS[link.icon.trim()]; const pascalMatch = ALL_ICONS[link.icon.trim().charAt(0).toUpperCase() + link.icon.trim().slice(1)]; const Icon = exactMatch || pascalMatch || ALL_ICONS.Globe; return (<a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-800 transition-all group ${link.color}`} title={link.name}><Icon className="w-5 h-5 transition-transform group-hover:scale-110" /></a>); })}<button onClick={() => setIsContactOpen(true)} className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-300 group text-orange-600 dark:text-gray-300 hover:text-purple-500" title="Contact Us"><Mail className="w-5 h-5 transition-transform group-hover:scale-110" /></button></div>)}{config.socialLinks.length > 0 && config.googlePlayLink && (<div className="hidden md:block w-px h-4 bg-gray-200 dark:bg-gray-800" />)}{config.googlePlayLink && (<a href={config.googlePlayLink} target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-105 active:scale-95" title="Get it on Google Play"><img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" className="h-16 w-auto" /></a>)}</div><h3 className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 mb-2"><span>Made with</span><Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /><span>{config.footerText}</span></h3><p className="text-[10px] leading-relaxed text-gray-400 dark:text-gray-500 max-w-lg mx-auto font-medium opacity-80">{config.footerDisclaimer}</p></div></footer>
      </div>
    </ConfigProvider>
  );
};

export default App;
