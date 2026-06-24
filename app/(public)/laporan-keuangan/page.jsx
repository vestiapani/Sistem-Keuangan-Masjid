"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  HandHeart,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Filter,
  Wallet,
} from "lucide-react";
import { getRingkasanPublik, getProgramDonasi } from "@/lib/publik";
import { generateLaporanPDF } from "@/lib/laporan-pdf";

const CATEGORY_COLORS = {
  Infaq: "bg-emerald-100 text-emerald-700",
  Infak: "bg-emerald-100 text-emerald-700",
  Zakat: "bg-blue-100 text-blue-700",
  Sedekah: "bg-teal-100 text-teal-700",
  Wakaf: "bg-purple-100 text-purple-700",
  operasional: "bg-slate-100 text-slate-600",
  pemeliharaan: "bg-orange-100 text-orange-700",
  kegiatan: "bg-amber-100 text-amber-700",
  insentif: "bg-pink-100 text-pink-700",
};

const PROGRAMS_FALLBACK = [
  {
    id: 1,
    nama: "Pembangunan Menara",
    target: 500000000,
    terkumpul: 375000000,
    deskripsi: "Dana pembangunan menara masjid setinggi 30 meter.",
    aktif: true,
  },
  {
    id: 2,
    nama: "Operasional Harian",
    target: 20000000,
    terkumpul: 9000000,
    deskripsi: "Biaya operasional bulanan masjid (listrik, air, kebersihan).",
    aktif: true,
  },
];

