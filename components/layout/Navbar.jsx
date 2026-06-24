"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, HelpCircle, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getNotifikasiTerbaru, markAllNotifAsRead } from "@/lib/dashboard";
import { useProfile } from "@/context/ProfileContext";

export default function Navbar({ onMenuClick = () => {} }) {
  const { profile } = useProfile();
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifikasiTerbaru(8);
      setNotifs(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
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
      .channel(`navbar-notif-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifikasis" },
        () => loadNotifs(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadNotifs]);

  const handleOpenNotif = async () => {
    setShowNotif((v) => !v);
    if (!showNotif && unreadCount > 0) {
      await markAllNotifAsRead();
      setUnreadCount(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const tipeIcon = (tipe) => (tipe === "pengeluaran_baru" ? "↑" : "↓");
  const tipeColor = (tipe) =>
    tipe === "pengeluaran_baru" ? "text-rose-500" : "text-[#0F4C3A]";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 rounded-md shrink-0"
        >
          <Moon size={20} />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-[#0F4C3A] truncate">
          {profile.loading ? (
            <span className="inline-block h-5 w-36 bg-slate-100 rounded animate-pulse" />
          ) : (
            profile.namaMasjid
          )}
        </h2>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        {/* Notifikasi */}
        <div className="relative">
          <button
            onClick={handleOpenNotif}
            className="p-2 text-slate-400 hover:text-slate-600 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
            )}
          </button>

          {showNotif && (
            <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto mt-2 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">
                  Notifikasi
                </span>
                <button
                  onClick={loadNotifs}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ↻ Refresh
                </button>
              </div>

              {loading ? (
                <div className="p-4 text-sm text-slate-400 text-center">
                  Memuat...
                </div>
              ) : notifs.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">
                  Belum ada notifikasi.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 text-sm hover:bg-slate-50 flex items-start space-x-3 ${
                        !n.is_read ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <span
                        className={`font-bold text-base shrink-0 ${tipeColor(n.tipe)}`}
                      >
                        {tipeIcon(n.tipe)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-xs">
                          {n.judul}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {n.pesan}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(n.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                <Link
                  href="/notifikasi"
                  onClick={() => setShowNotif(false)}
                  className="block text-center text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  Lihat Semua Notifikasi →
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/bantuan"
          className="hidden xs:block p-2 text-slate-400 hover:text-slate-600"
        >
          <HelpCircle size={20} />
        </Link>

        {/* Avatar */}
        <Link
          href="/profil"
          className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 shrink-0 bg-[#0F4C3A] flex items-center justify-center"
          title={profile.namaBendahara || "Profil Saya"}
        >
          {profile.loading ? (
            <span className="w-full h-full bg-slate-200 animate-pulse" />
          ) : profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Foto profil"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xs font-bold">
              {profile.initials}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
