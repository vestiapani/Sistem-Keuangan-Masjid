import { createClient } from "@/lib/supabase/client";

export async function getDashboardData(periode) {
  const supabase = createClient();
  const { startDate, endDate } = periodeToDateRange(periode);

  const [{ data: donasiAll, error: e1 }, { data: pengeluaranAll, error: e2 }] =
    await Promise.all([
      supabase
        .from("donasis")
        .select(
          "jumlah_dana, tanggal_donasi, nama_donatur, kategori, created_at",
        )
        .eq("status_verifikasi", "verified")
        .order("tanggal_donasi", { ascending: false }),
      supabase
        .from("pengeluarans")
        .select(
          "jumlah_pengeluaran, tanggal_pengeluaran, keperluan, kategori, created_at",
        )
        .order("tanggal_pengeluaran", { ascending: false }),
    ]);

  if (e1) throw e1;
  if (e2) throw e2;

  const donasiPeriode = donasiAll.filter(
    (d) => d.tanggal_donasi >= startDate && d.tanggal_donasi <= endDate,
  );
  const pengeluaranPeriode = pengeluaranAll.filter(
    (p) =>
      p.tanggal_pengeluaran >= startDate && p.tanggal_pengeluaran <= endDate,
  );

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

export async function getNotifikasiTerbaru(limit = 10) {
  const supabase = createClient();

  const [{ data: donasiAll, error: e1 }, { data: pengeluaranAll, error: e2 }] =
    await Promise.all([
      supabase
        .from("donasis")
        .select(
          "id, jumlah_dana, tanggal_donasi, nama_donatur, kategori, created_at",
        )
        .eq("status_verifikasi", "verified")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("pengeluarans")
        .select(
          "id, jumlah_pengeluaran, tanggal_pengeluaran, keperluan, kategori, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

  if (e1) throw e1;
  if (e2) throw e2;

  return [
    ...donasiAll.map((d) => ({
      id: `donasi-${d.id}`,
      type: "Pemasukan",
      cat: d.kategori,
      desc: d.nama_donatur,
      amount: d.jumlah_dana,
      date: d.tanggal_donasi,
      created_at: d.created_at,
    })),
    ...pengeluaranAll.map((p) => ({
      id: `pengeluaran-${p.id}`,
      type: "Pengeluaran",
      cat: p.kategori,
      desc: p.keperluan,
      amount: p.jumlah_pengeluaran,
      date: p.tanggal_pengeluaran,
      created_at: p.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

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

export function getMonthlyCashflow(donasis, pengeluarans) {
  const months = {};

  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    months[key] = {
      bulan: d.toLocaleString("id-ID", {
        month: "short",
      }),
      pemasukan: 0,
      pengeluaran: 0,
    };
  }

  donasis.forEach((d) => {
    const key = d.tanggal_donasi.slice(0, 7);

    if (months[key]) {
      months[key].pemasukan += d.jumlah_dana;
    }
  });

  pengeluarans.forEach((p) => {
    const key = p.tanggal_pengeluaran.slice(0, 7);

    if (months[key]) {
      months[key].pengeluaran += p.jumlah_pengeluaran;
    }
  });

  return Object.values(months).reverse();
}
