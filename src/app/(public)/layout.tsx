import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getMenusByLocation } from "@/data/menus";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headerGroups = await getMenusByLocation("header");
  const headerItems = headerGroups[0]?.items ?? [];

  return (
    <CartProvider>
      <Header userEmail={user?.email} menuItems={headerItems} />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}
