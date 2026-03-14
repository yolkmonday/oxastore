export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  year: number;
  coverImage: string | null;
  category: string;
  tags: string[];
  discount?: number;
  isBestSeller?: boolean;
  description?: string;
  pages?: number;
  language?: string;
  width?: number;
  length?: number;
  weight?: number;
  publisher?: string;
}

export interface Slider {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CartItem {
  book: Book;
  quantity: number;
}
