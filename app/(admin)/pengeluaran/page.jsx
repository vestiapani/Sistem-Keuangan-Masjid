"use client";

import React, { useState } from "react";
import { Upload, Save, FileImage, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { addPengeluaran } from "@/lib/pengeluaran";

export default function PengeluaranPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    tanggal: "",
    kategori: "",
    keperluan: "",
    nominal: "",
  });

  const isFormValid =
    formData.tanggal &&
    formData.kategori &&
    formData.keperluan &&
    formData.nominal;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSimpan = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      await addPengeluaran({
        tanggal_pengeluaran: formData.tanggal,
        jumlah_pengeluaran: parseInt(formData.nominal),
        kategori: formData.kategori,
        keperluan: formData.keperluan,
      });

      toast.success("Pengeluaran berhasil dicatat!");

      setFormData({ tanggal: "", kategori: "", keperluan: "", nominal: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan pengeluaran. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">
          Input Pengeluaran Kas
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Catat rincian pengeluaran dana operasional atau kegiatan masjid.
        </p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tanggal */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Tanggal Transaksi
              </label>
              <Input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="bg-slate-50"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Kategori Pengeluaran
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]"
              >
                <option value="">Pilih Kategori...</option>
                <option value="operasional">Operasional (Listrik, Air)</option>
                <option value="pemeliharaan">Pemeliharaan & Perbaikan</option>
                <option value="kegiatan">Kegiatan & Acara</option>
                <option value="insentif">Insentif Pengurus/Khatib</option>
              </select>
            </div>
          </div>

          {/* Keperluan */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Kebutuhan / Keperluan
            </label>
            <textarea
              name="keperluan"
              value={formData.keperluan}
              onChange={handleChange}
              rows="3"
              className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A] resize-none"
              placeholder="Contoh: Pembayaran tagihan listrik bulan Agustus..."
            />
          </div>

          {/* Nominal */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Jumlah Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">
                Rp
              </span>
              <Input
                type="number"
                name="nominal"
                value={formData.nominal}
                onChange={handleChange}
                placeholder="0"
                className="pl-10 bg-slate-50"
              />
            </div>
          </div>

          {/* Upload Bukti */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Upload Bukti Nota / Kwitansi
            </label>
            {!file ? (
              <div
                onClick={() => setFile("nota_pembayaran.jpg")}
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Upload size={28} className="text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700">
                  Klik untuk mensimulasikan upload file
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format: JPG, PNG, PDF (Max. 5MB)
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded">
                    <FileImage size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {file}
                    </p>
                    <p className="text-xs text-slate-500">245 KB • Selesai</p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              className="text-slate-700 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              onClick={handleSimpan}
              disabled={isSubmitting || !isFormValid}
              className="bg-[#0F4C3A] hover:bg-[#0A3629] text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" /> Simpan Pengeluaran
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
