
import React from 'react';
import * as LucideReact from 'lucide-react';

// Export all icons for dynamic lookup
export const ALL_ICONS = LucideReact as unknown as Record<string, React.FC<any>>;

// --- Type Definitions ---

export interface Product {
  id: string;
  title: string;
  image: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: string;
  rating: number;
  reviewsCount: number;
  url: string;
  category?: string;
}

export interface Category {
  name: string;
  icon: string;
  url: string;
  color?: string; // Tailwind color class or hex for Light Mode
}

export interface Brand {
  name: string;
  logo: string;
  url: string;
}

// --- Constants ---

export const AFFILIATE_TAG = 'amzn_offers-21';
export const SHARE_MESSAGE = "Hey, check out this awesome deals!\nhttps://amzn.to/3NaH2YW";

// Google Apps Script Web App URLs
export const GOOGLE_SCRIPT_NEWSLATER_URL = 'https://script.google.com/macros/s/AKfycbw6JjYFrgChJCJNgtOTdIGRaG0100xGyprh06nvlsECK4fk33qGVLNzNaLsJB3tvHpuOw/exec';
export const GOOGLE_SCRIPT_CONTACT_URL = 'https://script.google.com/macros/s/AKfycbzELRgYuH8VwvlEglCUN1v2zwbrjy4ktfJrqjzbGRrMOISSQUyEXHwwhmPZqhcyLcOH9w/exec';

export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Baby Products', icon: 'Baby', url: 'https://www.amazon.in/gp/bestsellers/baby', color: 'text-pink-500' },
  { name: 'Beauty', icon: 'Sparkles', url: 'https://www.amazon.in/gp/bestsellers/beauty', color: 'text-rose-500' },
  { name: 'Bags, Wallets and Luggage', icon: 'Briefcase', url: 'https://www.amazon.in/gp/bestsellers/luggage', color: 'text-amber-700' },
  { name: 'Books', icon: 'Book', url: 'https://www.amazon.in/gp/bestsellers/books', color: 'text-indigo-600' },
  { name: 'Car & Motorbike', icon: 'Car', url: 'https://www.amazon.in/gp/bestsellers/automotive', color: 'text-slate-600' },
];

export const DEFAULT_BRANDS: Brand[] = [
  { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple?size=300', url: 'https://www.amazon.in/stores/Apple/page/D520D756-3536-4DB4-B321-72A0EE553535' },
  { name: 'Samsung', logo: 'https://cdn.simpleicons.org/samsung?size=300', url: 'https://www.amazon.in/Samsung/b?node=1389401031' },
  { name: 'OnePlus', logo: 'https://cdn.simpleicons.org/oneplus?size=300', url: 'https://www.amazon.in/oneplus' },
  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/300px-Microsoft_logo_%282012%29.svg.png', url: 'https://www.amazon.in/stores/Microsoft/page/B2544577-4402-4A73-A3D9-2911221D7089' },
  { name: 'Intel', logo: 'https://cdn.simpleicons.org/intel?size=300', url: 'https://www.amazon.in/intel' },  
];

// Helper to access ALL_ICONS but with a fallback
export const CATEGORY_ICONS: Record<string, any> = {
  Gamepad2: ALL_ICONS.Gamepad2,
  Baby: ALL_ICONS.Baby,
  Briefcase: ALL_ICONS.Briefcase,
  Sparkles: ALL_ICONS.Sparkles,
  Book: ALL_ICONS.Book,
  Car: ALL_ICONS.Car,
  Shirt: ALL_ICONS.Shirt,
  Laptop: ALL_ICONS.Laptop,
  Tv: ALL_ICONS.Tv,
  Leaf: ALL_ICONS.Leaf,
  Gift: ALL_ICONS.Gift,
  ShoppingCart: ALL_ICONS.ShoppingCart,
  Activity: ALL_ICONS.Activity,
  Home: ALL_ICONS.Home,
  Wrench: ALL_ICONS.Wrench,
  Microscope: ALL_ICONS.Microscope,
  Gem: ALL_ICONS.Gem,
  Library: ALL_ICONS.Library,
  Film: ALL_ICONS.Film,
  Music: ALL_ICONS.Music,
  Guitar: ALL_ICONS.Guitar,
  FolderKanban: ALL_ICONS.FolderKanban,
  Dog: ALL_ICONS.Dog,
  Footprints: ALL_ICONS.Footprints,
  Cpu: ALL_ICONS.Cpu,
  Trophy: ALL_ICONS.Trophy,
  ToyBrick: ALL_ICONS.ToyBrick,
  MonitorPlay: ALL_ICONS.MonitorPlay,
  Watch: ALL_ICONS.Watch
};

// Kept for backward compat but App.tsx will use ALL_ICONS dynamically
export const SOCIAL_ICONS: Record<string, any> = ALL_ICONS;
