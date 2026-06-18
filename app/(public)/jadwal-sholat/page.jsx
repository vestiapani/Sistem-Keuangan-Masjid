"use client";

import React, { useState } from "react";
import { MapPin, Pencil } from "lucide-react";

// Data statis dulu, nanti bisa connect ke API aladhan.com
const PRAYER_DATA = {
  hijri: "15 Ramadhan 1445 H",
  gregorian: "26 Maret 2024",
  location: "Jakarta Pusat",
  times: [
    { name: "Imsak", time: "04:32" },
    { name: "Subuh", time: "04:42", active: true, countdown: "-00:15:30" },
    { name: "Terbit", time: "05:58" },
    { name: "Dhuha", time: "06:22" },
    { name: "Dzuhur", time: "12:03" },
    { name: "Ashar", time: "15:15" },
    { name: "Maghrib", time: "18:06" },
    { name: "Isya", time: "19:14" },
  ],
  qibla: "295.14°",
  method: "Kemenag RI",
  hijriCorrection: "+0 Hari",
};

export default function JadwalSholatPage() {
  const [location] = useState(PRAYER_DATA.location);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          Jadwal Sholat Hari Ini
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-500 text-sm">
            <span>📅</span>
            <span>
              {PRAYER_DATA.hijri} / {PRAYER_DATA.gregorian}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm border border-slate-200 bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
            <MapPin size={14} className="text-slate-500" />
            <span className="text-slate-700 font-medium">{location}</span>
            <Pencil size={12} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Prayer Time Cards */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {PRAYER_DATA.times.map((prayer) => (
          <div
            key={prayer.name}
            className={`rounded-xl p-4 flex flex-col items-center text-center ${
              prayer.active
                ? "bg-[#0F4C3A] text-white"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            {prayer.active && prayer.countdown && (
              <span className="text-[10px] font-bold text-emerald-300 mb-1">
                {prayer.countdown}
              </span>
            )}
            <span
              className={`text-xs mb-2 ${
                prayer.active ? "text-emerald-200" : "text-slate-500"
              }`}
            >
              {prayer.name}
            </span>
            <span
              className={`text-xl font-bold tabular-nums ${
                prayer.active ? "text-white" : "text-slate-800"
              }`}
            >
              {prayer.time}
            </span>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arah Kiblat */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-slate-500 mb-1">
                <span>⊙</span>
                <span>Arah Kiblat</span>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {PRAYER_DATA.qibla}
              </p>
              <p className="text-sm text-slate-500 mt-1">dari Utara Sejati</p>
            </div>
            <div className="w-14 h-14 border-2 border-slate-200 rounded-full flex items-center justify-center">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "20px solid #F59E0B",
                  transform: `rotate(${295}deg)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Pengaturan Waktu */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span>⚙️</span>
              <span className="font-semibold">Pengaturan Waktu</span>
            </div>
            <button className="text-sm text-[#0F4C3A] font-semibold hover:underline">
              Sesuaikan
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Metode Perhitungan</p>
              <p className="text-sm font-semibold text-slate-800">
                {PRAYER_DATA.method}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Koreksi Hijriah</p>
              <p className="text-sm font-semibold text-slate-800">
                {PRAYER_DATA.hijriCorrection}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
