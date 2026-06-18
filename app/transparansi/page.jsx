import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function TransparansiPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Public */}
      <header className="bg-emerald-800 text-white py-6 shadow-md">
        <div className="max-w-5xl mx-auto px-6 flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-emerald-800 font-bold text-xl">
            M
          </div>
          <div>
            <h1 className="text-2xl font-bold">Masjid Al-Ikhlas</h1>
            <p className="text-emerald-100 text-sm">Transparansi Keuangan Terbuka Untuk Jamaah</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Laporan Keuangan Terkini</h2>
          <p className="text-slate-500 mt-2">Periode Bulan Ini</p>
        </div>

        {/* Ringkasan Saldo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-t-4 border-t-blue-500 shadow-sm">
            <CardContent className="p-6 text-center">
              <Building2 size={32} className="text-blue-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-500 mb-1">Saldo Kas Saat Ini</p>
              <h4 className="text-3xl font-bold text-slate-800">Rp 45.250.000</h4>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-emerald-500 shadow-sm">
            <CardContent className="p-6 text-center">
              <ArrowDownRight size={32} className="text-emerald-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-500 mb-1">Total Pemasukan</p>
              <h4 className="text-3xl font-bold text-emerald-600">Rp 12.500.000</h4>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-rose-500 shadow-sm">
            <CardContent className="p-6 text-center">
              <ArrowUpRight size={32} className="text-rose-500 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-500 mb-1">Total Pengeluaran</p>
              <h4 className="text-3xl font-bold text-rose-600">Rp 4.200.000</h4>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}