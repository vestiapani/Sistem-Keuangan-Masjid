"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { getRingkasanPublik } from "@/lib/publik";

const PRAYER_TIMES = {
  Subuh: "04:21",
  Dzuhur: "11:45",
  Ashar: "14:58",
  Maghrib: "17:51",
  Isya: "19:02",
};

// Jadwal sholat sederhana - nanti bisa connect ke API aladhan.com
function PrayerTimesBar() {
  const current = "Ashar"; // nanti dynamic
  return (
    <section className="max-w-6xl mx-auto px-6 py-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <span>🕐</span>
            <span className="font-semibold">Jadwal Sholat Hari Ini</span>
          </div>
          <span className="text-xs text-slate-400">Jakarta Pusat, 24 Okt</span>
        </div>
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          {Object.entries(PRAYER_TIMES).map(([name, time]) => {
            const isActive = name === current;
            return (
              <div
                key={name}
                className={`flex flex-col items-center py-4 ${
                  isActive ? "bg-[#0F4C3A] text-white" : ""
                }`}
              >
                {isActive && (
                  <span className="text-[10px] font-bold text-emerald-300 mb-1">
                    SEKARANG
                  </span>
                )}
                <span
                  className={`text-xs mb-1 ${isActive ? "text-emerald-200" : "text-slate-500"}`}
                >
                  {name}
                </span>
                <span
                  className={`text-lg font-bold tabular-nums ${isActive ? "text-white" : "text-slate-800"}`}
                >
                  {time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function BerandaPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatRp = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n ?? 0);

  useEffect(() => {
    getRingkasanPublik()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[480px] flex items-center justify-center text-center"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,76,58,0.55) 0%, rgba(15,76,58,0.3) 60%, rgba(249,250,251,1) 100%), url('https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=1400&q=80') center/cover no-repeat",
        }}
      >
        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Membangun Umat,
            <br />
            Berlandaskan Kepercayaan
          </h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 max-w-xl mx-auto mb-6">
            <p className="text-white/90 text-sm md:text-base">
              Selamat datang di Masjid Community Portal. Pusat informasi terpadu
              yang Amanah & Transparan untuk seluruh jamaah.
            </p>
          </div>
          <Link
            href="/kegiatan"
            className="inline-flex items-center space-x-2 bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
          >
            <span>Lihat Kegiatan</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Jadwal Sholat */}
      <PrayerTimesBar />

      {/* Transparansi Keuangan */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Transparansi Keuangan
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ringkasan kas masjid bulan ini. Amanah dari jamaah untuk umat.
            </p>
          </div>
          <Link
            href="/laporan-keuangan"
            className="flex items-center space-x-1.5 text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
          >
            <span>Lihat Laporan Lengkap</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Saldo */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">Total Saldo Kas</span>
              <div className="p-1.5 bg-slate-100 rounded-md">
                <Wallet size={14} className="text-slate-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? (
                <div className="h-8 bg-slate-100 rounded animate-pulse w-40" />
              ) : (
                formatRp(data?.saldo)
              )}
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              +5.2% dari bulan lalu
            </p>
          </div>

          {/* Pemasukan */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">
                Pemasukan Bulan Ini
              </span>
              <div className="p-1.5 bg-emerald-50 rounded-md">
                <ArrowDownRight size={14} className="text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? (
                <div className="h-8 bg-slate-100 rounded animate-pulse w-40" />
              ) : (
                formatRp(data?.totalMasuk)
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Infaq, Sedekah, Zakat</p>
          </div>

          {/* Pengeluaran */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">
                Pengeluaran Bulan Ini
              </span>
              <div className="p-1.5 bg-rose-50 rounded-md">
                <ArrowUpRight size={14} className="text-rose-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? (
                <div className="h-8 bg-slate-100 rounded animate-pulse w-40" />
              ) : (
                formatRp(data?.totalKeluar)
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Operasional, Pembangunan, Sosial
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
