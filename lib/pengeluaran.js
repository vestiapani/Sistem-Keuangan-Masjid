import { createClient } from "@/lib/supabase/client";

export async function getPengeluarans() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pengeluarans")
    .select("*")
    .order("tanggal_pengeluaran", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addPengeluaran(payload) {
  const supabase = createClient();

  const result = await supabase.auth.getUser();

  console.log("AUTH RESULT:", result);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("pengeluarans")
    .insert([
      {
        ...payload,
        created_by: user?.id ?? null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePengeluaran(id, jumlah_pengeluaran) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pengeluarans")
    .update({ jumlah_pengeluaran, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePengeluaran(id) {
  const supabase = createClient();
  const { error } = await supabase.from("pengeluarans").delete().eq("id", id);
  if (error) throw error;
}

export async function updateBuktiPengeluaran(id, buktiUrl) {
  const supabase = createClient();

  const { error } = await supabase
    .from("pengeluarans")
    .update({
      bukti_url: buktiUrl,
    })
    .eq("id", id);

  if (error) throw error;
}
