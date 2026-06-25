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

  // Ambil user — jangan destructure langsung, tangani error dengan aman
  let userId = null;
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!authError && user) {
      userId = user.id;
    }
  } catch {
    // Lanjut tanpa created_by
  }

  // Pastikan field wajib tidak undefined/kosong
  const insertPayload = {
    tanggal_pengeluaran: payload.tanggal_pengeluaran,
    jumlah_pengeluaran: Number(payload.jumlah_pengeluaran),
    kategori: payload.kategori || null,
    keperluan: payload.keperluan,
    created_by: userId,
  };

  const { data, error } = await supabase
    .from("pengeluarans")
    .insert([insertPayload])
    .select()
    .single();

  if (error) throw error;

  // Insert notifikasi — kegagalan di sini TIDAK boleh membatalkan pengeluaran
  try {
    const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);
    await supabase.from("notifikasis").insert([
      {
        tipe: "pengeluaran_baru",
        judul: "Pengeluaran Kas Baru",
        pesan: `${data.keperluan} sebesar Rp ${formatRp(data.jumlah_pengeluaran)} (${data.kategori ?? "Umum"})`,
        is_read: false,
      },
    ]);
  } catch (notifError) {
    console.warn("Gagal membuat notifikasi:", notifError);
  }

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
    .update({ bukti_url: buktiUrl })
    .eq("id", id);
  if (error) throw error;
}
