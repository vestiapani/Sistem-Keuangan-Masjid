"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  HandHeart,
} from "lucide-react";
import { getRingkasanPublik } from "@/lib/publik";

const PRAYER_TIMES = {
  Subuh: "04:21",
  Dzuhur: "11:45",
  Ashar: "14:58",
  Maghrib: "17:51",
  Isya: "19:02",
};

function PrayerTimesBar() {
  const current = "Ashar"; // nanti dynamic
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 relative z-10">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-[#0F4C3A]/5">
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-sm text-slate-700">
            <Clock size={15} className="text-[#0F4C3A]" />
            <span className="font-semibold">Jadwal Sholat Hari Ini</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Jakarta Pusat, 24 Okt
          </span>
        </div>
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          {Object.entries(PRAYER_TIMES).map(([name, time]) => {
            const isActive = name === current;
            return (
              <div
                key={name}
                className={`flex flex-col items-center py-3 sm:py-4 ${
                  isActive ? "bg-[#0F4C3A] text-white" : ""
                }`}
              >
                {isActive && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-200 mb-1 tracking-wide">
                    SEKARANG
                  </span>
                )}
                <span
                  className={`text-[11px] sm:text-xs mb-1 ${isActive ? "text-emerald-200" : "text-slate-500"}`}
                >
                  {name}
                </span>
                <span
                  className={`text-sm sm:text-lg font-bold tabular-nums ${isActive ? "text-white" : "text-slate-800"}`}
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
        className="relative min-h-[420px] sm:min-h-[480px] flex items-center justify-center text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,42,32,0.78) 0%, rgba(15,76,58,0.6) 55%, rgba(249,250,251,1) 100%), url('https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=1400&q=80') center/cover no-repeat",
        }}
      >
        <div className="relative z-10 px-5 sm:px-6 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Membangun Umat,
            <br />
            Berlandaskan Kepercayaan
          </h1>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 sm:px-6 py-4 max-w-xl mx-auto mb-7 border border-white/10">
            <p className="text-white/90 text-sm sm:text-base">
              Selamat datang di Masjid Community Portal. Pusat informasi terpadu
              yang Amanah & Transparan untuk seluruh jamaah.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/kegiatan"
              className="inline-flex items-center space-x-2 bg-white hover:bg-emerald-50 text-[#0F4C3A] px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-md w-full sm:w-auto justify-center"
            >
              <span>Lihat Kegiatan</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/laporan-keuangan/konfirmasi-donasi"
              className="inline-flex items-center space-x-2 border border-white/40 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto justify-center"
            >
              <HandHeart size={16} />
              <span>Donasi Sekarang</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Jadwal Sholat */}
      <PrayerTimesBar />

      {/* Transparansi Keuangan */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Transparansi Keuangan
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ringkasan kas masjid bulan ini. Amanah dari jamaah untuk umat.
            </p>
          </div>
          <Link
            href="/laporan-keuangan"
            className="flex items-center space-x-1.5 text-sm font-semibold border border-[#0F4C3A]/20 bg-white hover:bg-[#0F4C3A] hover:text-white px-4 py-2.5 rounded-lg transition-colors w-fit"
          >
            <span>Lihat Laporan Lengkap</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">Total Saldo Kas</span>
              <div className="p-1.5 bg-[#0F4C3A]/10 rounded-lg">
                <Wallet size={14} className="text-[#0F4C3A]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800">
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

          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">
                Pemasukan Bulan Ini
              </span>
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <ArrowDownRight size={14} className="text-emerald-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800">
              {loading ? (
                <div className="h-8 bg-slate-100 rounded animate-pulse w-40" />
              ) : (
                formatRp(data?.totalMasuk)
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Infaq, Sedekah, Zakat</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">
                Pengeluaran Bulan Ini
              </span>
              <div className="p-1.5 bg-rose-50 rounded-lg">
                <ArrowUpRight size={14} className="text-rose-500" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800">
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

      {/* CTA Donasi banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-[#0F4C3A] rounded-2xl px-6 sm:px-10 py-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Setiap Donasi Anda, Tercatat & Terlihat
            </h3>
            <p className="text-emerald-100/80 text-sm max-w-md">
              Salurkan infaq, zakat, atau sedekah Anda. Seluruh dana akan
              dilaporkan secara terbuka kepada jamaah.
            </p>
          </div>
          <Link
            href="/laporan-keuangan/konfirmasi-donasi"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-[#0F4C3A] px-6 py-3 rounded-lg font-semibold text-sm transition-colors mt-6 sm:mt-0 shrink-0"
          >
            <HandHeart size={16} /> Donasi Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}
