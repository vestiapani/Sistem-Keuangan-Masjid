"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getDonasis,
  addDonasi,
  updateDonasi,
  deleteDonasi,
} from "@/lib/donasi";
import DonasiFormDialog from "@/components/donasi/DonasiFormDialog";

const KATEGORI = ["Zakat", "Infak", "Sedekah", "Wakaf"];
const METODE = ["Tunai", "Transfer"];

export default function DonasiPage() {
  const searchParams = useSearchParams();
  const [donasis, setDonasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  // State edit
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editForm, setEditForm] = useState({
    nama_donatur: "",
    tanggal_donasi: "",
    jumlah_dana: "",
    kategori: "Infak",
    metode_pembayaran: "Tunai",
    keterangan: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  // State hapus
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);

  const loadData = async () => {
    setLoading(true);
    try {
      setDonasis(await getDonasis());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "1") setOpenDialog(true);
  }, [searchParams]);

  // ── Buka edit dialog ──────────────────────────────────────
  const handleOpenEdit = (donasi) => {
    setEditData(donasi);
    setEditForm({
      nama_donatur: donasi.nama_donatur ?? "",
      tanggal_donasi: donasi.tanggal_donasi ?? "",
      jumlah_dana: donasi.jumlah_dana ?? "",
      kategori: donasi.kategori ?? "Infak",
      metode_pembayaran: donasi.metode_pembayaran ?? "Tunai",
      keterangan: donasi.keterangan ?? "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.jumlah_dana || parseInt(editForm.jumlah_dana) <= 0) {
      toast.error("Nominal harus diisi dengan benar.");
      return;
    }
    setEditSaving(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { error } = await supabase
        .from("donasis")
        .update({
          nama_donatur: editForm.nama_donatur || "Hamba Allah",
          tanggal_donasi: editForm.tanggal_donasi,
          jumlah_dana: parseInt(editForm.jumlah_dana),
          kategori: editForm.kategori,
          metode_pembayaran: editForm.metode_pembayaran,
          keterangan: editForm.keterangan || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editData.id);

      if (error) throw error;

      toast.success("Donasi berhasil diperbarui.");
      setEditOpen(false);
      loadData();
    } catch (err) {
      toast.error(err?.message ?? "Gagal memperbarui donasi.");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Hapus donasi ──────────────────────────────────────────
  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteDonasi(deleteId);
      toast.success("Donasi berhasil dihapus.");
      setDeleteOpen(false);
      loadData();
    } catch {
      toast.error("Gagal menghapus donasi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Donasi Masuk</h3>
          <p className="text-sm text-slate-500 mt-1">
            Daftar donasi yang sudah terverifikasi.
          </p>
        </div>
        <Button
          onClick={() => setOpenDialog(true)}
          className="bg-[#0F4C3A] text-white"
        >
          <Plus size={16} className="mr-2" /> Tambah Donasi
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Memuat data...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Donatur</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donasis.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-slate-400 py-8"
                  >
                    Belum ada donasi.
                  </TableCell>
                </TableRow>
              ) : (
                donasis.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                      {d.tanggal_donasi}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-800">
                        {d.nama_donatur}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        {d.kategori}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {d.metode_pembayaran ?? "-"}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs max-w-[160px] truncate">
                      {d.keterangan ?? "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#0F4C3A]">
                      Rp {formatRp(d.jumlah_dana)}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        title="Edit donasi"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(d.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus donasi"
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

      {/* Dialog Tambah Donasi */}
      <DonasiFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSuccess={loadData}
      />

      {/* Dialog Edit Donasi */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Donasi</DialogTitle>
            <DialogDescription>
              Ubah data donasi yang sudah tercatat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nama Donatur */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nama Donatur
              </label>
              <Input
                value={editForm.nama_donatur}
                onChange={(e) =>
                  setEditForm({ ...editForm, nama_donatur: e.target.value })
                }
                placeholder="Hamba Allah / Nama Lengkap"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Tanggal Donasi
              </label>
              <Input
                type="date"
                value={editForm.tanggal_donasi}
                onChange={(e) =>
                  setEditForm({ ...editForm, tanggal_donasi: e.target.value })
                }
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {KATEGORI.map((kat) => (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, kategori: kat })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                      editForm.kategori === kat
                        ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {kat}
                  </button>
                ))}
              </div>
            </div>

            {/* Jumlah */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Jumlah Dana (Rp)
              </label>
              <Input
                type="number"
                value={editForm.jumlah_dana}
                onChange={(e) =>
                  setEditForm({ ...editForm, jumlah_dana: e.target.value })
                }
                placeholder="0"
              />
            </div>

            {/* Metode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Metode Pembayaran
              </label>
              <div className="flex gap-2">
                {METODE.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, metode_pembayaran: m })
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                      editForm.metode_pembayaran === m
                        ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Keterangan (Opsional)
              </label>
              <textarea
                rows={2}
                value={editForm.keterangan}
                onChange={(e) =>
                  setEditForm({ ...editForm, keterangan: e.target.value })
                }
                className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A] resize-none"
                placeholder="Catatan tambahan..."
              />
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
              {editSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Hapus Donasi</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Donasi akan dihapus secara
              permanen dari sistem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
