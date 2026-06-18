"use client";

import React, { useState } from "react";
import { Plus, Clock, MapPin } from "lucide-react";

// Data statis dulu - nanti dari Supabase tabel kegiatans
const KEGIATAN_DATA = [
  {
    id: 1,
    tanggal: "10 akt",
    kategori: "Kajian Rutin",
    kategoriBadge: "bg-slate-100 text-slate-600",
    waktu: "19:30 WIB",
    judul: "Kajian Tafsir Al-Qur'an Surat Al-Kahfi",
    deskripsi:
      "Bersama Ustadz Dr. H. Fulan bin Fulan. Membahas tafsir tematik dan kisah-kisah hikmah di dalam surat Al-Kahfi untuk bekal...",
    lokasi: "Ruang Utama Masjid",
    status: "detail",
    statusLabel: "Detail",
    statusBg:
      "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
    image:
      "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=400&q=80",
    badge: { text: "10 å kt", bg: "bg-orange-500" },
  },
  {
    id: 2,
    tanggal: "15 akt",
    kategori: "Sosial & Pemuda",
    kategoriBadge: "bg-orange-100 text-orange-700",
    waktu: "07:00 WIB",
    judul: "Kerja Bakti & Berbagi Sembako Dhuafa",
    deskripsi:
      "Program rutin pemuda masjid. Mari bergabung membersihkan lingkungan sekitar dan menyalurkan paket sembako kepada...",
    lokasi: "Halaman Masjid",
    status: "daftar",
    statusLabel: "Daftar Relawan",
    statusBg: "bg-[#0F4C3A] text-white hover:bg-[#0A3629]",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    badge: { text: "15 å kt", bg: "bg-orange-500" },
  },
  {
    id: 3,
    tanggal: "22 akt",
    kategori: "Edukasi",
    kategoriBadge: "bg-amber-100 text-amber-700",
    waktu: null,
    judul: "Workshop Manajemen Keuangan Keluarga Islami",
    deskripsi:
      "Pelatihan praktis mengelola keuangan keluarga sesuai prinsip syariah bersama praktisi perbankan syariah terkemuka.",
    lokasi: "Ruang Serbaguna Lt. 2",
    status: "tutup",
    statusLabel: "Ditutup",
    statusBg: "bg-slate-100 text-slate-500 cursor-not-allowed",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80",
    badge: { text: "22 å kt", bg: "bg-orange-500" },
    kuotaPenuh: true,
  },
];

const KATEGORI_FILTER = ["Semua", "Kajian", "Sosial", "Edukasi", "Remaja"];

const CALENDAR_DAYS = [
  [29, 30, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
];

export default function KegiatanPage() {
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [activeDay] = useState(6);
  const [eventDay] = useState(10);

  const filtered =
    activeKategori === "Semua"
      ? KEGIATAN_DATA
      : KEGIATAN_DATA.filter((k) =>
          k.kategori.toLowerCase().includes(activeKategori.toLowerCase()),
        );

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
              <h3 className="font-bold text-slate-800 text-sm">Oktober 2024</h3>
              <div className="flex space-x-1">
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  ‹
                </button>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  ›
                </button>
              </div>
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
                  const isActive = day === activeDay;
                  const isEvent = day === eventDay;
                  const isGray = wi === 0 && day > 20;
                  return (
                    <button
                      key={di}
                      className={`text-xs py-1.5 rounded-full relative transition-colors ${
                        isActive
                          ? "bg-[#0F4C3A] text-white font-bold"
                          : isGray
                            ? "text-slate-300"
                            : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                      {isEvent && !isActive && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">Mendatang</h2>
            <button className="text-sm text-[#0F4C3A] font-semibold hover:underline">
              Lihat Semua
            </button>
          </div>

          <div className="space-y-4">
            {filtered.map((kegiatan) => (
              <div
                key={kegiatan.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex"
              >
                {/* Image */}
                <div className="relative w-48 shrink-0">
                  <img
                    src={kegiatan.image}
                    alt={kegiatan.judul}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {kegiatan.badge.text}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    {/* Category + Time */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${kegiatan.kategoriBadge}`}
                        >
                          {kegiatan.kategori}
                        </span>
                        {kegiatan.kuotaPenuh && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-100 text-rose-600">
                            Kuota Penuh
                          </span>
                        )}
                      </div>
                      {kegiatan.waktu && (
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <Clock size={12} />
                          <span>{kegiatan.waktu}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 text-base mb-1.5 leading-snug">
                      {kegiatan.judul}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {kegiatan.deskripsi}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      <span>{kegiatan.lokasi}</span>
                    </div>
                    <button
                      className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-colors ${kegiatan.statusBg}`}
                    >
                      {kegiatan.statusLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
