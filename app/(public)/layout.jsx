import React from "react";
import Link from "next/link";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Public */}
      <header className="bg-[#0F4C3A] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-[#0F4C3A] font-bold text-lg">
              MA
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Masjid Al-Ikhlas
              </h1>
              <p className="text-emerald-200 text-xs">
                Transparansi Keuangan Terbuka
              </p>
            </div>
          </div>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/transparansi"
              className="text-emerald-100 hover:text-white transition-colors"
            >
              Transparansi
            </Link>
            <Link
              href="/donasi-publik"
              className="bg-white text-[#0F4C3A] hover:bg-emerald-50 px-4 py-2 rounded-md transition-colors font-semibold"
            >
              Donasi Sekarang
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Masjid Al-Ikhlas — Sistem Keuangan
          Transparan
        </div>
      </footer>
    </div>
  );
}
