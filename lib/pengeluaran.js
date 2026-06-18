import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Ambil semua pengeluaran, urutkan terbaru
export async function getPengeluarans() {
  const { data, error } = await supabase
    .from("pengeluarans")
    .select("*")
    .order("tanggal_pengeluaran", { ascending: false });

  if (error) throw error;
  return data;
}

// Tambah pengeluaran baru
export async function addPengeluaran(payload) {
  const { data, error } = await supabase
    .from("pengeluarans")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Edit nominal pengeluaran
export async function updatePengeluaran(id, jumlah_pengeluaran) {
  const { data, error } = await supabase
    .from("pengeluarans")
    .update({ jumlah_pengeluaran, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hapus pengeluaran
export async function deletePengeluaran(id) {
  const { error } = await supabase.from("pengeluarans").delete().eq("id", id);

  if (error) throw error;
}
