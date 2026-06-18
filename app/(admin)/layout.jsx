"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, WalletCards, CreditCard, FileBox, Settings, HelpCircle, LogOut, Bell, Plus } from 'lucide-react';
import { Toaster } from "@/components/ui/sonner";
import { TransactionProvider, useTransactions } from '@/app/context/TransactionContext';

export default function AdminLayout({ children }) {
  return (
    <TransactionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </TransactionProvider>
  );
}

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const { transactions } = useTransactions();

  const formatRp = (angka) => new Intl.NumberFormat('id-ID').format(angka);

  // 3 transaksi terbaru (id terbesar = baru ditambahkan via Date.now())
  const latestNotifs = [...transactions].sort((a, b) => b.id - a.id).slice(0, 3);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Donasi Masuk', icon: WalletCards, href: '/donasi' },
    { name: 'Pengeluaran Kas', icon: CreditCard, href: '/pengeluaran' },
    { name: 'Laporan Keuangan', icon: FileBox, href: '/laporan' },
    { name: 'Pengaturan', icon: Settings, href: '/pengaturan' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shadow-sm z-20">
        <div>
          <div className="p-6 flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0F4C3A] rounded-lg flex items-center justify-center text-white font-bold text-lg">MA</div>
            <div>
              <h1 className="font-bold text-slate-800 text-[15px] leading-tight">Sistem Keuangan</h1>
              <p className="text-[13px] text-slate-500">Bendahara Masjid</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Link href="/donasi/create" className="w-full bg-[#0F4C3A] hover:bg-[#0A3629] text-white flex items-center justify-center space-x-2 py-2.5 rounded-md font-medium text-sm transition-colors">
              <Plus size={18} />
              <span>Tambah Transaksi</span>
            </Link>
          </div>
          <nav className="px-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.name} href={item.href} className={`flex items-center space-x-3 px-3 py-2.5 rounded-md font-medium text-sm transition-colors ${isActive ? 'bg-[#E2E8F0] text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <item.icon size={18} className={isActive ? 'text-slate-900' : 'text-slate-500'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100 space-y-1">
          <Link href="/bantuan" className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 px-3 py-2.5 rounded-md font-medium text-sm transition-colors">
            <HelpCircle size={18} className="text-slate-500" />
            <span>Bantuan</span>
          </Link>
          <button className="flex w-full items-center space-x-3 text-slate-600 hover:bg-slate-50 px-3 py-2.5 rounded-md font-medium text-sm transition-colors">
            <LogOut size={18} className="text-slate-500" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-bold text-[#0F4C3A]">Masjid Al-Ikhlas</h2>
          <div className="flex items-center space-x-4">

            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="p-2 text-slate-400 hover:text-slate-600 relative">
                <Bell size={20} />
                {latestNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 font-bold text-sm text-slate-800">Notifikasi Baru</div>
                  {latestNotifs.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">Belum ada transaksi.</div>
                  ) : (
                    latestNotifs.map((t) => (
                      <div key={t.id} className="p-4 text-sm text-slate-600 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        {t.type === 'Pemasukan'
                          ? `${t.cat} masuk: ${t.desc} — Rp ${formatRp(t.amount)}`
                          : `Pengeluaran ${t.cat}: ${t.desc} — Rp ${formatRp(t.amount)}`}
                      </div>
                    ))
                  )}
                  <Link href="/notifikasi" onClick={() => setShowNotif(false)} className="block px-4 py-2 text-center text-sm font-semibold text-[#0F4C3A] hover:underline">
                    Lihat Semua Notifikasi
                  </Link>
                </div>
              )}
            </div>

            <Link href="/bantuan" className="p-2 text-slate-400 hover:text-slate-600"><HelpCircle size={20} /></Link>
            <Link href="/pengaturan" className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          {children}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}