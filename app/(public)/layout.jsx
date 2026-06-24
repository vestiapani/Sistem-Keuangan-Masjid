"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ArrowDownRight,
  ArrowUpRight,
  Menu,
  X,
  Moon,
  HandHeart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { name: "Beranda", href: "/beranda" },
  { name: "Jadwal Sholat", href: "/jadwal-sholat" },
  { name: "Laporan Keuangan", href: "/laporan-keuangan" },
  { name: "Kegiatan", href: "/kegiatan" },
];

function PublicNavbar() {
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      .channel("public-notif-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donasis" },
        () => {
          loadNotifs();
          setHasNew(true);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pengeluarans" },
        () => {
          loadNotifs();
          setHasNew(true);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadNotifs]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleBell = () => {
    setShowNotif(!showNotif);
    if (!showNotif) setHasNew(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/beranda" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C3A] flex items-center justify-center text-white shrink-0">
            <Moon size={18} />
          </div>
          <span className="font-bold text-[#0F4C3A] text-lg sm:text-xl">
            Masjid At-Taqwa
          </span>
        </Link>

        {/* Nav Links - desktop */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative transition-colors pb-1 ${
                  isActive
                    ? "text-[#0F4C3A] font-semibold after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#0F4C3A]"
                    : "text-slate-600 hover:text-[#0F4C3A]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Bell + Donasi CTA + mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/laporan-keuangan/konfirmasi-donasi"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <HandHeart size={14} />
            <span>Donasi</span>
          </Link>

          <div className="relative">
            <button
              onClick={handleBell}
              className="p-2 text-slate-400 hover:text-[#0F4C3A] relative rounded-full hover:bg-slate-50"
            >
              <Bell size={19} />
              {hasNew && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#0F4C3A] border-2 border-white rounded-full" />
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
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
                  <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
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
                    Lihat Laporan Lengkap
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 text-slate-500 hover:text-[#0F4C3A] rounded-md"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-[#0F4C3A]/10 text-[#0F4C3A] font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/laporan-keuangan/konfirmasi-donasi"
            className="flex items-center justify-center gap-1.5 bg-[#0F4C3A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold mt-2"
          >
            <HandHeart size={16} />
            <span>Donasi Sekarang</span>
          </Link>
        </nav>
      )}
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-[#0A2A20] text-emerald-50 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Moon size={16} />
            </div>
            <span className="font-bold text-lg">Masjid At-Taqwa</span>
          </div>
          <p className="text-sm text-emerald-200/80 max-w-sm">
            Mengelola amanah umat dengan transparan dan akuntabel. Setiap rupiah
            yang masuk dan keluar dapat dipantau langsung oleh jamaah.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3 text-white">Navigasi</h4>
          <ul className="space-y-2 text-sm text-emerald-200/80">
            {navLinks.map((l) => (
              <li key={l.name}>
                <Link
                  href={l.href}
                  className="hover:text-white transition-colors"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3 text-white">Lainnya</h4>
          <ul className="space-y-2 text-sm text-emerald-200/80">
            <li>
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                Kebijakan Privasi
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                Kontak
              </Link>
            </li>
            <li>
              <Link
                href="/laporan-keuangan/konfirmasi-donasi"
                className="text-white font-medium hover:text-emerald-200 transition-colors"
              >
                Donasi
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-emerald-200/60">
          © {new Date().getFullYear()} Masjid At-Taqwa. Amanah & Transparan
          untuk Umat.
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
