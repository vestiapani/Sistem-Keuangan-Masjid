"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getKegiatans,
  addKegiatan,
  updateKegiatan,
  deleteKegiatan,
  formatTanggalKegiatan,
} from "@/lib/kegiatan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const KATEGORI_OPTIONS = ["Kajian", "Sosial", "Edukasi", "Remaja", "Lainnya"];
const STATUS_OPTIONS = ["aktif", "selesai", "dibatalkan"];

const STATUS_BADGE = {
  aktif: "bg-emerald-100 text-emerald-700",
  selesai: "bg-slate-100 text-slate-500",
  dibatalkan: "bg-rose-100 text-rose-600",
};

const EMPTY_FORM = {
  judul: "",
  deskripsi: "",
  kategori: "Kajian",
  tanggal: "",
  waktu: "",
  lokasi: "",
  image_url: "",
  status: "aktif",
  kuota: "",
};

export default function AdminKegiatanPage() {
  const [kegiatans, setKegiatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getKegiatans();
      setKegiatans(data);
    } catch {
      toast.error("Gagal memuat data kegiatan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setOpenDialog(true);
  };

  const handleOpenEdit = (kegiatan) => {
    setEditId(kegiatan.id);
    setForm({
      judul: kegiatan.judul || "",
      deskripsi: kegiatan.deskripsi || "",
      kategori: kegiatan.kategori || "Kajian",
      tanggal: kegiatan.tanggal || "",
      waktu: kegiatan.waktu ? kegiatan.waktu.slice(0, 5) : "",
      lokasi: kegiatan.lokasi || "",
      image_url: kegiatan.image_url || "",
      status: kegiatan.status || "aktif",
      kuota: kegiatan.kuota ?? "",
    });
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSimpan = async () => {
    if (!form.judul || !form.tanggal || !form.kategori) {
      toast.error("Harap isi judul, tanggal, dan kategori.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        waktu: form.waktu || null,
        kuota: form.kuota ? parseInt(form.kuota) : null,
        image_url: form.image_url || null,
      };

      if (editId) {
        await updateKegiatan(editId, payload);
        toast.success("Kegiatan berhasil diperbarui.");
      } else {
        await addKegiatan(payload);
        toast.success("Kegiatan berhasil ditambahkan.");
      }

      setOpenDialog(false);
      loadData();
    } catch (err) {
      toast.error("Gagal menyimpan kegiatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHapus = async (id) => {
    if (!confirm("Yakin hapus kegiatan ini?")) return;
    try {
      await deleteKegiatan(id);
      toast.success("Kegiatan berhasil dihapus.");
      loadData();
    } catch {
      toast.error("Gagal menghapus kegiatan.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Kelola Kegiatan</h3>
          <p className="text-sm text-slate-500 mt-1">
            Tambah dan kelola kegiatan masjid.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-[#0F4C3A] text-white">
          <Plus size={16} className="mr-2" /> Tambah Kegiatan
        </Button>
      </div>

      {/* Tabel */}
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
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Kuota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kegiatans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-slate-400 py-8"
                  >
                    Belum ada kegiatan.
                  </TableCell>
                </TableRow>
              ) : (
                kegiatans.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#0F4C3A]" />
                        {formatTanggalKegiatan(k.tanggal)}
                      </div>
                      {k.waktu && (
                        <p className="text-slate-400 mt-0.5 pl-5">
                          {k.waktu.slice(0, 5)} WIB
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-800 max-w-xs truncate">
                        {k.judul}
                      </p>
                      {k.deskripsi && (
                        <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                          {k.deskripsi}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{k.kategori}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {k.lokasi || "-"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {k.kuota ? `${k.pendaftar}/${k.kuota}` : "Tidak terbatas"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[k.status]}`}
                      >
                        {k.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(k)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleHapus(k.id)}
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

      {/* Dialog Tambah/Edit */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Judul */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Judul Kegiatan *
              </label>
              <Input
                name="judul"
                value={form.judul}
                onChange={handleChange}
                placeholder="Nama kegiatan"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A] resize-none"
                placeholder="Deskripsi singkat kegiatan..."
              />
            </div>

            {/* Kategori + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Kategori *
                </label>
                <select
                  name="kategori"
                  value={form.kategori}
                  onChange={handleChange}
                  className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="flex h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tanggal + Waktu */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Tanggal *
                </label>
                <Input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Waktu (opsional)
                </label>
                <Input
                  type="time"
                  name="waktu"
                  value={form.waktu}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Lokasi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Lokasi
              </label>
              <Input
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                placeholder="Contoh: Ruang Utama Masjid"
              />
            </div>

            {/* Kuota */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Kuota Peserta (kosongkan jika tidak terbatas)
              </label>
              <Input
                type="number"
                name="kuota"
                value={form.kuota}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            {/* URL Gambar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                URL Gambar (opsional)
              </label>
              <Input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSimpan}
              disabled={isSubmitting}
              className="bg-[#0F4C3A] text-white"
            >
              {isSubmitting
                ? "Menyimpan..."
                : editId
                  ? "Simpan Perubahan"
                  : "Tambah Kegiatan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
