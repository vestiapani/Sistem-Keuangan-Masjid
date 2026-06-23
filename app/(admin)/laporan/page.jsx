"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { getDonasis, deleteDonasi, updateDonasi } from "@/lib/donasi";
import {
  getPengeluarans,
  deletePengeluaran,
  updatePengeluaran,
} from "@/lib/pengeluaran";
import { periodeToDateRange, generatePeriodeOptions,simpanLaporan } from "@/lib/dashboard";
import ExportPdfButton from "@/components/laporan/ExportPdfButton";
import { Button } from "@/components/ui/button";

export default function LaporanPage() {
  const periodeOptions = generatePeriodeOptions(24);
  const [periode, setPeriode] = useState(periodeOptions[0]);
  const [filter, setFilter] = useState("Semua");
  const [donasis, setDonasis] = useState([]);
  const [pengeluarans, setPengeluarans] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka);

  // Load data dari Supabase
  const loadData = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([getDonasis(), getPengeluarans()]);
      setDonasis(d);
      setPengeluarans(p);
      console.log(pengeluarans);
    } catch (err) {
      toast.error("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter berdasarkan periode
  
  const { startDate, endDate } = periodeToDateRange(periode);
  

  const donasisPeriode = donasis.filter(
    (d) => d.tanggal_donasi >= startDate && d.tanggal_donasi <= endDate,
  );
  const pengeluaransPeriode = pengeluarans.filter(
    (p) =>
      p.tanggal_pengeluaran >= startDate && p.tanggal_pengeluaran <= endDate,
  );

  // Kalkulasi
  const totalMasuk = donasisPeriode.reduce((a, b) => a + b.jumlah_dana, 0);
  const totalKeluar = pengeluaransPeriode.reduce(
    (a, b) => a + b.jumlah_pengeluaran,
    0,
  );
  const surplus = totalMasuk - totalKeluar;

  // Gabungkan untuk tabel
  const allRows = useMemo(() => {
    const rows = [
      ...donasisPeriode.map((d) => ({
        id: d.id,
        tipe: "donasi",
        tanggal: d.tanggal_donasi,
        deskripsi: d.nama_donatur + (d.keterangan ? ` — ${d.keterangan}` : ""),
        pemasukan: d.jumlah_dana,
        pengeluaran: null,
      })),
      ...pengeluaransPeriode.map((p) => ({
        id: p.id,
        tipe: "pengeluaran",
        tanggal: p.tanggal_pengeluaran,
        deskripsi: p.keperluan,
        pemasukan: null,
        pengeluaran: p.jumlah_pengeluaran,
      })),
    ].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (filter === "Pemasukan") return rows.filter((r) => r.tipe === "donasi");
    if (filter === "Pengeluaran")
      return rows.filter((r) => r.tipe === "pengeluaran");
    return rows;
  }, [donasisPeriode, pengeluaransPeriode, filter]);

  // Hapus
  const handleHapus = async (row) => {
    if (!confirm(`Yakin hapus transaksi ini?`)) return;
    try {
      if (row.tipe === "donasi") await deleteDonasi(row.id);
      else await deletePengeluaran(row.id);
      toast.success("Transaksi berhasil dihapus.");
      loadData();
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  // Edit
  const handleEdit = async (row) => {
    const current = row.tipe === "donasi" ? row.pemasukan : row.pengeluaran;
    const input = prompt(
      `Edit nominal (saat ini: Rp ${formatRp(current)}):`,
      current,
    );
    if (!input || isNaN(input)) return;

    try {
      if (row.tipe === "donasi") await updateDonasi(row.id, parseInt(input));
      else await updatePengeluaran(row.id, parseInt(input));
      toast.success("Data berhasil diperbarui.");
      loadData();
    } catch {
      toast.error("Gagal memperbarui.");
    }
  };

  const handleSimpanLaporan = async () => {
    try {
      await simpanLaporan({ periode, totalMasuk, totalKeluar, saldo: surplus });
      toast.success("Laporan berhasil disimpan.");
    } catch {
      toast.error("Gagal menyimpan laporan.");
    }
  };

  

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <h3 className="text-2xl font-bold text-slate-900">
          Laporan & Transparansi
        </h3>

        <div className="flex gap-3 ">
          <Button onClick={handleSimpanLaporan} variant="outline">
            Simpan Laporan
          </Button>

          <ExportPdfButton
            periode={periode}
            totalMasuk={totalMasuk}
            totalKeluar={totalKeluar}
            surplus={surplus}
            rows={allRows}
          />

          <select value={periode} onChange={(e) => setPeriode(e.target.value)}>
            {periodeOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h4 className="text-3xl font-bold text-slate-900">
              Rp {formatRp(totalMasuk)}
            </h4>
            <p className="text-xs text-slate-500 uppercase mt-2">
              Total Pemasukan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h4 className="text-3xl font-bold text-slate-900">
              Rp {formatRp(totalKeluar)}
            </h4>
            <p className="text-xs text-slate-500 uppercase mt-2">
              Total Pengeluaran
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#0F4C3A] border-2 bg-[#F8FAFC]">
          <CardContent className="p-6">
            <h4 className="text-3xl font-bold text-[#0F4C3A]">
              Rp {formatRp(surplus)}
            </h4>
            <p className="text-xs font-bold text-[#0F4C3A] uppercase mt-2">
              Surplus / Defisit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel */}
      <Card className="shadow-sm border-slate-200">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="font-bold">Rincian Transaksi</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 border rounded px-3 py-1.5 text-xs"
          >
            <option value="Semua">Semua</option>
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Memuat data...
          </div>
        ) : (
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
              {allRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-slate-400 py-8"
                  >
                    Tidak ada data untuk periode ini.
                  </TableCell>
                </TableRow>
              ) : (
                allRows.map((row) => (
                  <TableRow key={`${row.tipe}-${row.id}`}>
                    <TableCell>{row.tanggal}</TableCell>
                    <TableCell>{row.deskripsi}</TableCell>
                    <TableCell className="text-right font-bold text-[#0F4C3A]">
                      {row.pemasukan ? formatRp(row.pemasukan) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600">
                      {row.pengeluaran ? formatRp(row.pengeluaran) : "-"}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleHapus(row)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
