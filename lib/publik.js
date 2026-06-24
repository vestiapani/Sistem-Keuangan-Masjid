import { createClient } from "@/lib/supabase/client";

// Ambil ringkasan keuangan untuk halaman publik
export async function getRingkasanPublik() {
  const supabase = createClient();

  const [{ data: donasis }, { data: pengeluarans }] = await Promise.all([
    supabase
      .from("donasis")
      .select("jumlah_dana, tanggal_donasi, nama_donatur, kategori, keterangan")
      .eq("status_verifikasi", "verified")
      .order("tanggal_donasi", { ascending: false }),
    supabase
      .from("pengeluarans")
      .select("jumlah_pengeluaran, tanggal_pengeluaran, keperluan, kategori")
      .order("tanggal_pengeluaran", { ascending: false }),
  ]);

  const totalMasuk = (donasis ?? []).reduce((a, b) => a + b.jumlah_dana, 0);
  const totalKeluar = (pengeluarans ?? []).reduce(
    (a, b) => a + b.jumlah_pengeluaran,
    0,
  );
  const saldo = totalMasuk - totalKeluar;

  return {
    totalMasuk,
    totalKeluar,
    saldo,
    donasis: donasis ?? [],
    pengeluarans: pengeluarans ?? [],
  };
}

// Ambil program donasi aktif dari tabel program_donasis
export async function getProgramDonasi() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("program_donasis")
    .select("id, nama, deskripsi, target, terkumpul, aktif")
    .eq("aktif", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Submit donasi dari publik — status pending, menunggu verifikasi admin
export async function submitDonasiPublik(payload) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("donasis")
    .insert([
      {
        ...payload,
        sumber_donasi: "website",
        status_verifikasi: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// Ambil rekening & QRIS masjid yang aktif (untuk halaman publik)
// ============================================================
export async function getRekeningMasjid() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("rekening_masjid")
    .select("id, tipe, bank, atas_nama, nomor, label, qris_image_path")
    .eq("aktif", true)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Resolve public URL untuk QRIS image
  const result = (data ?? []).map((r) => {
    if (r.tipe === "qris" && r.qris_image_path) {
      const { data: urlData } = supabase.storage
        .from("qris-masjid")
        .getPublicUrl(r.qris_image_path);
      return { ...r, qris_image_url: urlData?.publicUrl ?? null };
    }
    return { ...r, qris_image_url: null };
  });

  return result;
}

// ============================================================
// Ambil info masjid (nama, alamat, kontak) untuk halaman publik
// ============================================================
export async function getInfoMasjid() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("info_masjid")
    .select("alamat, telepon, email_masjid, website, kapasitas, tahun_berdiri")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? {};
}
