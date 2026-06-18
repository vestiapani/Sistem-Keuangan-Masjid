"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Upload, CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { submitDonasiPublik } from "@/lib/publik";

const REKENING_OPTIONS = [
  { value: "bsi-001", label: "BSI — 7123456789 (a.n. Masjid Al-Ikhlas)" },
  { value: "bni-002", label: "BNI — 0123456789 (a.n. Masjid Al-Ikhlas)" },
];

const PROGRAM_OPTIONS = [
  { value: "pembangunan-menara", label: "Pembangunan Menara" },
  { value: "operasional", label: "Operasional Harian" },
  { value: "sosial", label: "Program Sosial" },
  { value: "umum", label: "Donasi Umum" },
];

export default function KonfirmasiDonasiPage() {
  const [step, setStep] = useState("form"); // form | sukses
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    kontak: "",
    tanggal: "",
    jumlah: "",
    rekening: "",
    program: "",
    catatan: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jumlah || parseInt(form.jumlah) <= 0) {
      toast.error("Harap isi nominal donasi dengan benar.");
      return;
    }

    setLoading(true);
    try {
      await submitDonasiPublik({
        nama_donatur: form.nama || "Hamba Allah",
        tanggal_donasi: form.tanggal || new Date().toISOString().split("T")[0],
        jumlah_dana: parseInt(form.jumlah),
        kategori: "Infak",
        metode_pembayaran: "Transfer",
        keterangan: form.catatan || null,
      });
      setStep("sukses");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim konfirmasi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "sukses") {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-[#0F4C3A]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Konfirmasi Diterima!
        </h2>
        <p className="text-slate-500">
          Jazakallahu khairan. Konfirmasi donasi Anda telah kami terima. Admin
          akan memverifikasi dalam 1×24 jam kerja.
        </p>
        <button
          onClick={() => {
            setStep("form");
            setForm({
              nama: "",
              kontak: "",
              tanggal: "",
              jumlah: "",
              rekening: "",
              program: "",
              catatan: "",
            });
            setFile(null);
          }}
          className="text-sm text-[#0F4C3A] hover:underline"
        >
          Kirim konfirmasi lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6 flex items-center space-x-2">
        <Link href="/" className="hover:text-slate-700">
          Home
        </Link>
        <span>›</span>
        <Link href="/laporan-keuangan" className="hover:text-slate-700">
          Laporan Keuangan
        </Link>
        <span>›</span>
        <span className="text-slate-800 font-medium">Konfirmasi Donasi</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center space-x-4 px-8 py-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-[#0F4C3A] rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🤲</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Konfirmasi Donasi
                </h1>
                <p className="text-sm text-slate-500">
                  Isi formulir di bawah ini setelah Anda melakukan transfer.
                </p>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                      👤
                    </span>
                    <input
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      placeholder="Nama Anda (Boleh Hamba Allah)"
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A]"
                    />
                  </div>
                </div>

                {/* Kontak */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Email / No. WhatsApp
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                      📧
                    </span>
                    <input
                      name="kontak"
                      value={form.kontak}
                      onChange={handleChange}
                      placeholder="0812xxxx / email@contoh.com"
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A]"
                    />
                  </div>
                </div>

                {/* Tanggal */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Tanggal Transfer
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                      📅
                    </span>
                    <input
                      type="date"
                      name="tanggal"
                      value={form.tanggal}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A]"
                    />
                  </div>
                </div>

                {/* Jumlah */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Jumlah Donasi
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      name="jumlah"
                      value={form.jumlah}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A]"
                    />
                  </div>
                </div>

                {/* Rekening */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Rekening Tujuan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                      🏦
                    </span>
                    <select
                      name="rekening"
                      value={form.rekening}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A] appearance-none bg-white"
                    >
                      <option value="">Pilih Rekening Tujuan</option>
                      {REKENING_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Program */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Program Donasi
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                      🎯
                    </span>
                    <select
                      name="program"
                      value={form.program}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A] appearance-none bg-white"
                    >
                      <option value="">Pilih Program Donasi</option>
                      {PROGRAM_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload Bukti */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Bukti Transfer
                </label>
                {!file ? (
                  <div
                    onClick={() => setFile("bukti_transfer.jpg")}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0F4C3A]/40 hover:bg-slate-50 transition-colors"
                  >
                    <Upload size={24} className="text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-600">
                      Upload file atau drag and drop
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, PDF up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-emerald-50">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {file}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs text-slate-400 hover:text-rose-500"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* Catatan */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Catatan / Doa (Opsional)
                </label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tuliskan niat atau doa Anda..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A] resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-70"
                >
                  <span>{loading ? "Mengirim..." : "Kirim Konfirmasi"}</span>
                  {!loading && <span>➤</span>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Langkah Konfirmasi */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-800 mb-5">
              ⓘ Langkah Konfirmasi
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Lakukan Transfer",
                  icon: "🏦",
                  desc: "Transfer ke salah satu rekening resmi masjid yang tertera.",
                  active: true,
                },
                {
                  step: 2,
                  title: "Isi Formulir",
                  icon: "📄",
                  desc: "Lengkapi data diri dan unggah bukti transfer pada form di samping.",
                },
                {
                  step: 3,
                  title: "Verifikasi",
                  icon: "✅",
                  desc: "Admin akan memverifikasi donasi Anda (1×24 jam kerja).",
                },
              ].map(({ step, title, icon, desc, active }) => (
                <div key={step} className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      active
                        ? "bg-[#0F4C3A] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {step}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 flex-1">
                    <p className="text-sm font-semibold text-slate-800 flex items-center space-x-1.5">
                      <span>{icon}</span>
                      <span>{title}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Butuh Bantuan */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle size={16} className="text-amber-600" />
              <h4 className="font-semibold text-slate-800 text-sm">
                Butuh Bantuan?
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Hubungi admin keuangan jika ada kendala saat konfirmasi.
            </p>
            <button className="text-sm text-amber-700 font-semibold hover:underline flex items-center space-x-1">
              <span>💬</span>
              <span>Chat WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
