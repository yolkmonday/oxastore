import { Book, Category } from "@/types";

export const books: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 15.0,
    year: 1925,
    coverImage: "https://placehold.co/200x280/e2e8f0/475569?text=The+Great+Gatsby",
    category: "popular",
    isBestSeller: false,
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    price: 12.0,
    year: 1949,
    coverImage: "https://placehold.co/200x280/fde68a/92400e?text=1984",
    category: "popular",
    isBestSeller: false,
  },
  {
    id: "3",
    title: "Brave New World",
    author: "Aldous Huxley",
    price: 14.5,
    year: 1932,
    coverImage: "https://placehold.co/200x280/fecaca/991b1b?text=Brave+New+World",
    category: "popular",
    isBestSeller: true,
    discount: 20,
  },
  {
    id: "4",
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 12.99,
    year: 1988,
    coverImage: "https://placehold.co/200x280/fed7aa/9a3412?text=The+Alchemist",
    category: "popular",
    isBestSeller: true,
  },
  {
    id: "5",
    title: "Animal Farm",
    author: "George Orwell",
    price: 10.0,
    year: 1945,
    coverImage: "https://placehold.co/200x280/bbf7d0/166534?text=Animal+Farm",
    category: "popular",
    isBestSeller: true,
  },
  {
    id: "6",
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    price: 16.2,
    year: 1866,
    coverImage: "https://placehold.co/200x280/bfdbfe/1e40af?text=Crime+and+Punishment",
    category: "popular",
    isBestSeller: true,
  },
  {
    id: "7",
    title: "The 48 Laws of Power",
    author: "Robert Greene",
    price: 18.99,
    year: 1998,
    coverImage: "https://placehold.co/200x280/dc2626/ffffff?text=48+Laws+of+Power",
    category: "popular",
  },
  {
    id: "8",
    title: "Educated",
    author: "Tara Westover",
    price: 14.99,
    year: 2018,
    coverImage: "https://placehold.co/200x280/f97316/ffffff?text=Educated",
    category: "new",
  },
  {
    id: "9",
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    price: 13.5,
    year: 2016,
    coverImage: "https://placehold.co/200x280/ef4444/ffffff?text=Subtle+Art",
    category: "popular",
  },
  {
    id: "10",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    price: 17.0,
    year: 2011,
    coverImage: "https://placehold.co/200x280/eab308/ffffff?text=Sapiens",
    category: "popular",
  },
  {
    id: "11",
    title: "It Ends with Us",
    author: "Colleen Hoover",
    price: 11.99,
    year: 1998,
    coverImage: "https://placehold.co/200x280/fce7f3/9d174d?text=It+Ends+with+Us",
    category: "new",
  },
  {
    id: "12",
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 13.99,
    year: 2020,
    coverImage: "https://placehold.co/200x280/1e3a5f/ffffff?text=Midnight+Library",
    category: "new",
  },
  {
    id: "13",
    title: "Atomic Habits",
    author: "James Clear",
    price: 15.99,
    year: 2018,
    coverImage: "https://placehold.co/200x280/fbbf24/000000?text=Atomic+Habits",
    category: "new",
  },
  {
    id: "14",
    title: "Ikigai",
    author: "Hector Garcia",
    price: 12.5,
    year: 2018,
    coverImage: "https://placehold.co/200x280/a5f3fc/0e7490?text=Ikigai",
    category: "upcoming",
  },
];

export function getBooks(): Book[] {
  return books;
}

export function getBooksByCategory(category: Category): Book[] {
  return books.filter((book) => book.category === category);
}

export function getBestSellers(): Book[] {
  return books.filter((book) => book.isBestSeller);
}

export function getBookById(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
