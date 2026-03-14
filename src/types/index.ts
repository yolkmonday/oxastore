export type Category = "popular" | "new" | "upcoming";

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  year: number;
  coverImage: string;
  category: Category;
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
