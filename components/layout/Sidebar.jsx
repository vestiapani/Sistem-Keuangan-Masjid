"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  WalletCards,
  CreditCard,
  FileBox,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Donasi Masuk", icon: WalletCards, href: "/donasi" },
  { name: "Verifikasi Donasi", icon: ShieldCheck, href: "/verifikasi" },
  { name: "Pengeluaran Kas", icon: CreditCard, href: "/pengeluaran" },
  { name: "Laporan Keuangan", icon: FileBox, href: "/laporan" },
  { name: "Pengaturan", icon: Settings, href: "/pengaturan" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shadow-sm z-20">
      <div>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0F4C3A] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            MA
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-[15px] leading-tight">
              Sistem Keuangan
            </h1>
            <p className="text-[13px] text-slate-500">Bendahara Masjid</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Link
            href="/donasi/create"
            className="w-full bg-[#0F4C3A] hover:bg-[#0A3629] text-white flex items-center justify-center space-x-2 py-2.5 rounded-md font-medium text-sm transition-colors"
          >
            <Plus size={18} />
            <span>Tambah Transaksi</span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md font-medium text-sm transition-colors ${
                  isActive
                    ? "bg-[#E2E8F0] text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-slate-900" : "text-slate-500"}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <Link
          href="/bantuan"
          className="flex items-center space-x-3 text-slate-600 hover:bg-slate-50 px-3 py-2.5 rounded-md font-medium text-sm transition-colors"
        >
          <HelpCircle size={18} className="text-slate-500" />
          <span>Bantuan</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 text-slate-600 hover:bg-slate-50 px-3 py-2.5 rounded-md font-medium text-sm transition-colors"
        >
          <LogOut size={18} className="text-slate-500" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
