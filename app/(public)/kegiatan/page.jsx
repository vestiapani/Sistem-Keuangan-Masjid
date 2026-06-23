"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Clock, MapPin, Users, RefreshCw } from "lucide-react";
import {
  getKegiatans,
  formatTanggalBadge,
  formatTanggalKegiatan,
  isKuotaPenuh,
} from "@/lib/kegiatan";

const KATEGORI_FILTER = ["Semua", "Kajian", "Sosial", "Edukasi", "Remaja"];

const KATEGORI_BADGE = {
  Kajian: "bg-slate-100 text-slate-600",
  Sosial: "bg-orange-100 text-orange-700",
  Edukasi: "bg-amber-100 text-amber-700",
  Remaja: "bg-blue-100 text-blue-700",
};

// Gambar fallback per kategori
const KATEGORI_IMAGE = {
  Kajian:
    "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=400&q=80",
  Sosial:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  Edukasi:
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80",
  Remaja:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
};

const CALENDAR_DAYS = [
  [29, 30, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
];

function KegiatanCard({ kegiatan }) {
  const kuotaPenuh = isKuotaPenuh(kegiatan);
  const gambar =
    kegiatan.image_url ||
    KATEGORI_IMAGE[kegiatan.kategori] ||
    KATEGORI_IMAGE.Kajian;
  const badgeLabel = formatTanggalBadge(kegiatan.tanggal);
  const kategoriBadge =
    KATEGORI_BADGE[kegiatan.kategori] || "bg-slate-100 text-slate-600";

  // Tentukan label & style tombol aksi
  let statusLabel = "Detail";
  let statusBg =
    "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50";

  if (kegiatan.status === "selesai") {
    statusLabel = "Selesai";
    statusBg = "bg-slate-100 text-slate-400 cursor-not-allowed";
  } else if (kegiatan.status === "dibatalkan") {
    statusLabel = "Dibatalkan";
    statusBg = "bg-rose-100 text-rose-400 cursor-not-allowed";
  } else if (kuotaPenuh) {
    statusLabel = "Kuota Penuh";
    statusBg = "bg-slate-100 text-slate-500 cursor-not-allowed";
  } else if (kegiatan.kuota) {
    statusLabel = "Daftar Relawan";
    statusBg = "bg-[#0F4C3A] text-white hover:bg-[#0A3629]";
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col sm:flex-row">
      {/* Gambar */}
      <div className="relative w-full h-44 sm:w-48 sm:h-auto shrink-0">
        <img
          src={gambar}
          alt={kegiatan.judul}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-3 left-3 bg-[#C8932E] text-white text-xs px-2 py-0.5 rounded-full font-medium">
          {badgeLabel}
        </span>
      </div>

      {/* Konten */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Kategori + waktu */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${kategoriBadge}`}
              >
                {kegiatan.kategori}
              </span>
              {kuotaPenuh && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-100 text-rose-600">
                  Kuota Penuh
                </span>
              )}
            </div>
            {kegiatan.waktu && (
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Clock size={12} />
                <span>{kegiatan.waktu.slice(0, 5)} WIB</span>
              </div>
            )}
          </div>

          {/* Judul & deskripsi */}
          <h3 className="font-bold text-slate-800 text-base mb-1.5 leading-snug">
            {kegiatan.judul}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2">
            {kegiatan.deskripsi}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {kegiatan.lokasi && (
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <MapPin size={12} />
                <span>{kegiatan.lokasi}</span>
              </div>
            )}
            {kegiatan.kuota && (
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <Users size={12} />
                <span>
                  {kegiatan.pendaftar}/{kegiatan.kuota}
                </span>
              </div>
            )}
          </div>
          <button
            disabled={
              kuotaPenuh ||
              kegiatan.status === "selesai" ||
              kegiatan.status === "dibatalkan"
            }
            className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-colors ${statusBg}`}
          >
            {statusLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function KegiatanSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col sm:flex-row animate-pulse">
      <div className="w-full h-44 sm:w-48 sm:h-auto bg-slate-100 shrink-0" />
      <div className="flex-1 p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded w-1/4" />
        <div className="h-5 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function KegiatanPage() {
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [kegiatans, setKegiatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay] = useState(new Date().getDate());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getKegiatans({ kategori: activeKategori });
      setKegiatans(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data kegiatan.");
    } finally {
      setLoading(false);
    }
  }, [activeKategori]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pisah: mendatang vs selesai
  const today = new Date().toISOString().split("T")[0];
  const mendatang = kegiatans.filter(
    (k) => k.tanggal >= today && k.status !== "dibatalkan",
  );
  const lampau = kegiatans.filter(
    (k) => k.tanggal < today || k.status === "selesai",
  );

  // Tanggal kegiatan mendatang untuk kalender
  const eventDates = mendatang.map((k) =>
    new Date(k.tanggal + "T00:00:00").getDate(),
  );

  // Nama bulan sekarang
  const namaBulan = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Kegiatan & Acara
          </h1>
          <p className="text-slate-500 max-w-lg">
            Mari bergabung dalam ragam kegiatan bermanfaat untuk mempererat
            ukhuwah dan meningkatkan ketakwaan kita bersama di lingkungan
            masjid.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
          <Plus size={16} />
          <span>Usulkan Kegiatan</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="w-full lg:w-56 shrink-0 space-y-6">
          {/* Kategori */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-bold text-slate-800 mb-3">Kategori</h3>
            <div className="flex flex-wrap gap-2">
              {KATEGORI_FILTER.map((kat) => (
                <button
                  key={kat}
                  onClick={() => setActiveKategori(kat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    activeKategori === kat
                      ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm capitalize">
                {namaBulan}
              </h3>
            </div>
            {/* Days header */}
            <div className="grid grid-cols-7 text-center mb-2">
              {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
                <span key={i} className="text-xs text-slate-400 py-1">
                  {d}
                </span>
              ))}
            </div>
            {/* Calendar grid */}
            {CALENDAR_DAYS.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 text-center">
                {week.map((day, di) => {
                  const isToday = day === activeDay;
                  const isEvent = eventDates.includes(day);
                  const isGray = wi === 0 && day > 20;
                  return (
                    <div
                      key={di}
                      className={`text-xs py-1.5 rounded-full relative ${
                        isToday
                          ? "bg-[#0F4C3A] text-white font-bold"
                          : isGray
                            ? "text-slate-300"
                            : "text-slate-700"
                      }`}
                    >
                      {day}
                      {isEvent && !isToday && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Ringkasan */}
          {!loading && (
            <div className="bg-[#0F4C3A]/5 border border-[#0F4C3A]/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-[#0F4C3A]">Ringkasan</p>
              <p className="text-sm text-slate-700">
                <span className="font-bold">{mendatang.length}</span> kegiatan
                mendatang
              </p>
              <p className="text-sm text-slate-500">
                <span className="font-bold">{lampau.length}</span> kegiatan
                selesai
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mendatang */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Mendatang
              {!loading && (
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({mendatang.length})
                </span>
              )}
            </h2>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <>
                <KegiatanSkeleton />
                <KegiatanSkeleton />
                <KegiatanSkeleton />
              </>
            ) : mendatang.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-400 text-sm">
                Tidak ada kegiatan mendatang
                {activeKategori !== "Semua" &&
                  ` untuk kategori "${activeKategori}"`}
                .
              </div>
            ) : (
              mendatang.map((kegiatan) => (
                <KegiatanCard key={kegiatan.id} kegiatan={kegiatan} />
              ))
            )}
          </div>

          {/* Kegiatan Selesai */}
          {!loading && lampau.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-bold text-slate-800 mb-5">
                Sudah Selesai
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({lampau.length})
                </span>
              </h2>
              <div className="space-y-4 opacity-60">
                {lampau.map((kegiatan) => (
                  <KegiatanCard key={kegiatan.id} kegiatan={kegiatan} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
