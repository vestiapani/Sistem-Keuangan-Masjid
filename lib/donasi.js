import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
// Ambil semua donasi yang sudah verified, urutkan terbaru
export async function getDonasis() {
  const { data, error } = await supabase
    .from("donasis")
    .select("*")
    .eq("status_verifikasi", "verified")
    .order("tanggal_donasi", { ascending: false });

  if (error) throw error;
  return data;
}

// Tambah donasi baru (dari form admin, langsung verified)
export async function addDonasi(payload) {
  const { data, error } = await supabase
    .from("donasis")
    .insert([{ ...payload, status_verifikasi: "verified" }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Edit nominal donasi
export async function updateDonasi(id, jumlah_dana) {
  const { data, error } = await supabase
    .from("donasis")
    .update({ jumlah_dana, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hapus donasi
export async function deleteDonasi(id) {
  const { error } = await supabase.from("donasis").delete().eq("id", id);

  if (error) throw error;
}
