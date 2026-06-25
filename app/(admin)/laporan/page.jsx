"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Edit, Trash2, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getDonasis, deleteDonasi, updateDonasi } from "@/lib/donasi";
import {
  getPengeluarans,
  deletePengeluaran,
  updatePengeluaran,
} from "@/lib/pengeluaran";
import {
  periodeToDateRange,
  generatePeriodeOptions,
  simpanLaporan,
} from "@/lib/dashboard";
import { generateLaporanPDF } from "@/lib/laporan-pdf";

export default function LaporanPage() {
  const periodeOptions = generatePeriodeOptions(24);
  const [periode, setPeriode] = useState(periodeOptions[0]);
  const [filter, setFilter] = useState("Semua");
  const [donasis, setDonasis] = useState([]);
  const [pengeluarans, setPengeluarans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  // State untuk modal edit
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editNominal, setEditNominal] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka);

  const loadData = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([getDonasis(), getPengeluarans()]);
      setDonasis(d);
      setPengeluarans(p);
    } catch (err) {
      toast.error("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { startDate, endDate } = periodeToDateRange(periode);

  const donasisPeriode = donasis.filter(
    (d) => d.tanggal_donasi >= startDate && d.tanggal_donasi <= endDate,
  );
  const pengeluaransPeriode = pengeluarans.filter(
    (p) =>
      p.tanggal_pengeluaran >= startDate && p.tanggal_pengeluaran <= endDate,
  );

  const totalMasuk = donasisPeriode.reduce((a, b) => a + b.jumlah_dana, 0);
  const totalKeluar = pengeluaransPeriode.reduce(
    (a, b) => a + b.jumlah_pengeluaran,
    0,
  );
  const surplus = totalMasuk - totalKeluar;

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
    if (!confirm("Yakin hapus transaksi ini?")) return;
    try {
      if (row.tipe === "donasi") await deleteDonasi(row.id);
      else await deletePengeluaran(row.id);
      toast.success("Transaksi berhasil dihapus.");
      loadData();
    } catch {
      toast.error("Gagal menghapus.");
    }
  };

  // Buka modal edit
  const handleOpenEdit = (row) => {
    setEditRow(row);
    const current = row.tipe === "donasi" ? row.pemasukan : row.pengeluaran;
    setEditNominal(String(current));
    let s;
    setEditOpen(true);
  };

  // Simpan edit
  const handleSaveEdit = async () => {
    const nilai = parseInt(editNominal);
    if (!editNominal || isNaN(nilai) || nilai <= 0) {
      toast.error("Masukkan nominal yang valid.");
      return;
    }
    setEditSaving(true);
    try {
      if (editRow.tipe === "donasi") await updateDonasi(editRow.id, nilai);
      else await updatePengeluaran(editRow.id, nilai);
      toast.success("Data berhasil diperbarui.");
      setEditOpen(false);
      setEditRow(null);
      loadData();
    } catch {
      toast.error("Gagal memperbarui.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleSimpanLaporan = async () => {
    try {
      await simpanLaporan({ periode, totalMasuk, totalKeluar, saldo: surplus });
      toast.success("Laporan berhasil disimpan.");
    } catch (err) {
      console.error("Simpan laporan error:", err);
      toast.error("Gagal menyimpan laporan.");
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      // Map data row admin agar sesuai dengan struktur fungsi generator PDF publik
      const transaksiFormatted = allRows.map((row) => ({
        tanggal: row.tanggal,
        kategori: row.tipe === "donasi" ? "Pemasukan" : "Pengeluaran",
        keterangan: row.deskripsi,
        jumlah: row.tipe === "donasi" ? row.pemasukan : row.pengeluaran,
        tipe: row.tipe === "donasi" ? "masuk" : "keluar",
      }));

      await generateLaporanPDF({
        totalMasuk,
        totalKeluar,
        saldo: surplus,
        transaksi: transaksiFormatted,
      });

      toast.success("Laporan PDF berhasil diunduh.");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("Gagal mengunduh PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <h3 className="text-2xl font-bold text-slate-900">
          Laporan & Transparansi
        </h3>

        <div className="flex gap-3">
          <Button onClick={handleSimpanLaporan} variant="outline">
            Simpan Laporan
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={pdfLoading || loading}
            className="bg-[#0F4C3A] hover:bg-[#0A3629] text-white flex items-center justify-center space-x-2 py-2.5 rounded-md font-medium text-sm transition-colors"
          >
            <Download size={15} className="text-white-600" />
            {pdfLoading ? "Menyiapkan..." : "Export PDF"}
          </Button>

          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/20"
          >
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
                        onClick={() => handleOpenEdit(row)}
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

      {/* Modal Edit Nominal */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditOpen(false);
            setEditRow(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit Nominal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editRow && (
              <div className="bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Transaksi</p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {editRow.deskripsi}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editRow.tanggal} ·{" "}
                  {editRow.tipe === "donasi" ? "Pemasukan" : "Pengeluaran"}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Nominal Baru (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 text-sm font-medium">
                  Rp
                </span>
                <Input
                  type="number"
                  value={editNominal}
                  onChange={(e) => setEditNominal(e.target.value)}
                  placeholder="0"
                  className="pl-10"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={editSaving}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editSaving}
              className="bg-[#0F4C3A] text-white"
            >
              {editSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
