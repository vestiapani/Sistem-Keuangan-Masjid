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
