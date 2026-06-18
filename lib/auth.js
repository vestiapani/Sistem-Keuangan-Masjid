"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Login dengan email + password
export async function login(formData) {
  const supabase = await createClient();

  const credentials = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/dashboard");
}

// Logout
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Ambil user yang sedang login (untuk server components)
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
