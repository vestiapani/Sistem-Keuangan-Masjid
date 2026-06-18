"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, HelpCircle } from "lucide-react";
import { getNotifikasiTerbaru } from "@/lib/dashboard";

export default function Navbar() {
  const [showNotif, setShowNotif] = useState(false);
  const [latestNotifs, setLatestNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka);

  useEffect(() => {
    getNotifikasiTerbaru(3)
      .then(setLatestNotifs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
      {/* Nama Masjid */}
      <h2 className="text-lg font-bold text-[#0F4C3A]">Masjid Al-Ikhlas</h2>

      {/* Right: Notif + Help + Avatar */}
      <div className="flex items-center space-x-4">
        {/* Notifikasi */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 text-slate-400 hover:text-slate-600 relative"
          >
            <Bell size={20} />
            {!loading && latestNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 font-bold text-sm text-slate-800">
                Notifikasi Baru
              </div>

              {loading ? (
                <div className="p-4 text-sm text-slate-400">Memuat...</div>
              ) : latestNotifs.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">
                  Belum ada transaksi.
                </div>
              ) : (
                latestNotifs.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 text-sm text-slate-600 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  >
                    {t.type === "Pemasukan"
                      ? `${t.cat} masuk: ${t.desc} — Rp ${formatRp(t.amount)}`
                      : `Pengeluaran ${t.cat}: ${t.desc} — Rp ${formatRp(t.amount)}`}
                  </div>
                ))
              )}

              <Link
                href="/notifikasi"
                onClick={() => setShowNotif(false)}
                className="block px-4 py-2 text-center text-sm font-semibold text-[#0F4C3A] hover:underline"
              >
                Lihat Semua Notifikasi
              </Link>
            </div>
          )}
        </div>

        {/* Bantuan */}
        <Link
          href="/bantuan"
          className="p-2 text-slate-400 hover:text-slate-600"
        >
          <HelpCircle size={20} />
        </Link>

        {/* Avatar */}
        <Link
          href="/pengaturan"
          className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300"
        >
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
