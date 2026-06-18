"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Printer,
  Wallet,
  Landmark,
  User,
  FileText,
  CreditCard,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { addDonasi } from "@/lib/donasi";

export default function InputDonasiPage() {
  const [kategoriTerpilih, setKategoriTerpilih] = useState("Infak");
  const [metodeTerpilih, setMetodeTerpilih] = useState("Tunai");
  const [namaDonatur, setNamaDonatur] = useState("");
  const [noKontak, setNoKontak] = useState("");
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daftarKategori = ["Zakat", "Infak", "Sedekah", "Wakaf"];

  const handleVerifikasi = () => {
    if (!nominal || nominal <= 0) {
      toast.error("Harap masukkan nominal dana yang valid.");
      return;
    }
    const formatRp = new Intl.NumberFormat("id-ID").format(nominal);
    toast.success(`Angka valid. Nominal tercatat: Rp ${formatRp}`);
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
        kategori: kategoriTerpilih,
        sumber_donasi:
          metodeTerpilih === "Transfer" ? "transfer_manual" : "kotak_amal",
        metode_pembayaran: metodeTerpilih,
        keterangan: keterangan || null,
        status_verifikasi: "verified",
      });

      toast.success("Transaksi donasi berhasil ditambahkan!");

      // Reset form
      setNamaDonatur("");
      setNoKontak("");
      setNominal("");
      setKeterangan("");
      setKategoriTerpilih("Infak");
      setMetodeTerpilih("Tunai");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan donasi. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900">
          Input Donasi Masuk
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Catat penerimaan dana baru ke dalam sistem keuangan masjid.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Stepper */}
        <div className="w-full lg:w-64 shrink-0">
          <Card className="shadow-sm border-slate-200">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Status Pendaftaran
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="relative border-l border-slate-200 ml-3 space-y-8">
                <div className="relative">
                  <div className="absolute -left-[17px] bg-white p-1 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-[#0F4C3A] fill-[#E8F3F0]" />
                  </div>
                  <div className="pl-6">
                    <h4 className="text-sm font-bold text-[#0F4C3A]">
                      Langkah 1
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Input Data
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[13px] bg-white p-1">
                    <Circle className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="pl-6">
                    <h4 className="text-sm font-semibold text-slate-500">
                      Langkah 2
                    </h4>
                    <p className="text-xs text-slate-400">Verifikasi</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[13px] bg-white p-1">
                    <Printer className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="pl-6">
                    <h4 className="text-sm font-semibold text-slate-500">
                      Langkah 3
                    </h4>
                    <p className="text-xs text-slate-400">Simpan & Cetak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Form */}
        <div className="flex-1 w-full">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-0">
              {/* Section 1: Informasi Donatur */}
              <div className="p-8 border-b border-slate-100">
                <div className="flex items-center space-x-2 mb-6">
                  <User size={20} className="text-[#0F4C3A]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Informasi Donatur
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Nama Donatur
                    </label>
                    <Input
                      type="text"
                      placeholder="Hamba Allah / Nama Lengkap"
                      value={namaDonatur}
                      onChange={(e) => setNamaDonatur(e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      No. Kontak (Opsional)
                    </label>
                    <Input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      value={noKontak}
                      onChange={(e) => setNoKontak(e.target.value)}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Detail Donasi */}
              <div className="p-8 border-b border-slate-100">
                <div className="flex items-center space-x-2 mb-6">
                  <FileText size={20} className="text-[#0F4C3A]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Detail Donasi
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Kategori */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Kategori Dana
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {daftarKategori.map((kat) => (
                        <button
                          key={kat}
                          onClick={() => setKategoriTerpilih(kat)}
                          className={`px-5 py-2 text-sm font-medium rounded-md border transition-all ${
                            kategoriTerpilih === kat
                              ? "bg-[#0F4C3A] text-white border-[#0F4C3A] ring-2 ring-[#0F4C3A] ring-offset-1"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {kat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nominal */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Jumlah Dana (Rp)
                    </label>
                    <div className="flex space-x-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">
                          Rp
                        </span>
                        <Input
                          type="number"
                          value={nominal}
                          onChange={(e) => setNominal(e.target.value)}
                          placeholder="0"
                          className="pl-10 bg-slate-50 border-slate-200"
                        />
                      </div>
                      <Button
                        onClick={handleVerifikasi}
                        variant="outline"
                        className="border-slate-200 text-slate-700 bg-white shrink-0 hover:bg-slate-50"
                      >
                        <CheckCircle2
                          size={16}
                          className="mr-2 text-slate-400"
                        />
                        Verifikasi Angka
                      </Button>
                    </div>
                  </div>

                  {/* Keterangan */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Keterangan (Opsional)
                    </label>
                    <textarea
                      rows="3"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      className="flex w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#0F4C3A] resize-none"
                      placeholder="Catatan tambahan..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Metode Pembayaran */}
              <div className="p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard size={20} className="text-[#0F4C3A]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Metode Pembayaran
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tunai */}
                  <div
                    onClick={() => setMetodeTerpilih("Tunai")}
                    className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all ${
                      metodeTerpilih === "Tunai"
                        ? "border-[#0F4C3A] bg-[#E8F3F0]/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Wallet
                        className={
                          metodeTerpilih === "Tunai"
                            ? "text-[#0F4C3A]"
                            : "text-slate-400"
                        }
                        size={24}
                      />
                      <div>
                        <h4
                          className={`text-sm font-bold ${metodeTerpilih === "Tunai" ? "text-slate-900" : "text-slate-700"}`}
                        >
                          Tunai (Cash)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Diterima langsung di masjid
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-[3px] ${metodeTerpilih === "Tunai" ? "border-[#0F4C3A]" : "border-slate-300"}`}
                    />
                  </div>

                  {/* Transfer */}
                  <div
                    onClick={() => setMetodeTerpilih("Transfer")}
                    className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all ${
                      metodeTerpilih === "Transfer"
                        ? "border-[#0F4C3A] bg-[#E8F3F0]/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Landmark
                        className={
                          metodeTerpilih === "Transfer"
                            ? "text-[#0F4C3A]"
                            : "text-slate-400"
                        }
                        size={24}
                      />
                      <div>
                        <h4
                          className={`text-sm font-bold ${metodeTerpilih === "Transfer" ? "text-slate-900" : "text-slate-700"}`}
                        >
                          Transfer Bank
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Masuk ke rekening BSI
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-[3px] ${metodeTerpilih === "Transfer" ? "border-[#0F4C3A]" : "border-slate-300"}`}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 mt-10">
                  <Button
                    variant="ghost"
                    className="text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSimpan}
                    disabled={isSubmitting}
                    className="bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Printer size={16} className="mr-2" />
                        Simpan & Cetak Kwitansi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
