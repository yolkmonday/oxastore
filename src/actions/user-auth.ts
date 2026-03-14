"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
}

const registerSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export async function registerAction(
  _prev: AuthResult | undefined,
  formData: FormData
): Promise<AuthResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export async function userLoginAction(
  _prev: AuthResult | undefined,
  formData: FormData
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  const redirectTo = formData.get("redirect") as string | null;
  redirect(redirectTo || "/");
}

export async function userLogoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