export default function LaporanKeuanganPage() {
  const [data, setData] = useState(null);
  const [programs, setPrograms] = useState(PROGRAMS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [filterTipe, setFilterTipe] = useState("Semua");

  const formatRp = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n ?? 0);

  const formatRpShort = (n) => {
    if (!n) return "Rp 0";
    if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(2)} M`;
    if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(2)} Jt`;
    return "Rp " + new Intl.NumberFormat("id-ID").format(n);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [ringkasan, prog] = await Promise.allSettled([
          getRingkasanPublik(),
          getProgramDonasi(),
        ]);
        if (ringkasan.status === "fulfilled") setData(ringkasan.value);
        if (prog.status === "fulfilled" && prog.value?.length > 0)
          setPrograms(prog.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Gabung dan filter transaksi
  const transaksiAll = data
    ? [
        ...data.donasis.map((d) => ({
          tanggal: d.tanggal_donasi,
          kategori: d.kategori || "Infak",
          keterangan:
            d.nama_donatur + (d.keterangan ? ` - ${d.keterangan}` : ""),
          jumlah: d.jumlah_dana,
          tipe: "masuk",
        })),
        ...data.pengeluarans.map((p) => ({
          tanggal: p.tanggal_pengeluaran,
          kategori: p.kategori || "operasional",
          keterangan: p.keperluan,
          jumlah: p.jumlah_pengeluaran,
          tipe: "keluar",
        })),
      ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    : [];

  const transaksiFiltred =
    filterTipe === "Semua"
      ? transaksiAll.slice(0, 20)
      : transaksiAll.filter((t) => t.tipe === filterTipe).slice(0, 20);

  const handleDownloadPDF = async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      await generateLaporanPDF({
        totalMasuk: data.totalMasuk,
        totalKeluar: data.totalKeluar,
        saldo: data.saldo,
        transaksi: transaksiAll,
      });
    } catch (err) {
      console.error("PDF error:", err);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Transparansi Keuangan
          </h1>
          <p className="text-slate-500 text-sm">
            Laporan keuangan masjid yang terbuka dan dapat diakses seluruh
            jamaah.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading || loading || !data}
            className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Download size={15} />
            {pdfLoading ? "Menyiapkan..." : "Unduh PDF"}
          </button>
          <Link
            href="/laporan-keuangan/konfirmasi-donasi"
            className="inline-flex items-center space-x-2 bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <HandHeart size={16} />
            <span>Donasi Sekarang</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards — sama layout dengan admin dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Pemasukan */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Total Pemasukan
            </p>
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <ArrowDownRight size={16} className="text-emerald-600" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 bg-slate-100 rounded animate-pulse" />
          ) : (
            <h3 className="text-3xl font-bold text-slate-800">
              {formatRpShort(data?.totalMasuk)}
            </h3>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Infaq, Zakat, Sedekah, Wakaf
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Total Pengeluaran
            </p>
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <ArrowUpRight size={16} className="text-rose-500" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 bg-slate-100 rounded animate-pulse" />
          ) : (
            <h3 className="text-3xl font-bold text-rose-600">
              {formatRpShort(data?.totalKeluar)}
            </h3>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Operasional, Pemeliharaan, Kegiatan
          </p>
        </div>

        {/* Saldo Kas */}
        <div className="bg-[#0F4C3A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-emerald-300 uppercase tracking-wide">
              Saldo Kas
            </p>
            <div className="p-1.5 bg-emerald-800/50 rounded-lg">
              <Wallet size={16} className="text-emerald-300" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 bg-emerald-800 rounded animate-pulse" />
          ) : (
            <h3 className="text-3xl font-bold text-white">
              {formatRpShort(data?.saldo)}
            </h3>
          )}
          <p className="text-xs text-emerald-300/70 mt-2">
            Total pemasukan dikurangi pengeluaran
          </p>
        </div>
      </div>

      {/* Program Donasi Aktif */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            Program Donasi Aktif
          </h2>
          <Link
            href="/laporan-keuangan/konfirmasi-donasi"
            className="text-sm text-[#0F4C3A] font-semibold hover:underline"
          >
            Donasi untuk program ini
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs
            .filter((p) => p.aktif !== false)
            .map((prog) => {
              const persen =
                prog.target > 0
                  ? Math.min(
                      100,
                      Math.round((prog.terkumpul / prog.target) * 100),
                    )
                  : 0;
              return (
                <div
                  key={prog.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="font-semibold text-slate-800">
                        {prog.nama}
                      </h4>
                      {prog.deskripsi && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {prog.deskripsi}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Target: {formatRp(prog.target)}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-slate-700 shrink-0">
                      {persen}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full my-3">
                    <div
                      className="h-2 bg-[#0F4C3A] rounded-full transition-all duration-500"
                      style={{ width: `${persen}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Terkumpul:{" "}
                      <span className="font-semibold text-[#0F4C3A]">
                        {formatRp(prog.terkumpul)}
                      </span>
                    </span>
                    <span>
                      Sisa:{" "}
                      {formatRp(Math.max(0, prog.target - prog.terkumpul))}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Cara Berdonasi */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-bold text-slate-800 mb-2">
          Cara Berdonasi untuk Program Ini
        </h3>
        <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
          <li>
            Klik tombol <strong>Donasi Sekarang</strong> di atas.
          </li>
          <li>Pilih program donasi yang ingin Anda tuju di formulir.</li>
          <li>Transfer ke rekening masjid dan upload bukti transfer.</li>
          <li>Admin akan memverifikasi donasi Anda dalam 1x24 jam kerja.</li>
          <li>
            Setelah diverifikasi, donasi akan tercatat dan terlihat di laporan
            ini.
          </li>
        </ol>
      </div>

      {/* Rincian Transaksi + Sidebar — layout 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Transaksi */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Rincian Transaksi</h3>
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-slate-400" />
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none"
              >
                <option value="Semua">Semua</option>
                <option value="masuk">Pemasukan</option>
                <option value="keluar">Pengeluaran</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : transaksiFiltred.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              Belum ada transaksi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500">
                    <th className="text-left px-6 py-3">Tanggal</th>
                    <th className="text-left px-4 py-3">Kategori</th>
                    <th className="text-left px-4 py-3">Keterangan</th>
                    <th className="text-right px-6 py-3">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksiFiltred.map((t, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-6 py-3 text-slate-500 whitespace-nowrap text-xs">
                        {t.tanggal}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            CATEGORY_COLORS[t.kategori] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {t.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                        {t.keterangan}
                      </td>
                      <td
                        className={`px-6 py-3 text-right font-semibold ${
                          t.tipe === "masuk"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {t.tipe === "masuk" ? "+" : "-"} {formatRp(t.jumlah)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && transaksiAll.length > 20 && (
            <div className="px-6 py-4 border-t border-slate-100 text-center text-xs text-slate-400">
              Menampilkan 20 dari {transaksiAll.length} transaksi. Unduh PDF
              untuk laporan lengkap.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Unduh Laporan */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 mb-4">Unduh Laporan</h4>
            <p className="text-xs text-slate-500 mb-4">
              Unduh laporan keuangan lengkap dalam format PDF yang mencakup
              seluruh transaksi terverifikasi.
            </p>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading || loading || !data}
              className="w-full flex items-center justify-center gap-2 bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {pdfLoading ? "Menyiapkan..." : "Unduh Laporan PDF"}
            </button>
            {!loading && data && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                {transaksiAll.length} transaksi terverifikasi
              </p>
            )}
          </div>

          {/* Komitmen Transparansi */}
          <div className="bg-[#0F4C3A]/5 border border-[#0F4C3A]/20 rounded-xl p-5">
            <h4 className="font-bold text-[#0F4C3A] mb-3 text-sm">
              Komitmen Transparansi
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#0F4C3A] font-bold mt-0.5">
                  &#10003;
                </span>
                Seluruh donasi terverifikasi admin sebelum masuk laporan
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0F4C3A] font-bold mt-0.5">
                  &#10003;
                </span>
                Laporan diperbarui secara real-time
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0F4C3A] font-bold mt-0.5">
                  &#10003;
                </span>
                Setiap rupiah dapat dipertanggungjawabkan
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0F4C3A] font-bold mt-0.5">
                  &#10003;
                </span>
                Audit internal dilakukan setiap bulan
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
