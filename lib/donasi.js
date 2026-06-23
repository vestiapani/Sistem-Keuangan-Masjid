import { createClient } from "@/lib/supabase/client";

export async function getDonasis() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("donasis")
    .select("*")
    .eq("status_verifikasi", "verified")
    .order("tanggal_donasi", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addDonasi(payload) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("donasis")
    .insert([
      {
        ...payload,
        status_verifikasi: "verified",
        verified_by: user?.id ?? null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Insert notifikasi setelah donasi berhasil dicatat
  try {
    const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);
    await supabase.from("notifikasis").insert([
      {
        tipe: "donasi_baru",
        judul: "Donasi Baru Masuk",
        pesan: `${data.nama_donatur} telah berdonasi sebesar Rp ${formatRp(data.jumlah_dana)} (${data.kategori})`,
        is_read: false,
      },
    ]);
  } catch (notifError) {
    // Notifikasi gagal tidak boleh menggagalkan operasi utama
    console.warn("Gagal membuat notifikasi:", notifError);
  }

  return data;
}

export async function updateDonasi(id, jumlah_dana) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("donasis")
    .update({
      jumlah_dana,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDonasi(id) {
  const supabase = createClient();
  const { error } = await supabase.from("donasis").delete().eq("id", id);
  if (error) throw error;
}

export async function verifyDonasi(id) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("donasis")
    .update({
      status_verifikasi: "verified",
      verified_by: user.id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Insert notifikasi verifikasi
  try {
    const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);
    await supabase.from("notifikasis").insert([
      {
        tipe: "donasi_diverifikasi",
        judul: "Donasi Terverifikasi",
        pesan: `Donasi dari ${data.nama_donatur} sebesar Rp ${formatRp(data.jumlah_dana)} telah diverifikasi`,
        is_read: false,
      },
    ]);
  } catch (notifError) {
    console.warn("Gagal membuat notifikasi:", notifError);
  }

  return data;
}
