"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock,
  HandHeart,
  AlertCircle,
} from "lucide-react";
import { getRingkasanPublik } from "@/lib/publik";
import InfoMasjidPublik from "@/components/publik/InfoMasjidPublik";

const DEFAULT_COORD = { lat: -6.2088, lng: 106.8456, nama: "Jakarta Pusat" };
const METODE_ID = 20;

const WAKTU_TAMPIL = [
  { key: "Fajr", label: "Subuh" },
  { key: "Sunrise", label: "Terbit" },
  { key: "Dhuhr", label: "Dzuhur" },
  { key: "Asr", label: "Ashar" },
  { key: "Maghrib", label: "Maghrib" },
  { key: "Isha", label: "Isya" },
];

function parseTime(raw) {
  if (!raw) return null;
  return raw
    .replace(/\s*\(.*\)/, "")
    .trim()
    .slice(0, 5);
}

function getWaktuAktif(timings) {
  if (!timings) return "Fajr";
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const SHOLAT_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  let aktif = "Fajr";
  for (let i = SHOLAT_KEYS.length - 1; i >= 0; i--) {
    const key = SHOLAT_KEYS[i];
    const t = timings[key];
    if (!t) continue;
    const [h, m] = t
      .replace(/\s*\(.*\)/, "")
      .trim()
      .slice(0, 5)
      .split(":")
      .map(Number);
    if (nowMin >= h * 60 + m) {
      aktif = key;
      break;
    }
  }
  return aktif;
}

function PrayerTimesBar() {
  const [timings, setTimings] = useState(null);
  const [waktuAktif, setWaktuAktif] = useState("Fajr");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimings = async () => {
      try {
        const today = new Date();
        const d = today.getDate();
        const mo = today.getMonth() + 1;
        const y = today.getFullYear();
        const url = `https://api.aladhan.com/v1/timings/${d}-${mo}-${y}?latitude=${DEFAULT_COORD.lat}&longitude=${DEFAULT_COORD.lng}&method=${METODE_ID}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Gagal fetch jadwal");
        const json = await res.json();
        if (json.code !== 200) throw new Error(json.status);
        setTimings(json.data.timings);
        setWaktuAktif(getWaktuAktif(json.data.timings));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTimings();
  }, []);

  useEffect(() => {
    if (!timings) return;
    const interval = setInterval(() => {
      setWaktuAktif(getWaktuAktif(timings));
    }, 60000);
    return () => clearInterval(interval);
  }, [timings]);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 relative z-10">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-[#0F4C3A]/5">
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-sm text-slate-700">
            <Clock size={15} className="text-[#0F4C3A]" />
            <span className="font-semibold">Jadwal Sholat Hari Ini</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {DEFAULT_COORD.nama},{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        {error ? (
          <div className="flex items-center gap-2 px-5 py-4 text-xs text-slate-500">
            <AlertCircle size={14} className="text-rose-400" />
            <span>Jadwal sholat tidak tersedia saat ini.</span>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-6 divide-x divide-slate-100">
            {WAKTU_TAMPIL.map((w) => (
              <div
                key={w.key}
                className="flex flex-col items-center py-3 sm:py-4 gap-2"
              >
                <div className="h-3 w-10 bg-slate-100 rounded animate-pulse" />
                <div className="h-5 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 divide-x divide-slate-100">
            {WAKTU_TAMPIL.map(({ key, label }) => {
              const isActive = key === waktuAktif;
              const time = parseTime(timings?.[key]);
              return (
                <div
                  key={key}
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
                    className={`text-[11px] sm:text-xs mb-1 ${
                      isActive ? "text-emerald-200" : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`text-sm sm:text-lg font-bold tabular-nums ${
                      isActive ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {time ?? "--:--"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
              Selamat datang di Masjid At-Taqwa. Pusat informasi terpadu yang
              Amanah &amp; Transparan untuk seluruh jamaah.
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
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">Total Pemasukan</span>
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
              <span className="text-xs text-slate-500">Total Pengeluaran</span>
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

      {/* Info Masjid dari DB */}
      <InfoMasjidPublik />

      {/* CTA Donasi */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-[#0F4C3A] rounded-2xl px-6 sm:px-10 py-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Setiap Donasi Anda, Tercatat dan Terlihat
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
