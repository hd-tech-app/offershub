
import React, { createContext, useContext, PropsWithChildren } from 'react';
import { AFFILIATE_TAG, SHARE_MESSAGE, Category, DEFAULT_CATEGORIES, Brand, DEFAULT_BRANDS, GOOGLE_SCRIPT_NEWSLATER_URL, GOOGLE_SCRIPT_CONTACT_URL } from '../constants';

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  color: string;
}

export interface RowConfig {
  icon: string;
  color: string;
}

export interface LabelConfig {
  text: string;
  icon: string;
  color: string;
}

export interface ButtonConfig extends LabelConfig {
  bgColor: string;
  hoverColor: string;
}

export interface QuickViewSettings {
  inStock: LabelConfig;
  prime: LabelConfig;
  freeDelivery: LabelConfig;
  amazonVerified: LabelConfig;
  dealPrice: LabelConfig;
  warranty: LabelConfig;
  verifiedSeller: LabelConfig;
  secureTransaction: LabelConfig;
  codReturns: LabelConfig;
  buyButton: ButtonConfig;
}

export interface BadgeOption {
  label: string;
  className: string;
}

export interface SmartMessageConfig {
  show: boolean;
  delay: number;
  showsPerDay: number;
  imageUrl: string;
  headline: string;
  body: string;
  buttonLink: string;
  buttonClass: string;
  buttonText: string;
  buttonColor: string;
}

export interface ThemeOverrides {
  primaryColor?: string;
  backgroundColorLight?: string;
  backgroundColorDark?: string;
  starRatingColor?: string;
}

export interface AppConfig {
  affiliateTag: string;
  shareMessage: string;
  productShareMessage: string;
  headerTitle: string;
  headerTitleColor: string;
  headerSubtitle: string;
  headerSubtitleColor: string;
  footerText: string;
  footerDisclaimer: string;
  socialLinks: SocialLink[];
  googlePlayLink: string;
  categories: Category[];
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterFooter: string;
  brands: Brand[];
  headerIcon: string;
  headerIconColor: string;
  headerIconShadow: string;
  productRowConfigs: RowConfig[];
  quickView: QuickViewSettings;
  // New Configs
  liveSyncText: string;
  showLiveSync: boolean;
  showBadges: boolean;
  showDiscounts: boolean;
  badgeOptions: BadgeOption[];
  productCardBuyButton: ButtonConfig;
  smartMessage: SmartMessageConfig;
  smartMessage2: SmartMessageConfig;
  themeOverrides: ThemeOverrides;
  newsletterScriptUrl: string;
  contactScriptUrl: string;
}

export const defaultQuickViewSettings: QuickViewSettings = {
  inStock: { text: 'In Stock', icon: 'CheckCircle2', color: 'text-green-600' },
  prime: { text: 'Prime', icon: 'Truck', color: 'text-blue-600' },
  freeDelivery: { text: 'Free Delivery', icon: 'Package', color: 'text-gray-500' },
  amazonVerified: { text: 'Amazon Verified', icon: 'ShieldCheck', color: 'text-blue-500' },
  dealPrice: { text: 'Deal Price', icon: 'Zap', color: 'text-orange-400' },
  warranty: { text: 'Manufacturer Warranty', icon: 'CheckCircle2', color: 'text-gray-600' },
  verifiedSeller: { text: 'Verified Seller', icon: 'CheckCircle2', color: 'text-gray-600' },
  secureTransaction: { text: 'Secure Transaction', icon: 'CheckCircle2', color: 'text-gray-600' },
  codReturns: { text: 'COD & Easy Returns', icon: 'CheckCircle2', color: 'text-gray-600' },
  buyButton: { 
    text: 'Buy on Amazon', 
    icon: 'ArrowRight', 
    color: 'text-white', 
    bgColor: 'bg-[rgb(255,179,4)]', 
    hoverColor: 'hover:bg-orange-600' 
  }
};

export const DEFAULT_BADGE_OPTIONS: BadgeOption[] = [
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

export const defaultConfig: AppConfig = {
  affiliateTag: AFFILIATE_TAG,
  shareMessage: SHARE_MESSAGE,
  productShareMessage: "Hey, check out this awesome product!",
  headerTitle: "Offers Hub!",
  headerTitleColor: "",
  headerSubtitle: "Dashboard",
  headerSubtitleColor: "text-orange-500",
  footerText: "© 2026",
  footerDisclaimer: "This is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in.",
  socialLinks: [],
  googlePlayLink: "",
  categories: DEFAULT_CATEGORIES,
  newsletterTitle: "Unlock Exclusive Deals!",
  newsletterSubtitle: "Join 10,000+ shoppers! Get daily price drops and hidden gems delivered to your inbox.",
  newsletterFooter: "No spam, unsubscribe anytime.",
  brands: DEFAULT_BRANDS,
  headerIcon: "Zap",
  headerIconColor: "bg-orange-500",
  headerIconShadow: "shadow-orange-600/20",
  productRowConfigs: [
    { icon: 'Zap', color: 'text-orange-500' },
    { icon: 'Sparkles', color: 'text-purple-500' },
    { icon: 'Flame', color: 'text-red-500' },
    { icon: 'Gift', color: 'text-pink-500' },
    { icon: 'TrendingUp', color: 'text-blue-500' },
    { icon: 'Tag', color: 'text-green-500' }
  ],
  quickView: defaultQuickViewSettings,
  liveSyncText: 'Sync',
  showLiveSync: true,
  showBadges: true,
  showDiscounts: true,
  badgeOptions: DEFAULT_BADGE_OPTIONS,
  productCardBuyButton: {
    text: 'Buy Now',
    icon: 'ExternalLink',
    color: 'text-white',
    bgColor: 'bg-[rgb(255,179,4)] dark:bg-orange-600',
    hoverColor: 'hover:bg-orange-600 dark:hover:bg-orange-500'
  },
  smartMessage: {
    show: false,
    delay: 2000,
    showsPerDay: 1,
    imageUrl: '',
    headline: '',
    body: '',
    buttonLink: '',
    buttonClass: '',
    buttonText: '',
    buttonColor: ''
  },
  smartMessage2: {
    show: false,
    delay: 4000,
    showsPerDay: 1,
    imageUrl: '',
    headline: '',
    body: '',
    buttonLink: '',
    buttonClass: '',
    buttonText: '',
    buttonColor: ''
  },
  themeOverrides: {
    primaryColor: '',
    backgroundColorLight: '',
    backgroundColorDark: '',
    starRatingColor: ''
  },
  newsletterScriptUrl: GOOGLE_SCRIPT_NEWSLATER_URL,
  contactScriptUrl: GOOGLE_SCRIPT_CONTACT_URL
};

const ConfigContext = createContext<AppConfig>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  value: AppConfig;
}

export const ConfigProvider: React.FC<PropsWithChildren<ConfigProviderProps>> = ({ children, value }) => (
  <ConfigContext.Provider value={value}>
    {children}
  </ConfigContext.Provider>
);
