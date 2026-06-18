"use client";

import React, { useState, useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Building2, Printer, Download, FileSpreadsheet, Trash2, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useTransactions } from '@/app/context/TransactionContext';

export default function LaporanPage() {
  const [periode, setPeriode] = useState('Oktober 2023');
  const [filter, setFilter] = useState('Semua Kategori');
  
  // Ambil Data Master dari Context
  const { transactions, baseSaldo, deleteTransaction, editTransaction } = useTransactions();

  // Filter bulan
  const currentMonthData = useMemo(() => transactions.filter(t => t.periode === periode), [transactions, periode]);
  // Filter jenis
  const dataFiltered = currentMonthData.filter((item) => filter === 'Semua Kategori' ? true : item.type === filter);

  // Kalkulasi Otomatis Berdasarkan Context
  const totalMasuk = currentMonthData.filter(i => i.type === 'Pemasukan').reduce((a, b) => a + b.amount, 0);
  const totalKeluar = currentMonthData.filter(i => i.type === 'Pengeluaran').reduce((a, b) => a + b.amount, 0);
  const saldoKasBersihBulanIni = totalMasuk - totalKeluar;

  const formatRp = (angka) => new Intl.NumberFormat('id-ID').format(angka);

  const hapusData = (id) => {
    if(confirm("Yakin ingin menghapus transaksi ini? (Total saldo akan disesuaikan otomatis)")){
      deleteTransaction(id);
      toast.success("Transaksi berhasil dihapus");
    }
  };

  const editData = (item) => {
    const newAmount = prompt(`Edit nominal untuk "${item.desc}":`, item.amount);
    if(newAmount && !isNaN(newAmount)){
      editTransaction(item.id, parseInt(newAmount));
      toast.success("Data berhasil diperbarui. Saldo otomatis terhitung ulang.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div><h3 className="text-2xl font-bold text-slate-900">Laporan & Transparansi</h3></div>
        <select value={periode} onChange={(e) => setPeriode(e.target.value)} className="bg-white border border-slate-200 rounded-md px-4 py-2 text-sm">
          <option value="Oktober 2023">Oktober 2023</option>
          <option value="September 2023">September 2023</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="p-6"><h4 className="text-3xl font-bold text-slate-900">Rp {formatRp(totalMasuk)}</h4><p className="text-xs text-slate-500 uppercase mt-2">Total Pemasukan</p></CardContent></Card>
        <Card><CardContent className="p-6"><h4 className="text-3xl font-bold text-slate-900">Rp {formatRp(totalKeluar)}</h4><p className="text-xs text-slate-500 uppercase mt-2">Total Pengeluaran</p></CardContent></Card>
        <Card className="border-[#0F4C3A] border-2 bg-[#F8FAFC]"><CardContent className="p-6"><h4 className="text-3xl font-bold text-[#0F4C3A]">Rp {formatRp(saldoKasBersihBulanIni)}</h4><p className="text-xs font-bold text-[#0F4C3A] uppercase mt-2">Surplus / Defisit (Bulan Ini)</p></CardContent></Card>
      </div>

      {/* Table */}
      <Card className="shadow-sm border-slate-200">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="font-bold">Rincian Transaksi</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-50 border rounded px-3 py-1.5 text-xs">
            <option value="Semua Kategori">Semua Kategori</option>
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Pemasukan</TableHead>
              <TableHead className="text-right">Pengeluaran</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataFiltered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.desc}</TableCell>
                <TableCell className="text-right font-bold text-[#0F4C3A]">{row.type === 'Pemasukan' ? formatRp(row.amount) : '-'}</TableCell>
                <TableCell className="text-right font-bold text-rose-600">{row.type === 'Pengeluaran' ? formatRp(row.amount) : '-'}</TableCell>
                <TableCell className="text-center space-x-2">
                  <button onClick={() => editData(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit size={14}/></button>
                  <button onClick={() => hapusData(row.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={14}/></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}