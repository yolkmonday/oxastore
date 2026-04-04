import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

async function seedMenus() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── Header: 1 grup dengan nav links ──
  const { data: headerGroup, error: hgErr } = await supabase
    .from("menu_groups")
    .insert({ location: "header", title: null, sort_order: 0 })
    .select("id")
    .single();

  if (hgErr) {
    console.error("Gagal buat header group:", hgErr.message);
    process.exit(1);
  }

  const headerItems = [
    { label: "Katalog", url: "/katalog", sort_order: 0 },
    { label: "Tentang", url: "/tentang", sort_order: 1 },
    { label: "Kontak", url: "/kontak", sort_order: 2 },
  ];

  const { error: hiErr } = await supabase.from("menu_items").insert(
    headerItems.map((item) => ({
      group_id: headerGroup.id,
      ...item,
      icon: null,
      open_new_tab: false,
    }))
  );

  if (hiErr) {
    console.error("Gagal buat header items:", hiErr.message);
    process.exit(1);
  }

  console.log(`Header: ${headerItems.length} item ditambahkan.`);

  // ── Footer grup 1: Navigasi ──
  const { data: footerNav, error: fn1Err } = await supabase
    .from("menu_groups")
    .insert({ location: "footer", title: "Navigasi", sort_order: 0 })
    .select("id")
    .single();

  if (fn1Err) {
    console.error("Gagal buat footer grup Navigasi:", fn1Err.message);
    process.exit(1);
  }

  const navItems = [
    { label: "Katalog", url: "/katalog", sort_order: 0 },
    { label: "Tentang Kami", url: "/tentang", sort_order: 1 },
    { label: "Kontak", url: "/kontak", sort_order: 2 },
    { label: "FAQ", url: "/faq", sort_order: 3 },
  ];

  await supabase.from("menu_items").insert(
    navItems.map((item) => ({
      group_id: footerNav.id,
      ...item,
      icon: null,
      open_new_tab: false,
    }))
  );

  console.log(`Footer Navigasi: ${navItems.length} item ditambahkan.`);

  // ── Footer grup 2: Informasi ──
  const { data: footerInfo, error: fn2Err } = await supabase
    .from("menu_groups")
    .insert({ location: "footer", title: "Informasi", sort_order: 1 })
    .select("id")
    .single();

  if (fn2Err) {
    console.error("Gagal buat footer grup Informasi:", fn2Err.message);
    process.exit(1);
  }

  const infoItems = [
    { label: "Kebijakan Privasi", url: "/privasi", sort_order: 0 },
    { label: "Syarat & Ketentuan", url: "/syarat-ketentuan", sort_order: 1 },
    { label: "Cara Pemesanan", url: "/cara-pemesanan", sort_order: 2 },
  ];

  await supabase.from("menu_items").insert(
    infoItems.map((item) => ({
      group_id: footerInfo.id,
      ...item,
      icon: null,
      open_new_tab: false,
    }))
  );

  console.log(`Footer Informasi: ${infoItems.length} item ditambahkan.`);

  // ── Footer grup 3: Sosial Media ──
  const { data: footerSocial, error: fn3Err } = await supabase
    .from("menu_groups")
    .insert({ location: "footer", title: "Ikuti Kami", sort_order: 2 })
    .select("id")
    .single();

  if (fn3Err) {
    console.error("Gagal buat footer grup Sosial:", fn3Err.message);
    process.exit(1);
  }

  const socialItems = [
    { label: "Instagram", url: "https://instagram.com/oxamatter", icon: "mdi:instagram", sort_order: 0 },
    { label: "TikTok", url: "https://tiktok.com/@oxamatter", icon: "mdi:music-note", sort_order: 1 },
    { label: "WhatsApp", url: "https://wa.me/628123456789", icon: "mdi:whatsapp", sort_order: 2 },
  ];

  await supabase.from("menu_items").insert(
    socialItems.map((item) => ({
      group_id: footerSocial.id,
      ...item,
      open_new_tab: true,
    }))
  );

  console.log(`Footer Sosial: ${socialItems.length} item ditambahkan.`);

  console.log("\nSeed menu selesai!");
}

seedMenus();
