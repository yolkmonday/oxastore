import { getBestSellers } from "@/data/books";
import CartPageClient from "@/components/cart/CartPageClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const bestSellers = await getBestSellers();
  return <CartPageClient bestSellers={bestSellers} />;
}
