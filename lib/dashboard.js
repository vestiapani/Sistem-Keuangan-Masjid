import { createClient } from "@/lib/supabase/client";

// ============================================================
// Helper: konversi "Oktober 2023" → { startDate, endDate }
// ============================================================
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

// ============================================================
// Helper: generate list periode N bulan ke belakang dari sekarang
// format: ["Juni 2025", "Mei 2025", ...]
// ============================================================
export function generatePeriodeOptions(jumlahBulan = 24) {
  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const options = [];
  const now = new Date();
  for (let i = 0; i < jumlahBulan; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push(`${namaBulan[d.getMonth()]} ${d.getFullYear()}`);
  }
  return options;
}

// ============================================================
// Dashboard utama: summary cards + transaksi terakhir
// ============================================================
export async function getDashboardData(periode) {
  const supabase = createClient();
  const { startDate, endDate } = periodeToDateRange(periode);

  const [{ data: donasiAll, error: e1 }, { data: pengeluaranAll, error: e2 }] =
    await Promise.all([
      supabase
        .from("donasis")
        .select(
          "id, jumlah_dana, tanggal_donasi, nama_donatur, kategori, created_at",
        )
        .eq("status_verifikasi", "verified")
        .order("tanggal_donasi", { ascending: false }),
      supabase
        .from("pengeluarans")
        .select(
          "id, jumlah_pengeluaran, tanggal_pengeluaran, keperluan, kategori, created_at",
        )
        .order("tanggal_pengeluaran", { ascending: false }),
    ]);

  if (e1) throw e1;
  if (e2) throw e2;

  const donasiPeriode = (donasiAll ?? []).filter(
    (d) => d.tanggal_donasi >= startDate && d.tanggal_donasi <= endDate,
  );
  const pengeluaranPeriode = (pengeluaranAll ?? []).filter(
    (p) =>
      p.tanggal_pengeluaran >= startDate && p.tanggal_pengeluaran <= endDate,
  );

  const totalMasukPeriode = donasiPeriode.reduce(
    (a, d) => a + d.jumlah_dana,
    0,
  );
  const totalKeluarPeriode = pengeluaranPeriode.reduce(
    (a, p) => a + p.jumlah_pengeluaran,
    0,
  );
  const totalMasukAll = (donasiAll ?? []).reduce(
    (a, d) => a + d.jumlah_dana,
    0,
  );
  const totalKeluarAll = (pengeluaranAll ?? []).reduce(
    (a, p) => a + p.jumlah_pengeluaran,
    0,
  );
  const saldoKasSekarang = totalMasukAll - totalKeluarAll;

  const transaksiTerakhir = [
    ...donasiPeriode.map((d) => ({
      id: `donasi-${d.id}`,
      desc: d.nama_donatur,
      date: d.tanggal_donasi,
      amount: d.jumlah_dana,
      type: "Pemasukan",
      cat: d.kategori,
      created_at: d.created_at,
    })),
    ...pengeluaranPeriode.map((p) => ({
      id: `pengeluaran-${p.id}`,
      desc: p.keperluan,
      date: p.tanggal_pengeluaran,
      amount: p.jumlah_pengeluaran,
      type: "Pengeluaran",
      cat: p.kategori,
      created_at: p.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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

// ============================================================
// Chart cashflow: 6 bulan real data dari DB
// ============================================================
export async function getMonthlyCashflow() {
  const supabase = createClient();

  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Hitung range 6 bulan ke belakang
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const startDate = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: donasis, error: e1 }, { data: pengeluarans, error: e2 }] =
    await Promise.all([
      supabase
        .from("donasis")
        .select("jumlah_dana, tanggal_donasi")
        .eq("status_verifikasi", "verified")
        .gte("tanggal_donasi", startDate),
      supabase
        .from("pengeluarans")
        .select("jumlah_pengeluaran, tanggal_pengeluaran")
        .gte("tanggal_pengeluaran", startDate),
    ]);

  if (e1) throw e1;
  if (e2) throw e2;

  // Bangun map 6 bulan
  const months = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = {
      bulan: namaBulan[d.getMonth()].slice(0, 3),
      pemasukan: 0,
      pengeluaran: 0,
    };
  }

  (donasis ?? []).forEach((d) => {
    const key = d.tanggal_donasi.slice(0, 7);
    if (months[key]) months[key].pemasukan += d.jumlah_dana;
  });

  (pengeluarans ?? []).forEach((p) => {
    const key = p.tanggal_pengeluaran.slice(0, 7);
    if (months[key]) months[key].pengeluaran += p.jumlah_pengeluaran;
  });

  return Object.values(months);
}

// ============================================================
// Notifikasi terbaru dari tabel notifikasis
// ============================================================
export async function getNotifikasiTerbaru(limit = 10) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifikasis")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Mark notifikasi as read
// ============================================================
export async function markAllNotifAsRead() {
  const supabase = createClient();
  const { error } = await supabase
    .from("notifikasis")
    .update({ is_read: true })
    .eq("is_read", false);
  if (error) throw error;
}

// ============================================================
// Count unread notifikasi
// ============================================================
export async function getUnreadCount() {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("notifikasis")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);
  if (error) throw error;
  return count ?? 0;
}

export async function simpanLaporan({
  periode,
  totalMasuk,
  totalKeluar,
  saldo,
  catatan = null,
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("laporans").upsert(
    {
      admin_id: user?.id,
      periode,
      total_pemasukan: totalMasuk,
      total_pengeluaran: totalKeluar,
      saldo_akhir: saldo,
      catatan,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "periode" },
  );

  if (error) throw error;
}
