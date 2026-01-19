
import React from 'react';
import { 
  Gamepad2, Baby, Briefcase, Sparkles, Book, Car, Shirt, Laptop, Tv, 
  Leaf, Gift, ShoppingCart, Activity, Home, Wrench, Microscope, Gem, 
  Library, Film, Music, Guitar, FolderKanban, Dog, Footprints, 
  Cpu, Trophy, ToyBrick, MonitorPlay, Watch 
} from 'lucide-react';
import { Category } from './types';

export const AFFILIATE_TAG = 'amzn_offers-21';
export const SHARE_MESSAGE = "Hey, check out this awesome deals!\nhttps://amzn.to/3NaH2YW";

// REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
// Steps:
// 1. Go to your Google Sheet > Extensions > Apps Script
// 2. Paste the provided code
// 3. Deploy > New Deployment > Select type: Web App
// 4. Execute as: Me
// 5. Who has access: Anyone
// 6. Copy the URL and paste it below
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6JjYFrgChJCJNgtOTdIGRaG0100xGyprh06nvlsECK4fk33qGVLNzNaLsJB3tvHpuOw/exec'; 

export const CATEGORIES: Category[] = [
  { name: 'Baby Products', icon: 'Baby', url: 'https://www.amazon.in/gp/bestsellers/baby', color: 'text-pink-500' },
  { name: 'Beauty', icon: 'Sparkles', url: 'https://www.amazon.in/gp/bestsellers/beauty', color: 'text-rose-500' },
  { name: 'Bags, Wallets and Luggage', icon: 'Briefcase', url: 'https://www.amazon.in/gp/bestsellers/luggage', color: 'text-amber-700' },
  { name: 'Books', icon: 'Book', url: 'https://www.amazon.in/gp/bestsellers/books', color: 'text-indigo-600' },
  { name: 'Car & Motorbike', icon: 'Car', url: 'https://www.amazon.in/gp/bestsellers/automotive', color: 'text-slate-600' },
  { name: 'Clothing & Acce.', icon: 'Shirt', url: 'https://www.amazon.in/gp/bestsellers/apparel', color: 'text-cyan-600' },
  { name: 'Computers & Acce.', icon: 'Laptop', url: 'https://www.amazon.in/gp/bestsellers/computers', color: 'text-sky-500' },
  { name: 'Electronics', icon: 'Tv', url: 'https://www.amazon.in/gp/bestsellers/electronics', color: 'text-orange-500' },
  { name: 'Garden & Outdoors', icon: 'Leaf', url: 'https://www.amazon.in/gp/bestsellers/garden', color: 'text-green-600' },
  { name: 'Gift Cards', icon: 'Gift', url: 'https://www.amazon.in/gp/bestsellers/gift-cards', color: 'text-red-500' },
  { name: 'Grocery & Gourmet Foods', icon: 'ShoppingCart', url: 'https://www.amazon.in/gp/bestsellers/grocery', color: 'text-lime-600' },
  { name: 'Health & Personal Care', icon: 'Activity', url: 'https://www.amazon.in/gp/bestsellers/hpc', color: 'text-emerald-500' },
  { name: 'Home & Kitchen', icon: 'Home', url: 'https://www.amazon.in/gp/bestsellers/kitchen', color: 'text-orange-400' },
  { name: 'Home Improvement', icon: 'Wrench', url: 'https://www.amazon.in/gp/bestsellers/home-improvement', color: 'text-stone-600' },
  { name: 'Industrial & Scientific', icon: 'Microscope', url: 'https://www.amazon.in/gp/bestsellers/industrial', color: 'text-blue-900' },
  { name: 'Jewellery', icon: 'Gem', url: 'https://www.amazon.in/gp/bestsellers/jewelry', color: 'text-yellow-500' },
  { name: 'Kindle Store', icon: 'Library', url: 'https://www.amazon.in/gp/bestsellers/digital-text', color: 'text-purple-600' },
  { name: 'Movies & TV Shows', icon: 'Film', url: 'https://www.amazon.in/gp/bestsellers/dvd', color: 'text-red-700' },
  { name: 'Music', icon: 'Music', url: 'https://www.amazon.in/gp/bestsellers/music', color: 'text-fuchsia-500' },
  { name: 'Musical Instruments', icon: 'Guitar', url: 'https://www.amazon.in/gp/bestsellers/musical-instruments', color: 'text-violet-500' },
  { name: 'Office Products', icon: 'FolderKanban', url: 'https://www.amazon.in/gp/bestsellers/office', color: 'text-blue-600' },
  { name: 'Pet Supplies', icon: 'Dog', url: 'https://www.amazon.in/gp/bestsellers/pet-supplies', color: 'text-amber-800' },
  { name: 'Shoes & Handbags', icon: 'Footprints', url: 'https://www.amazon.in/gp/bestsellers/shoes', color: 'text-stone-700' },
  { name: 'Software', icon: 'Cpu', url: 'https://www.amazon.in/gp/bestsellers/software', color: 'text-indigo-800' },
  { name: 'Sports, Fitness & Outdoors', icon: 'Trophy', url: 'https://www.amazon.in/gp/bestsellers/sports', color: 'text-orange-600' },
  { name: 'Toys & Games', icon: 'ToyBrick', url: 'https://www.amazon.in/gp/bestsellers/toys', color: 'text-pink-600' },
  { name: 'Video Games', icon: 'MonitorPlay', url: 'https://www.amazon.in/gp/bestsellers/videogames', color: 'text-purple-700' },
  { name: 'Watches', icon: 'Watch', url: 'https://www.amazon.in/gp/bestsellers/watches', color: 'text-zinc-600' },
  { name: 'Apps & Games', icon: 'Gamepad2', url: 'https://www.amazon.in/gp/bestsellers/appstore', color: 'text-blue-500' },
];

