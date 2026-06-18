"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addDonasi } from "@/lib/donasi";

const KATEGORI = ["Zakat", "Infak", "Sedekah", "Wakaf"];
const METODE = ["Tunai", "Transfer"];

export default function DonasiFormDialog({ open, onOpenChange, onSuccess }) {
  const [namaDonatur, setNamaDonatur] = useState("");
  const [kategori, setKategori] = useState("Infak");
  const [metode, setMetode] = useState("Tunai");
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setNamaDonatur("");
    setKategori("Infak");
    setMetode("Tunai");
    setNominal("");
    setKeterangan("");
  };

  const handleSimpan = async () => {
    if (!nominal || nominal <= 0) {
      toast.error("Harap isi nominal.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDonasi({
        nama_donatur: namaDonatur || "Hamba Allah",
        tanggal_donasi: new Date().toISOString().split("T")[0],
        jumlah_dana: parseInt(nominal),
        kategori,
        sumber_donasi: metode === "Transfer" ? "transfer_manual" : "kotak_amal",
        metode_pembayaran: metode,
        keterangan: keterangan || null,
        status_verifikasi: "verified",
      });
      toast.success("Donasi berhasil ditambahkan!");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan donasi. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Donasi</DialogTitle>
          <DialogDescription>
            Catat penerimaan dana baru ke sistem keuangan masjid.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Nama Donatur
            </label>
            <Input
              value={namaDonatur}
              onChange={(e) => setNamaDonatur(e.target.value)}
              placeholder="Hamba Allah / Nama Lengkap"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {KATEGORI.map((kat) => (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setKategori(kat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                    kategori === kat
                      ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Jumlah Dana (Rp)
            </label>
            <Input
              type="number"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Metode Pembayaran
            </label>
            <div className="flex gap-2">
              {METODE.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetode(m)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
                    metode === m
                      ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Keterangan (Opsional)
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSimpan}
            disabled={isSubmitting}
            className="bg-[#0F4C3A] text-white"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Donasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
