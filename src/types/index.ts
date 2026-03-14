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
}

export interface CartItem {
  book: Book;
  quantity: number;
}
