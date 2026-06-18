"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, HelpCircle, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar({ onMenuClick = () => {} }) {
  const [showNotif, setShowNotif] = useState(false);
  const [latestNotifs, setLatestNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka);

  const loadNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const [{ data: donasis }, { data: pengeluarans }] = await Promise.all([
        supabase
          .from("donasis")
          .select(
            "id, jumlah_dana, tanggal_donasi, nama_donatur, kategori, created_at",
          )
          .eq("status_verifikasi", "verified")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("pengeluarans")
          .select(
            "id, jumlah_pengeluaran, tanggal_pengeluaran, keperluan, kategori, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const combined = [
        ...(donasis ?? []).map((d) => ({
          id: `donasi-${d.id}`,
          type: "Pemasukan",
          cat: d.kategori,
          desc: d.nama_donatur,
          amount: d.jumlah_dana,
          date: d.tanggal_donasi,
          created_at: d.created_at,
        })),
        ...(pengeluarans ?? []).map((p) => ({
          id: `pengeluaran-${p.id}`,
          type: "Pengeluaran",
          cat: p.kategori,
          desc: p.keperluan,
          amount: p.jumlah_pengeluaran,
          date: p.tanggal_pengeluaran,
          created_at: p.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setLatestNotifs(combined);
      setUnreadCount(combined.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifs();

    const supabase = createClient();
    const channel = supabase
      .channel("navbar-notif")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donasis" },
        loadNotifs,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pengeluarans" },
        loadNotifs,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifs]);

  const handleOpenNotif = () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      setUnreadCount(0);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 rounded-md shrink-0"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-[#0F4C3A] truncate">
          Masjid Al-Ikhlas
        </h2>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        <div className="relative">
          <button
            onClick={handleOpenNotif}
            className="p-2 text-slate-400 hover:text-slate-600 relative"
          >
            <Bell size={20} />
            {!loading && unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
            )}
          </button>

          {showNotif && (
            <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto mt-2 sm:w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">
                  Notifikasi Baru
                </span>
                <button
                  onClick={loadNotifs}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ↻ Refresh
                </button>
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

        <Link
          href="/bantuan"
          className="hidden xs:block p-2 text-slate-400 hover:text-slate-600"
        >
          <HelpCircle size={20} />
        </Link>

        <Link
          href="/pengaturan"
          className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0"
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