export const BRANDS = [
  { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple?size=300', url: 'https://www.amazon.in/stores/Apple/page/D520D756-3536-4DB4-B321-72A0EE553535' },
  { name: 'Samsung', logo: 'https://cdn.simpleicons.org/samsung?size=300', url: 'https://www.amazon.in/Samsung/b?node=1389401031' },
  { name: 'OnePlus', logo: 'https://cdn.simpleicons.org/oneplus?size=300', url: 'https://www.amazon.in/oneplus' },
  { name: 'Xiaomi', logo: 'https://cdn.simpleicons.org/xiaomi?size=300', url: 'https://www.amazon.in/xiaomi' },
  { name: 'Realme', logo: 'https://cdn.simpleicons.org/realme?size=300', url: 'https://www.amazon.in/realme' },
  { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/300px-Sony_logo.svg.png', url: 'https://www.amazon.in/Sony/b?node=1389401031' },
  { name: 'JBL', logo: 'https://cdn.simpleicons.org/jbl?size=300', url: 'https://www.amazon.in/jbl' },
  { name: 'HP', logo: 'https://cdn.simpleicons.org/hp?size=300', url: 'https://www.amazon.in/hp' },
  { name: 'Dell', logo: 'https://cdn.simpleicons.org/dell?size=300', url: 'https://www.amazon.in/stores/Dell/page/7077E80E-7C0F-447F-853D-9477ED9C2C6A' },
  { name: 'Lenovo', logo: 'https://cdn.simpleicons.org/lenovo?size=300', url: 'https://www.amazon.in/lenovo' },
  { name: 'ASUS', logo: 'https://cdn.simpleicons.org/asus?size=300', url: 'https://www.amazon.in/asus' },
  { name: 'Acer', logo: 'https://cdn.simpleicons.org/acer?size=300', url: 'https://www.amazon.in/acer' },
  { name: 'Logitech', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Logitech_logo.svg/300px-Logitech_logo.svg.png', url: 'https://www.amazon.in/stores/Logitech/page/93B78280-B3B1-4D04-8EBA-71E569A5E19A' },
  { name: 'Canon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Canon_wordmark.svg/300px-Canon_wordmark.svg.png', url: 'https://www.amazon.in/canon' },
  { name: 'Nikon', logo: 'https://cdn.simpleicons.org/nikon?size=300', url: 'https://www.amazon.in/nikon' },
  { name: 'Philips', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/300px-Philips_logo_new.svg.png', url: 'https://www.amazon.in/philips' },
  { name: 'LG', logo: 'https://cdn.simpleicons.org/lg?size=300', url: 'https://www.amazon.in/lg' },
  { name: 'Whirlpool', logo: 'https://cdn.simpleicons.org/whirlpool?size=300', url: 'https://www.amazon.in/whirlpool' },
  { name: 'Puma', logo: 'https://cdn.simpleicons.org/puma?size=300', url: 'https://www.amazon.in/puma' },
  { name: 'Adidas', logo: 'https://cdn.simpleicons.org/adidas?size=300', url: 'https://www.amazon.in/stores/adidas/page/3777524E-0A31-4A59-A845-667C85B55272' },
  { name: 'Nike', logo: 'https://cdn.simpleicons.org/nike?size=300', url: 'https://www.amazon.in/stores/Nike/page/4D189855-6E58-40F1-8B18-052D3F5C3E8A' },
  { name: 'Levi\'s', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Levi%27s_logo.svg/300px-Levi%27s_logo.svg.png', url: 'https://www.amazon.in/levis' },
  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/300px-Microsoft_logo_%282012%29.svg.png', url: 'https://www.amazon.in/stores/Microsoft/page/B2544577-4402-4A73-A3D9-2911221D7089' },
  { name: 'Intel', logo: 'https://cdn.simpleicons.org/intel?size=300', url: 'https://www.amazon.in/intel' },
  { name: 'Bose', logo: 'https://cdn.simpleicons.org/bose?size=300', url: 'https://www.amazon.in/stores/Bose/page/89581A78-6856-43C4-9A22-38D56A69668D' },
];

export const CATEGORY_ICONS: Record<string, any> = {
  Gamepad2, Baby, Briefcase, Sparkles, Book, Car, Shirt, Laptop, Tv, 
  Leaf, Gift, ShoppingCart, Activity, Home, Wrench, Microscope, Gem, 
  Library, Film, Music, Guitar, FolderKanban, Dog, Footprints, 
  Cpu, Trophy, ToyBrick, MonitorPlay, Watch 
};
