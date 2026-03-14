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
  coverImage: string;
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

export interface CartItem {
  book: Book;
  quantity: number;
}
