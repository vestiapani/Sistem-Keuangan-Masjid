"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Building2, ArrowDownRight, ArrowUpRight, Plus, Minus, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/app/context/TransactionContext';

export default function DashboardPage() {
  const [periode, setPeriode] = useState('Oktober 2023');
  const { transactions, baseSaldo } = useTransactions();

  // Filter data berdasarkan periode yang dipilih
  const currentMonthData = useMemo(() => transactions.filter(t => t.periode === periode), [transactions, periode]);

  // Kalkulasi Dinamis
  const totalMasukBulanIni = currentMonthData.filter(t => t.type === 'Pemasukan').reduce((acc, curr) => acc + curr.amount, 0);
  const totalKeluarBulanIni = currentMonthData.filter(t => t.type === 'Pengeluaran').reduce((acc, curr) => acc + curr.amount, 0);
  
  // Kalkulasi Total Saldo Keseluruhan
  const totalMasukAll = transactions.filter(t => t.type === 'Pemasukan').reduce((acc, curr) => acc + curr.amount, 0);
  const totalKeluarAll = transactions.filter(t => t.type === 'Pengeluaran').reduce((acc, curr) => acc + curr.amount, 0);
  const saldoKasSekarang = baseSaldo + totalMasukAll - totalKeluarAll;

  const formatRp = (angka) => new Intl.NumberFormat('id-ID').format(angka);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Ringkasan Keuangan</h3>
          <p className="text-sm text-slate-500 mt-1">Periode: {periode}</p>
        </div>
        <div className="flex space-x-3">
          <select value={periode} onChange={(e) => setPeriode(e.target.value)} className="bg-white border border-slate-200 text-sm rounded-md px-3 py-2 outline-none">
            <option value="Oktober 2023">Bulan Ini (Okt 2023)</option>
            <option value="September 2023">Bulan Lalu (Sep 2023)</option>
          </select>
          <Link href="/pengeluaran"><Button variant="outline" className="bg-white"><Minus size={16} className="mr-2"/> Input Pengeluaran</Button></Link>
          <Link href="/donasi/create"><Button className="bg-[#0F4C3A] text-white"><Plus size={16} className="mr-2"/> Tambah Donasi</Button></Link>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="p-6"><h4 className="text-3xl font-bold">Rp {formatRp(saldoKasSekarang)}</h4><p className="text-xs text-slate-500 uppercase mt-2">Total Saldo Kas</p></CardContent></Card>
        <Card><CardContent className="p-6"><h4 className="text-3xl font-bold">Rp {formatRp(totalMasukBulanIni)}</h4><p className="text-xs text-slate-500 uppercase mt-2">Donasi Bulan Ini</p></CardContent></Card>
        <Card><CardContent className="p-6"><h4 className="text-3xl font-bold">Rp {formatRp(totalKeluarBulanIni)}</h4><p className="text-xs text-slate-500 uppercase mt-2">Pengeluaran Bulan Ini</p></CardContent></Card>
      </div>

      {/* Chart & Tabel Transaksi Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <Card className="lg:col-span-2">
           <div className="p-6 border-b"><h3 className="font-bold">Tren Arus Kas (6 Bulan)</h3></div>
           <CardContent className="p-6">
              {/* Dummy Chart statis (agar tidak hydration error) */}
              <div className="h-64 flex items-end justify-between px-2 relative">
                {['Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt'].map((m, i) => (
                  <div key={m} className="flex flex-col items-center justify-end h-full w-12">
                    <div className={`w-10 rounded-sm ${i === 3 ? 'bg-[#1E4B3E]' : i === 5 ? 'bg-[#A7F3D0]' : 'bg-[#D3E4FD]'}`} style={{ height: `${[35, 55, 25, 75, 45, 65][i]}%` }}></div>
                    <span className="text-[11px] text-slate-500 mt-3">{m}</span>
                  </div>
                ))}
              </div>
           </CardContent>
        </Card>

        <Card>
          <div className="p-5 border-b flex justify-between items-center"><h3 className="font-bold">Transaksi Terakhir</h3></div>
          <CardContent className="p-0">
            {currentMonthData.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${item.type === 'Pemasukan' ? 'bg-[#E8F3F0] text-[#0F4C3A]' : 'bg-rose-50 text-rose-500'}`}>
                    {item.type === 'Pemasukan' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div><p className="text-sm font-semibold">{item.desc}</p><p className="text-xs text-slate-500">{item.date}</p></div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${item.type === 'Pemasukan' ? 'text-[#0F4C3A]' : 'text-rose-600'}`}>{item.type === 'Pemasukan' ? '+' : '-'} {formatRp(item.amount)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}