import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <CartProvider>
      <Header userEmail={user?.email} />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}
