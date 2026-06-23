"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Pencil,
  Compass,
  Calendar,
  Settings,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// Koordinat kota default & daftar kota populer Indonesia
const KOTA_LIST = [
  { nama: "Jakarta Pusat", lat: -6.2088, lng: 106.8456 },
  { nama: "Surabaya", lat: -7.2575, lng: 112.7521 },
  { nama: "Bandung", lat: -6.9175, lng: 107.6191 },
  { nama: "Medan", lat: 3.5952, lng: 98.6722 },
  { nama: "Semarang", lat: -6.9932, lng: 110.4203 },
  { nama: "Makassar", lat: -5.1477, lng: 119.4327 },
  { nama: "Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { nama: "Palembang", lat: -2.9761, lng: 104.7754 },
  { nama: "Tangerang", lat: -6.1702, lng: 106.6402 },
  { nama: "Depok", lat: -6.4025, lng: 106.7942 },
];

const METODE_LIST = [
  { id: 20, nama: "Kemenag RI" },
  { id: 2, nama: "ISNA (North America)" },
  { id: 3, nama: "Muslim World League" },
  { id: 4, nama: "Umm Al-Qura" },
];

// Map nama waktu dari API ke tampilan Indonesia
const WAKTU_MAP = {
  Imsak: "Imsak",
  Fajr: "Subuh",
  Sunrise: "Terbit",
  Dhuha: "Dhuha",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};

const TAMPIL_URUTAN = [
  "Imsak",
  "Fajr",
  "Sunrise",
  "Dhuha",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

function getWaktuAktif(waktuSholat) {
  if (!waktuSholat) return null;
  const sekarang = new Date();
  const jam = sekarang.getHours();
  const menit = sekarang.getMinutes();
  const nowMinutes = jam * 60 + menit;

  // Cari waktu sholat yang sedang berlangsung / berikutnya
  const times = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  let aktif = null;

  for (let i = times.length - 1; i >= 0; i--) {
    const rawTime = waktuSholat[times[i]];
    if (!rawTime) continue;
    // Format waktu API: "04:42 (WIB)" atau "04:42"
    const timeStr = rawTime.replace(/\s*\(.*\)/, "").trim();
    const [h, m] = timeStr.split(":").map(Number);
    const sholatMinutes = h * 60 + m;
    if (nowMinutes >= sholatMinutes) {
      aktif = times[i];
      break;
    }
  }

  return aktif || "Fajr";
}

function hitungCountdown(waktuStr) {
  if (!waktuStr) return "";
  const timeStr = waktuStr.replace(/\s*\(.*\)/, "").trim();
  const [h, m] = timeStr.split(":").map(Number);
  const sekarang = new Date();
  const target = new Date(sekarang);
  target.setHours(h, m, 0, 0);
  if (target < sekarang) target.setDate(target.getDate() + 1);
  const diff = target - sekarang;
  const hh = Math.floor(diff / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function JadwalSholatPage() {
  const [kota, setKota] = useState(KOTA_LIST[0]);
  const [metodeId, setMetodeId] = useState(20);
  const [koreksiHijri, setKoreksiHijri] = useState(0);
  const [editKota, setEditKota] = useState(false);
  const [showPengaturan, setShowPengaturan] = useState(false);
  const [waktuSholat, setWaktuSholat] = useState(null);
  const [tanggalInfo, setTanggalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [waktuAktif, setWaktuAktif] = useState(null);
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());

  // Fetch data jadwal dari aladhan.com
  const fetchJadwal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${kota.lat}&longitude=${kota.lng}&method=${metodeId}&tune=0,0,0,${koreksiHijri},0,0,0,0,0`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal memuat data dari server.");
      const json = await res.json();

      if (json.code !== 200) throw new Error(json.status || "Error dari API");

      setWaktuSholat(json.data.timings);
      setTanggalInfo(json.data.date);
    } catch (err) {
      setError(err.message || "Gagal memuat jadwal sholat.");
    } finally {
      setLoading(false);
    }
  }, [kota, metodeId, koreksiHijri]);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  // Update countdown & waktu aktif setiap detik
  useEffect(() => {
    if (!waktuSholat) return;
    const interval = setInterval(() => {
      const aktif = getWaktuAktif(waktuSholat);
      setWaktuAktif(aktif);
      // Hitung countdown ke waktu berikutnya
      const times = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
      const idx = times.indexOf(aktif);
      const berikutnya = times[(idx + 1) % times.length];
      setCountdown(hitungCountdown(waktuSholat[berikutnya]));
      setWaktuSekarang(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [waktuSholat]);

  const formatTanggalIndo = () => {
    if (!tanggalInfo) return "";
    return tanggalInfo.readable; // e.g. "24 Jun 2025"
  };

  const formatHijri = () => {
    if (!tanggalInfo) return "";
    const h = tanggalInfo.hijri;
    return `${h.day} ${h.month.en} ${h.year} H`;
  };

  const formatWaktu = (rawTime) => {
    if (!rawTime) return "--:--";
    return rawTime
      .replace(/\s*\(.*\)/, "")
      .trim()
      .slice(0, 5);
  };

  const metodeNama =
    METODE_LIST.find((m) => m.id === metodeId)?.nama || "Kemenag RI";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2">
          Jadwal Sholat Hari Ini
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Tanggal */}
          <div className="flex items-center space-x-2 text-slate-500 text-sm">
            <Calendar size={14} className="text-[#0F4C3A]" />
            {loading ? (
              <div className="h-4 w-52 bg-slate-100 rounded animate-pulse" />
            ) : (
              <span>
                {formatHijri()} / {formatTanggalIndo()}
              </span>
            )}
          </div>

          {/* Pilih Kota */}
          <div className="relative">
            {editKota ? (
              <div className="flex items-center space-x-2">
                <select
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                  value={kota.nama}
                  onChange={(e) => {
                    const found = KOTA_LIST.find(
                      (k) => k.nama === e.target.value,
                    );
                    if (found) setKota(found);
                  }}
                >
                  {KOTA_LIST.map((k) => (
                    <option key={k.nama} value={k.nama}>
                      {k.nama}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setEditKota(false)}
                  className="text-xs px-3 py-2 bg-[#0F4C3A] text-white rounded-lg"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditKota(true)}
                className="flex items-center space-x-2 text-sm border border-slate-200 bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50 w-fit"
              >
                <MapPin size={14} className="text-[#0F4C3A]" />
                <span className="text-slate-700 font-medium">{kota.nama}</span>
                <Pencil size={12} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center space-x-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchJadwal}
            className="ml-auto flex items-center space-x-1 text-xs font-semibold"
          >
            <RefreshCw size={12} />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Jam sekarang */}
      <div className="text-center">
        <p className="text-4xl sm:text-5xl font-bold text-slate-800 tabular-nums">
          {waktuSekarang.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
        {countdown && waktuAktif && (
          <p className="text-sm text-slate-500 mt-1">
            Menuju waktu berikutnya:{" "}
            <span className="font-mono font-semibold text-[#0F4C3A]">
              {countdown}
            </span>
          </p>
        )}
      </div>

      {/* Kartu Waktu Sholat */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {TAMPIL_URUTAN.map((k) => (
            <div
              key={k}
              className="rounded-xl p-4 bg-slate-100 animate-pulse h-24"
            />
          ))}
        </div>
      ) : waktuSholat ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {TAMPIL_URUTAN.map((key) => {
            const isActive = key === waktuAktif;
            const label = WAKTU_MAP[key] || key;
            const rawTime = waktuSholat[key];
            return (
              <div
                key={key}
                className={`rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                  isActive
                    ? "bg-[#0F4C3A] text-white shadow-lg"
                    : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                {isActive && (
                  <span className="text-[10px] font-bold text-emerald-200 mb-1 tracking-wide">
                    SEKARANG
                  </span>
                )}
                <span
                  className={`text-xs mb-2 ${isActive ? "text-emerald-200" : "text-slate-500"}`}
                >
                  {label}
                </span>
                <span
                  className={`text-lg font-bold tabular-nums ${isActive ? "text-white" : "text-slate-800"}`}
                >
                  {formatWaktu(rawTime)}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Info Tambahan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arah Kiblat (statis berdasarkan koordinat Jakarta) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-slate-500 mb-1">
                <Compass size={14} className="text-[#0F4C3A]" />
                <span>Arah Kiblat dari {kota.nama}</span>
              </div>
              {/* Qibla direction approx: Jakarta ke Mekkah ~295° */}
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                {calculateQibla(kota.lat, kota.lng).toFixed(2)}°
              </p>
              <p className="text-sm text-slate-500 mt-1">
                dari Utara Sejati (perkiraan)
              </p>
            </div>
            <div className="w-14 h-14 border-2 border-[#0F4C3A]/30 rounded-full flex items-center justify-center shrink-0">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "20px solid #0F4C3A",
                  transform: `rotate(${calculateQibla(kota.lat, kota.lng)}deg)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Pengaturan Waktu */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Settings size={14} className="text-[#0F4C3A]" />
              <span className="font-semibold">Pengaturan Waktu</span>
            </div>
            <button
              onClick={() => setShowPengaturan((v) => !v)}
              className="text-sm text-[#0F4C3A] font-semibold hover:underline"
            >
              {showPengaturan ? "Tutup" : "Sesuaikan"}
            </button>
          </div>

          {showPengaturan ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Metode Perhitungan
                </label>
                <select
                  value={metodeId}
                  onChange={(e) => setMetodeId(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                >
                  {METODE_LIST.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Koreksi Hijriah:{" "}
                  {koreksiHijri > 0 ? `+${koreksiHijri}` : koreksiHijri} Hari
                </label>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  value={koreksiHijri}
                  onChange={(e) => setKoreksiHijri(Number(e.target.value))}
                  className="w-full accent-[#0F4C3A]"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Metode Perhitungan
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {metodeNama}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Koreksi Hijriah</p>
                <p className="text-sm font-semibold text-slate-800">
                  {koreksiHijri > 0 ? `+${koreksiHijri}` : koreksiHijri} Hari
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refresh button */}
      <div className="flex justify-center">
        <button
          onClick={fetchJadwal}
          disabled={loading}
          className="flex items-center space-x-2 text-sm text-slate-500 hover:text-[#0F4C3A] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Memuat..." : "Perbarui Jadwal"}</span>
        </button>
      </div>
    </div>
  );
}

// Hitung arah kiblat dari koordinat ke Mekkah (Ka'bah: 21.4225°N, 39.8262°E)
function calculateQibla(lat, lng) {
  const MECCA_LAT = 21.4225;
  const MECCA_LNG = 39.8262;
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(MECCA_LNG - lng);
  const latRad = toRad(lat);
  const meccaRad = toRad(MECCA_LAT);
  const y = Math.sin(dLng) * Math.cos(meccaRad);
  const x =
    Math.cos(latRad) * Math.sin(meccaRad) -
    Math.sin(latRad) * Math.cos(meccaRad) * Math.cos(dLng);
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}
