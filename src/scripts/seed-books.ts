import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = [
  { name: "Populer", slug: "popular" },
  { name: "Baru", slug: "new" },
  { name: "Akan Datang", slug: "upcoming" },
];

const books = [
  // --- POPULAR ---
  {
    title: "Laskar Pelangi",
    slug: "laskar-pelangi",
    author: "Andrea Hirata",
    price: 89000,
    year: 2005,
    category: "popular",
    is_bestseller: true,
    discount: 10,
    tags: ["fiksi", "sastra indonesia", "pendidikan", "inspiratif"],
    description:
      "Novel fenomenal tentang sepuluh anak kampung di Belitung yang berjuang menggapai mimpi meski dengan segala keterbatasan. Kisah persahabatan, semangat belajar, dan kekuatan harapan yang mengharukan.",
    pages: 529,
    language: "Indonesia",
    publisher: "Bentang Pustaka",
    width: 13.5,
    length: 20.0,
    weight: 400,
  },
  {
    title: "Bumi Manusia",
    slug: "bumi-manusia",
    author: "Pramoedya Ananta Toer",
    price: 95000,
    year: 1980,
    category: "popular",
    is_bestseller: true,
    discount: null,
    tags: ["sastra", "sejarah", "roman", "penjajahan"],
    description:
      "Novel pertama dari Tetralogi Buru. Mengisahkan Minke, pemuda Jawa terpelajar di zaman kolonial Belanda, yang jatuh cinta pada Annelies Mellema. Sebuah masterpiece sastra Indonesia yang mengungkap perjuangan kemanusiaan.",
    pages: 535,
    language: "Indonesia",
    publisher: "Lentera Dipantara",
    width: 14.0,
    length: 21.0,
    weight: 420,
  },
  {
    title: "Negeri 5 Menara",
    slug: "negeri-5-menara",
    author: "A. Fuadi",
    price: 79000,
    year: 2009,
    category: "popular",
    is_bestseller: true,
    discount: 15,
    tags: ["fiksi", "pendidikan", "pesantren", "inspiratif"],
    description:
      "Kisah Alif Fikri yang merantau dari Minangkabau ke pondok pesantren Gontor. Bersama lima sahabatnya, ia belajar bahwa mantra 'man jadda wajada' — siapa bersungguh-sungguh pasti berhasil — mampu mengubah dunia.",
    pages: 423,
    language: "Indonesia",
    publisher: "Gramedia Pustaka Utama",
    width: 13.5,
    length: 20.0,
    weight: 340,
  },
  {
    title: "Ayat-Ayat Cinta",
    slug: "ayat-ayat-cinta",
    author: "Habiburrahman El Shirazy",
    price: 85000,
    year: 2004,
    category: "popular",
    is_bestseller: false,
    discount: null,
    tags: ["roman", "islami", "spiritual", "cairo"],
    description:
      "Novel islami tentang Fahri, mahasiswa Indonesia di Kairo, yang terjebak dalam konflik perasaan antara empat wanita luar biasa. Sarat nilai spiritual dan kedalaman cinta yang tulus.",
    pages: 418,
    language: "Indonesia",
    publisher: "Republika",
    width: 13.0,
    length: 19.0,
    weight: 320,
  },
  {
    title: "Pulang",
    slug: "pulang-tere-liye",
    author: "Tere Liye",
    price: 88000,
    year: 2015,
    category: "popular",
    is_bestseller: true,
    discount: 5,
    tags: ["fiksi", "aksi", "keluarga", "petualangan"],
    description:
      "Petualangan seorang penagih utang bayaran bernama Bujang yang menguak misteri masa lalu keluarganya. Novel aksi penuh ketegangan yang menyentuh tentang makna pulang dan kesetiaan.",
    pages: 400,
    language: "Indonesia",
    publisher: "Republika",
    width: 13.5,
    length: 20.5,
    weight: 330,
  },
  {
    title: "Atomic Habits",
    slug: "atomic-habits",
    author: "James Clear",
    price: 109000,
    year: 2019,
    category: "popular",
    is_bestseller: true,
    discount: 10,
    tags: ["non-fiksi", "produktivitas", "kebiasaan", "pengembangan diri"],
    description:
      "Panduan praktis membangun kebiasaan kecil yang memberikan hasil luar biasa. James Clear menjelaskan bagaimana perubahan 1% setiap hari secara konsisten dapat mentransformasi hidup Anda.",
    pages: 320,
    language: "Indonesia",
    publisher: "Gramedia Pustaka Utama",
    width: 14.0,
    length: 21.0,
    weight: 300,
  },
  // --- NEW ---
  {
    title: "Hujan",
    slug: "hujan-tere-liye",
    author: "Tere Liye",
    price: 82000,
    year: 2016,
    category: "new",
    is_bestseller: false,
    discount: null,
    tags: ["fiksi", "science fiction", "roman", "futuristik"],
    description:
      "Di masa depan ketika teknologi mampu menghapus kenangan, Lail memilih untuk mengingat seseorang yang pernah ada dalam hidupnya. Novel sci-fi romantis yang mempertanyakan apa yang layak untuk dikenang.",
    pages: 320,
    language: "Indonesia",
    publisher: "Republika",
    width: 13.5,
    length: 20.0,
    weight: 270,
  },
  {
    title: "The Psychology of Money",
    slug: "the-psychology-of-money",
    author: "Morgan Housel",
    price: 99000,
    year: 2023,
    category: "new",
    is_bestseller: true,
    discount: 20,
    tags: ["non-fiksi", "keuangan", "investasi", "mindset"],
    description:
      "Kumpulan 19 kisah tentang bagaimana orang berpikir tentang uang — dan bagaimana melakukan hal-hal yang lebih baik. Cara pandang unik tentang kekayaan, keserakahan, dan kebahagiaan yang akan mengubah cara Anda melihat uang.",
    pages: 256,
    language: "Indonesia",
    publisher: "Gramedia Pustaka Utama",
    width: 14.0,
    length: 21.0,
    weight: 250,
  },
  {
    title: "Filosofi Teras",
    slug: "filosofi-teras",
    author: "Henry Manampiring",
    price: 92000,
    year: 2019,
    category: "new",
    is_bestseller: true,
    discount: null,
    tags: ["non-fiksi", "filsafat", "stoikisme", "pengembangan diri"],
    description:
      "Buku yang memperkenalkan Stoisisme, filsafat Yunani-Romawi kuno, sebagai panduan hidup praktis di era modern penuh kecemasan. Ditulis dengan gaya ringan dan relatable untuk pembaca Indonesia.",
    pages: 296,
    language: "Indonesia",
    publisher: "Kompas",
    width: 14.5,
    length: 21.0,
    weight: 290,
  },
  {
    title: "Deep Work",
    slug: "deep-work",
    author: "Cal Newport",
    price: 95000,
    year: 2024,
    category: "new",
    is_bestseller: false,
    discount: 10,
    tags: ["non-fiksi", "produktivitas", "fokus", "karier"],
    description:
      "Kemampuan untuk fokus tanpa gangguan pada tugas yang menuntut kognitif adalah keterampilan paling berharga di era ekonomi baru. Newport membuktikan bahwa deep work bukan hanya produktif — tetapi bermakna.",
    pages: 304,
    language: "Indonesia",
    publisher: "Bentang Pustaka",
    width: 14.0,
    length: 21.0,
    weight: 290,
  },
  // --- UPCOMING ---
  {
    title: "Kotak Musik",
    slug: "kotak-musik",
    author: "Valeria Vega",
    price: 98000,
    year: 2025,
    category: "upcoming",
    is_bestseller: false,
    discount: null,
    tags: ["fiksi", "misteri", "roman", "seni"],
    description:
      "Ketika sebuah kotak musik tua ditemukan di loteng rumah nenek, Naomi tidak menyangka bahwa melodi kuno di dalamnya akan membawanya ke rahasia keluarga yang telah terkubur selama tiga generasi.",
    pages: 380,
    language: "Indonesia",
    publisher: "Gramedia Pustaka Utama",
    width: 13.5,
    length: 20.0,
    weight: 310,
  },
  {
    title: "Jejak Samudra",
    slug: "jejak-samudra",
    author: "Reza Nurhilman",
    price: 105000,
    year: 2025,
    category: "upcoming",
    is_bestseller: false,
    discount: null,
    tags: ["non-fiksi", "petualangan", "bahari", "eksplorasi"],
    description:
      "Perjalanan mengelilingi kepulauan Nusantara selama 400 hari dengan kapal kayu tradisional. Catatan perjalanan yang memukau tentang kekayaan laut, budaya pesisir, dan manusia-manusia penjaga samudra.",
    pages: 440,
    language: "Indonesia",
    publisher: "Bentang Pustaka",
    width: 15.0,
    length: 23.0,
    weight: 450,
  },
  {
    title: "Ruang di Antara Kata",
    slug: "ruang-di-antara-kata",
    author: "Marchella FP",
    price: 75000,
    year: 2025,
    category: "upcoming",
    is_bestseller: false,
    discount: null,
    tags: ["puisi", "sastra", "kontemplasi", "kehidupan"],
    description:
      "Kumpulan puisi pendek yang mengeksplorasi ruang-ruang sunyi dalam kehidupan sehari-hari — jeda antara percakapan, momen sebelum tidur, dan perasaan yang tak pernah terucap.",
    pages: 192,
    language: "Indonesia",
    publisher: "Gramedia Pustaka Utama",
    width: 12.5,
    length: 18.0,
    weight: 180,
  },
];

async function seedCategories() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    const { error } = await supabase
      .from("categories")
      .upsert({ name: cat.name, slug: cat.slug }, { onConflict: "slug" });
    if (error) {
      console.error(`  ✗ ${cat.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${cat.name} (${cat.slug})`);
    }
  }
}

async function seedBooks() {
  console.log("\nSeeding books...");
  for (const book of books) {
    const { error } = await supabase
      .from("books")
      .upsert(
        {
          ...book,
          cover_image: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      );
    if (error) {
      console.error(`  ✗ ${book.title}: ${error.message}`);
    } else {
      console.log(`  ✓ ${book.title}`);
    }
  }
}

async function main() {
  console.log("=== oxastore book seeder ===\n");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  await seedCategories();
  await seedBooks();

  console.log("\nDone.");
}

main();
