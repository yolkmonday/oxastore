export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type MarketplaceType =
  | "shopee"
  | "tokopedia"
  | "lazada"
  | "bukalapak"
  | "blibli"
  | "amazon"
  | "website";

export interface MarketplaceLink {
  type: MarketplaceType;
  link: string;
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
  marketplaceLinks?: MarketplaceLink[];
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

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  midtrans_order_id: string | null;
  qr_string: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string | null;
  book_title: string;
  book_price: number;
  quantity: number;
}

export type PostStatus = "draft" | "published";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  thumbnail: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export type MenuLocation = "header" | "footer";

export interface MenuItem {
  id: string;
  group_id: string;
  label: string;
  url: string;
  icon: string | null;
  open_new_tab: boolean;
  sort_order: number;
}

export interface MenuGroup {
  id: string;
  location: MenuLocation;
  title: string | null;
  sort_order: number;
  items: MenuItem[];
}
