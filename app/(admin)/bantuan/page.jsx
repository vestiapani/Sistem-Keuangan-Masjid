import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function BantuanPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h3 className="text-2xl font-bold text-slate-900">Pusat Bantuan</h3>
      <p className="text-slate-500">Panduan penggunaan Sistem Informasi Keuangan Masjid.</p>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h4 className="font-bold text-[#0F4C3A] mb-2">1. Cara Mencatat Donasi</h4>
            <p className="text-sm text-slate-600">Pilih menu "Donasi Masuk" di sidebar kiri, klik tombol hijau "Tambah Donasi", lalu isi formulir nominal dan nama donatur. Terakhir klik Simpan.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h4 className="font-bold text-[#0F4C3A] mb-2">2. Cara Mencetak Laporan Transparansi</h4>
            <p className="text-sm text-slate-600">Masuk ke menu "Laporan Keuangan", pilih periode bulan yang diinginkan di pojok kanan atas, lalu klik tombol "Cetak Poster Transparansi".</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}