import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const hashedPassword = await bcrypt.hash(password, 12);

  const { error } = await supabase
    .from("admins")
    .insert({ email, password: hashedPassword });

  if (error) {
    if (error.code === "23505") {
      console.log(`Admin ${email} already exists.`);
    } else {
      console.error("Error seeding admin:", error.message);
      process.exit(1);
    }
  } else {
    console.log(`Admin ${email} created successfully.`);
  }
}

seedAdmin();
