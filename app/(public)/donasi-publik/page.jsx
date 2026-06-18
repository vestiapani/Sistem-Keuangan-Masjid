"use client";

import React, { useState } from "react";
import { CheckCircle2, Wallet, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { submitDonasiPublik } from "@/lib/publik";

const daftarKategori = ["Zakat", "Infak", "Sedekah", "Wakaf"];

export default function DonasiPublikPage() {
  const [step, setStep] = useState("form"); // form | sukses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nama: "",
    noKontak: "",
    nominal: "",
    kategori: "Infak",
    metode: "Tunai",
    keterangan: "",
  });

  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nominal || parseInt(form.nominal) <= 0) {
      setError("Nominal donasi harus diisi dan lebih dari 0.");
      return;
    }

    setLoading(true);
    try {
      await submitDonasiPublik({
        nama_donatur: form.nama || "Hamba Allah",
        tanggal_donasi: new Date().toISOString().split("T")[0],
        jumlah_dana: parseInt(form.nominal),
        kategori: form.kategori,
        metode_pembayaran: form.metode,
        keterangan: form.keterangan || null,
      });
      setStep("sukses");
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim donasi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Halaman sukses
  if (step === "sukses") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-16">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-[#0F4C3A]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Jazakallahu Khairan!
          </h2>
          <p className="text-slate-500 mt-2">
            Donasi sebesar{" "}
            <span className="font-semibold text-slate-700">
              Rp {formatRp(form.nominal)}
            </span>{" "}
            telah kami terima dan sedang menunggu verifikasi dari pengurus
            masjid.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          Donasi Anda akan muncul di halaman transparansi setelah diverifikasi
          oleh admin.
        </div>
        <button
          onClick={() => {
            setStep("form");
            setForm({
              nama: "",
              noKontak: "",
              nominal: "",
              kategori: "Infak",
              metode: "Tunai",
              keterangan: "",
            });
          }}
          className="text-sm text-[#0F4C3A] hover:underline"
        >
          Kirim donasi lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">
          Form Donasi Online
        </h2>
        <p className="text-slate-500 text-sm">
          Donasi Anda akan diverifikasi oleh pengurus sebelum ditampilkan.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informasi Donatur */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Informasi Donatur
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600">
                    Nama (Opsional)
                  </label>
                  <Input
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    placeholder="Hamba Allah"
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600">
                    No. WhatsApp (Opsional)
                  </label>
                  <Input
                    name="noKontak"
                    value={form.noKontak}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Detail Donasi */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Detail Donasi
              </h3>

              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  {daftarKategori.map((kat) => (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => setForm({ ...form, kategori: kat })}
                      className={`px-4 py-2 text-sm font-medium rounded-md border transition-all ${
                        form.kategori === kat
                          ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nominal */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">
                  Jumlah Donasi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">
                    Rp
                  </span>
                  <Input
                    type="number"
                    name="nominal"
                    value={form.nominal}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="pl-10 bg-slate-50"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">
                  Keterangan (Opsional)
                </label>
                <textarea
                  name="keterangan"
                  value={form.keterangan}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Contoh: Untuk pembangunan masjid, dll."
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#0F4C3A] resize-none"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Metode Pembayaran */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Metode Pembayaran
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setForm({ ...form, metode: "Tunai" })}
                  className={`border-2 rounded-lg p-3 flex items-center space-x-3 cursor-pointer transition-all ${
                    form.metode === "Tunai"
                      ? "border-[#0F4C3A] bg-[#E8F3F0]/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Wallet
                    size={20}
                    className={
                      form.metode === "Tunai"
                        ? "text-[#0F4C3A]"
                        : "text-slate-400"
                    }
                  />
                  <div>
                    <p className="text-sm font-semibold">Tunai</p>
                    <p className="text-xs text-slate-500">Di masjid langsung</p>
                  </div>
                </div>
                <div
                  onClick={() => setForm({ ...form, metode: "Transfer" })}
                  className={`border-2 rounded-lg p-3 flex items-center space-x-3 cursor-pointer transition-all ${
                    form.metode === "Transfer"
                      ? "border-[#0F4C3A] bg-[#E8F3F0]/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Landmark
                    size={20}
                    className={
                      form.metode === "Transfer"
                        ? "text-[#0F4C3A]"
                        : "text-slate-400"
                    }
                  />
                  <div>
                    <p className="text-sm font-semibold">Transfer</p>
                    <p className="text-xs text-slate-500">Rekening BSI</p>
                  </div>
                </div>
              </div>

              {/* Info rekening jika transfer */}
              {form.metode === "Transfer" && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-slate-700">
                    Rekening Tujuan
                  </p>
                  <p className="text-slate-600">
                    Bank BSI —{" "}
                    <span className="font-mono font-semibold">7123456789</span>
                  </p>
                  <p className="text-slate-500">a.n. Masjid Al-Ikhlas</p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F4C3A] hover:bg-[#0A3629] text-white py-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2" /> Mengirim...
                </>
              ) : (
                "Kirim Donasi"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
