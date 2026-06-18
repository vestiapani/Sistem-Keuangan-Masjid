"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { name: "Home", href: "/beranda" },
  { name: "Jadwal Sholat", href: "/jadwal-sholat" },
  { name: "Laporan Keuangan", href: "/laporan-keuangan" },
  { name: "Kegiatan", href: "/kegiatan" },
];

function PublicNavbar() {
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  const formatRp = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n ?? 0);

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
          .limit(3),
      ]);

      const combined = [
        ...(donasis ?? []).map((d) => ({
          id: `donasi-${d.id}`,
          type: "masuk",
          label: d.kategori,
          desc: d.nama_donatur,
          amount: d.jumlah_dana,
          date: d.tanggal_donasi,
          created_at: d.created_at,
        })),
        ...(pengeluarans ?? []).map((p) => ({
          id: `pengeluaran-${p.id}`,
          type: "keluar",
          label: p.kategori || "Pengeluaran",
          desc: p.keperluan,
          amount: p.jumlah_pengeluaran,
          date: p.tanggal_pengeluaran,
          created_at: p.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setNotifs(combined);
      if (combined.length > 0) setHasNew(true);
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
      .channel("public-notif")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donasis" },
        () => {
          loadNotifs();
          setHasNew(true);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadNotifs]);

  const handleBell = () => {
    setShowNotif(!showNotif);
    if (!showNotif) setHasNew(false);
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-[#0F4C3A] font-bold text-xl">
          Masjid Al-Ikhlas
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors pb-0.5 ${
                  isActive
                    ? "text-[#0F4C3A] font-semibold border-b-2 border-[#0F4C3A]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Bell only */}
        <div className="relative">
          <button
            onClick={handleBell}
            className="p-2 text-slate-400 hover:text-slate-600 relative"
          >
            <Bell size={20} />
            {hasNew && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-bold text-slate-800">
                  Transaksi Terbaru
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update keuangan masjid real-time
                </p>
              </div>

              {loading ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  Memuat...
                </div>
              ) : notifs.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  Belum ada transaksi terbaru.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-50"
                    >
                      <div
                        className={`p-1.5 rounded-full shrink-0 ${
                          n.type === "masuk"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-500"
                        }`}
                      >
                        {n.type === "masuk" ? (
                          <ArrowDownRight size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {n.desc}
                        </p>
                        <p className="text-xs text-slate-400">
                          {n.label} · {n.date}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold shrink-0 ${
                          n.type === "masuk"
                            ? "text-emerald-600"
                            : "text-rose-500"
                        }`}
                      >
                        {n.type === "masuk" ? "+" : "-"}
                        {formatRp(n.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                <Link
                  href="/laporan-keuangan"
                  onClick={() => setShowNotif(false)}
                  className="block text-center text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  Lihat Laporan Lengkap →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[#0F4C3A] font-bold text-lg">
              Masjid Al-Ikhlas
            </span>
            <p className="text-xs text-slate-400 mt-1">
              © 2024 Masjid Al-Ikhlas. Amanah & Transparan.
            </p>
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-500">
            <Link
              href="/tentang"
              className="hover:text-slate-700 underline underline-offset-2"
            >
              Tentang Kami
            </Link>
            <Link
              href="/kebijakan-privasi"
              className="hover:text-slate-700 underline underline-offset-2"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/kontak"
              className="hover:text-slate-700 underline underline-offset-2"
            >
              Kontak
            </Link>
            <Link
              href="/laporan-keuangan/konfirmasi-donasi"
              className="hover:text-slate-700 underline underline-offset-2 text-[#0F4C3A] font-medium"
            >
              Donasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
