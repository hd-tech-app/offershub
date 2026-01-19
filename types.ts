
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