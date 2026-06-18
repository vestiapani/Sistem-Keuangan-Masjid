"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Filter,
  Wallet,
} from "lucide-react";
import { getRingkasanPublik } from "@/lib/publik";

// Program donasi statis dulu (nanti dari DB)
const PROGRAMS = [
  {
    name: "Pembangunan Menara",
    target: 500000000,
    terkumpul: 375000000,
    persen: 75,
  },
  {
    name: "Operasional Harian",
    target: 20000000,
    targetLabel: "Rp 20.000.000/bln",
    terkumpul: 9000000,
    persen: 45,
  },
];

// Laporan PDF statis dulu
const PDF_REPORTS = [
  { label: "Laporan Oktober 2024", size: "2.4 MB" },
  { label: "Laporan September 2024", size: "2.1 MB" },
];

const CATEGORY_COLORS = {
  Infaq: "bg-emerald-100 text-emerald-700",
  Zakat: "bg-blue-100 text-blue-700",
  Sedekah: "bg-teal-100 text-teal-700",
  Maintenance: "bg-slate-100 text-slate-600",
  Social: "bg-orange-100 text-orange-700",
};

export default function LaporanKeuanganPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatRp = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n ?? 0);
  const formatRpShort = (n) => {
    if (!n) return "Rp 0";
    if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(3).replace(".", ".")}`;
    return "Rp " + new Intl.NumberFormat("id-ID").format(n);
  };

  useEffect(() => {
    getRingkasanPublik()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Gabung transaksi untuk tampilan
  const transaksi = data
    ? [
        ...data.donasis.slice(0, 3).map((d) => ({
          tanggal: d.tanggal_donasi,
          kategori: d.kategori,
          keterangan:
            d.nama_donatur + (d.keterangan ? ` — ${d.keterangan}` : ""),
          jumlah: d.jumlah_dana,
          tipe: "masuk",
        })),
        ...data.pengeluarans.slice(0, 2).map((p) => ({
          tanggal: p.tanggal_pengeluaran,
          kategori: p.kategori || "Maintenance",
          keterangan: p.keperluan,
          jumlah: p.jumlah_pengeluaran,
          tipe: "keluar",
        })),
      ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-slate-800">
          Transparansi Keuangan
        </h1>
        <p className="text-slate-500 max-w-xl">
          Amanah umat adalah prioritas kami. Laporan berikut menyajikan rincian
          pemasukan dan pengeluaran masjid secara terbuka dan akuntabel.
        </p>
        <Link
          href="/laporan-keuangan/konfirmasi-donasi"
          className="inline-flex items-center space-x-2 bg-[#8B4513] hover:bg-[#7a3b10] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <span>🤲</span>
          <span>Donasi Sekarang</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Pemasukan */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs text-slate-500 mb-2">
            Total Pemasukan Bulan Ini
          </p>
          {loading ? (
            <div className="h-9 bg-slate-100 rounded animate-pulse" />
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-slate-800">
                {formatRpShort(data?.totalMasuk)}
              </h3>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <ArrowDownRight size={20} className="text-emerald-600" />
              </div>
            </div>
          )}
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs text-slate-500 mb-2">
            Total Pengeluaran Bulan Ini
          </p>
          {loading ? (
            <div className="h-9 bg-slate-100 rounded animate-pulse" />
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-rose-600">
                {formatRpShort(data?.totalKeluar)}
              </h3>
              <div className="p-2 bg-rose-50 rounded-lg">
                <ArrowUpRight size={20} className="text-rose-500" />
              </div>
            </div>
          )}
        </div>

        {/* Saldo */}
        <div className="bg-[#0F4C3A] rounded-xl p-6">
          <p className="text-xs text-emerald-300 mb-2">Saldo Akhir</p>
          {loading ? (
            <div className="h-9 bg-emerald-800 rounded animate-pulse" />
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-white">
                {formatRpShort(data?.saldo)}
              </h3>
              <div className="p-2 bg-emerald-800/50 rounded-lg">
                <Wallet size={20} className="text-emerald-300" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Program Donasi */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Program Donasi Aktif
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROGRAMS.map((prog) => (
            <div
              key={prog.name}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-800">{prog.name}</h4>
                  <p className="text-xs text-slate-500">
                    Target: {prog.targetLabel || formatRp(prog.target)}
                  </p>
                </div>
                <span className="text-lg font-bold text-slate-700">
                  {prog.persen}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full my-3">
                <div
                  className="h-2 bg-[#0F4C3A] rounded-full transition-all"
                  style={{ width: `${prog.persen}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Terkumpul: {formatRp(prog.terkumpul)}</span>
                <button className="text-[#0F4C3A] font-semibold hover:underline">
                  Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaksi & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rincian Transaksi */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Rincian Transaksi</h3>
            <button className="flex items-center space-x-1.5 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
              <Filter size={12} />
              <span>Filter</span>
            </button>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="text-left px-6 py-3">Tanggal</th>
                  <th className="text-left px-4 py-3">Kategori</th>
                  <th className="text-left px-4 py-3">Keterangan</th>
                  <th className="text-right px-6 py-3">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
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
                    <td className="px-4 py-3 text-slate-700">{t.keterangan}</td>
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
          )}

          <div className="px-6 py-4 border-t border-slate-100 text-center">
            <button className="text-sm text-[#0F4C3A] font-semibold hover:underline">
              Lihat Semua Transaksi
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Tren Bulanan (statis) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 mb-4">
              Tren Keuangan Bulanan
            </h4>
            <div className="h-24 flex items-end justify-between gap-2">
              {[
                { m: "Jul", h: 40 },
                { m: "Agt", h: 55 },
                { m: "Sep", h: 45 },
                { m: "Okt", h: 90, active: true },
              ].map(({ m, h, active }) => (
                <div key={m} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full rounded-sm ${active ? "bg-[#0F4C3A]" : "bg-slate-200"}`}
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-xs text-slate-500 mt-2">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download PDF */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 mb-4">
              Unduh Laporan (PDF)
            </h4>
            <div className="space-y-3">
              {PDF_REPORTS.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between hover:bg-slate-50 p-2 rounded-lg cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-red-50 rounded">
                      <span className="text-red-500 text-xs font-bold">
                        PDF
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {r.label}
                      </p>
                      <p className="text-xs text-slate-400">{r.size}</p>
                    </div>
                  </div>
                  <Download
                    size={16}
                    className="text-slate-400 group-hover:text-[#0F4C3A] transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
