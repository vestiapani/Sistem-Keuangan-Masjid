"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/beranda" },
  { name: "Jadwal Sholat", href: "/jadwal-sholat" },
  { name: "Laporan Keuangan", href: "/laporan-keuangan" },
  { name: "Kegiatan", href: "/kegiatan" },
];

function PublicNavbar() {
  const pathname = usePathname();

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

        {/* Right Icons */}
        <div className="flex items-center space-x-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 relative">
            <Bell size={20} />
          </button>
          <Link
            href="/login"
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <User size={20} />
          </Link>
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
