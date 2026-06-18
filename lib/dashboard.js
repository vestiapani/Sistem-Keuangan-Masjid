import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Ambil semua data yang dibutuhkan dashboard sekaligus
export async function getDashboardData(periode) {
  // periode format: "Oktober 2023" → convert ke filter bulan/tahun
  // Kita pakai range tanggal berdasarkan periode yang dipilih
  const { startDate, endDate } = periodeToDateRange(periode);

  // Query donasi bulan ini (verified)
  const { data: donasiAll, error: e1 } = await supabase
    .from("donasis")
    .select("jumlah_dana, tanggal_donasi, nama_donatur, kategori, created_at")
    .eq("status_verifikasi", "verified")
    .order("tanggal_donasi", { ascending: false });

  if (e1) throw e1;

  // Query pengeluaran semua
  const { data: pengeluaranAll, error: e2 } = await supabase
    .from("pengeluarans")
    .select(
      "jumlah_pengeluaran, tanggal_pengeluaran, keperluan, kategori, created_at",
    )
    .order("tanggal_pengeluaran", { ascending: false });

  if (e2) throw e2;

  // Filter berdasarkan periode yang dipilih
  const donasiPeriode = donasiAll.filter(
    (d) => d.tanggal_donasi >= startDate && d.tanggal_donasi <= endDate,
  );
  const pengeluaranPeriode = pengeluaranAll.filter(
    (p) =>
      p.tanggal_pengeluaran >= startDate && p.tanggal_pengeluaran <= endDate,
  );

  // Kalkulasi
  const totalMasukPeriode = donasiPeriode.reduce(
    (acc, d) => acc + d.jumlah_dana,
    0,
  );
  const totalKeluarPeriode = pengeluaranPeriode.reduce(
    (acc, p) => acc + p.jumlah_pengeluaran,
    0,
  );

  const totalMasukAll = donasiAll.reduce((acc, d) => acc + d.jumlah_dana, 0);
  const totalKeluarAll = pengeluaranAll.reduce(
    (acc, p) => acc + p.jumlah_pengeluaran,
    0,
  );
  const saldoKasSekarang = totalMasukAll - totalKeluarAll;

  // 5 transaksi terakhir (gabungan donasi + pengeluaran periode ini)
  const transaksiTerakhir = [
    ...donasiPeriode.map((d) => ({
      id: d.created_at + d.jumlah_dana,
      desc: d.nama_donatur,
      date: d.tanggal_donasi,
      amount: d.jumlah_dana,
      type: "Pemasukan",
      cat: d.kategori,
    })),
    ...pengeluaranPeriode.map((p) => ({
      id: p.created_at + p.jumlah_pengeluaran,
      desc: p.keperluan,
      date: p.tanggal_pengeluaran,
      amount: p.jumlah_pengeluaran,
      type: "Pengeluaran",
      cat: p.kategori,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    saldoKasSekarang,
    totalMasukPeriode,
    totalKeluarPeriode,
    transaksiTerakhir,
    donasiPeriode,
    pengeluaranPeriode,
  };
}

// Helper: konversi "Oktober 2023" → { startDate: "2023-10-01", endDate: "2023-10-31" }
export function periodeToDateRange(periode) {
  const bulanMap = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  const [namaBulan, tahun] = periode.split(" ");
  const bulan = bulanMap[namaBulan];
  const lastDay = new Date(parseInt(tahun), parseInt(bulan), 0).getDate();

  return {
    startDate: `${tahun}-${bulan}-01`,
    endDate: `${tahun}-${bulan}-${lastDay}`,
  };
}
