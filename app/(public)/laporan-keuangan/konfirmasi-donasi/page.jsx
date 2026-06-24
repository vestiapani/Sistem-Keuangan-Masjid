"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  CheckCircle2,
  MessageCircle,
  HandHeart,
  User,
  Mail,
  Calendar,
  Target,
  ArrowRight,
  Loader2,
  X,
  QrCode,
  Landmark,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  submitDonasiPublik,
  getProgramDonasi,
  getRekeningMasjid,
} from "@/lib/publik";
import { uploadBuktiTransfer } from "@/lib/storage";

const EMPTY_FORM = {
  nama: "",
  kontak: "",
  tanggal: "",
  jumlah: "",
  rekening_id: "",
  program_id: "",
  catatan: "",
};

// Komponen untuk copy nomor rekening — standalone, bukan nested di button
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(e) => e.key === "Enter" && handleCopy(e)}
      className="p-1 text-slate-400 hover:text-[#0F4C3A] rounded transition-colors cursor-pointer inline-flex items-center"
      title="Salin nomor rekening"
    >
      {copied ? (
        <Check size={14} className="text-emerald-600" />
      ) : (
        <Copy size={14} />
      )}
    </span>
  );
}

export default function KonfirmasiDonasiPage() {
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [rekenings, setRekenings] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingRekenings, setLoadingRekenings] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [qrisZoom, setQrisZoom] = useState(null);

  const selectedRekening = rekenings.find(
    (r) => String(r.id) === String(form.rekening_id),
  );

  useEffect(() => {
    getProgramDonasi()
      .then((data) => setPrograms(data))
      .catch(() => setPrograms([]))
      .finally(() => setLoadingPrograms(false));

    getRekeningMasjid()
      .then((data) => setRekenings(data))
      .catch(() => setRekenings([]))
      .finally(() => setLoadingRekenings(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(selected.type)) {
      toast.error("Format file harus JPG, PNG, atau PDF.");
      return;
    }
    setFile(selected);
  };

  const handleSelectRekening = (id) => {
    setForm((prev) => ({ ...prev, rekening_id: String(id) }));
  };

  const handleSubmit = async () => {
    if (!form.jumlah || parseInt(form.jumlah) <= 0) {
      toast.error("Harap isi nominal donasi dengan benar.");
      return;
    }
    if (!file) {
      toast.error("Harap upload bukti transfer terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const programTerpilih = programs.find(
        (p) => String(p.id) === String(form.program_id),
      );

      const keteranganParts = [
        selectedRekening
          ? selectedRekening.tipe === "bank"
            ? `Via: ${selectedRekening.bank} ${selectedRekening.nomor}`
            : `Via: ${selectedRekening.label} (QRIS)`
          : null,
        programTerpilih ? `Program: ${programTerpilih.nama}` : null,
        form.catatan || null,
      ].filter(Boolean);

      const payload = {
        nama_donatur: form.nama || "Hamba Allah",
        tanggal_donasi: form.tanggal || new Date().toISOString().split("T")[0],
        jumlah_dana: parseInt(form.jumlah),
        kategori: "Infak",
        metode_pembayaran:
          selectedRekening?.tipe === "qris" ? "QRIS" : "Transfer",
        keterangan:
          keteranganParts.length > 0 ? keteranganParts.join(" | ") : null,
      };

      const donasi = await submitDonasiPublik(payload);

      setUploading(true);
      const path = await uploadBuktiTransfer(file, donasi.id);
      const supabase = createClient();
      await supabase
        .from("donasis")
        .update({ bukti_transfer_url: path })
        .eq("id", donasi.id);
      setUploading(false);

      setStep("sukses");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim konfirmasi. Silakan coba lagi.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setForm(EMPTY_FORM);
    setFile(null);
  };

  if (step === "sukses") {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-[#0F4C3A]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Konfirmasi Diterima
        </h2>
        <p className="text-slate-500">
          Jazakallahu khairan. Donasi Anda sudah kami terima dan sedang menunggu
          verifikasi admin. Setelah diverifikasi (maks. 1x24 jam), donasi akan
          tercatat dalam laporan keuangan masjid.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Status donasi Anda: Menunggu Verifikasi</strong>
          <br />
          Admin akan menghubungi Anda jika diperlukan konfirmasi tambahan.
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-[#0F4C3A] hover:underline"
        >
          Kirim konfirmasi lagi
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Modal zoom QRIS */}
      {qrisZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setQrisZoom(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-xs w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="font-semibold text-sm text-slate-800">
                {qrisZoom.label}
              </p>
              <button
                onClick={() => setQrisZoom(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <img
                src={qrisZoom.url}
                alt="QRIS"
                className="w-full rounded-lg"
              />
            </div>
            <p className="text-xs text-slate-400 text-center pb-4">
              Scan QR code di atas untuk berdonasi
            </p>
          </div>
        </div>
      )}

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

        {/* Info banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex gap-3">
          <HandHeart size={18} className="shrink-0 mt-0.5 text-blue-600" />
          <div>
            <strong>Alur Donasi:</strong> Isi formulir lalu admin verifikasi
            (1x24 jam kerja) kemudian donasi masuk ke laporan keuangan masjid
            yang transparan.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center space-x-4 px-8 py-6 border-b border-slate-100">
                <div className="w-10 h-10 bg-[#0F4C3A] rounded-xl flex items-center justify-center">
                  <HandHeart size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Konfirmasi Donasi
                  </h1>
                  <p className="text-sm text-slate-500">
                    Isi formulir setelah melakukan transfer bank atau scan QRIS.
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
                      <input
                        name="nama"
                        value={form.nama}
                        onChange={handleChange}
                        placeholder="Nama Anda (boleh Hamba Allah)"
                        className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  {/* Kontak */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Email / WhatsApp
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
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
                      <Calendar
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
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
                      Jumlah Donasi <span className="text-rose-500">*</span>
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
                        min="0"
                        className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A]"
                      />
                    </div>
                  </div>

                  {/* Program Donasi */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      Program Donasi
                    </label>
                    <div className="relative">
                      <Target
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
                      {loadingPrograms ? (
                        <div className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-400 bg-slate-50">
                          Memuat program...
                        </div>
                      ) : (
                        <select
                          name="program_id"
                          value={form.program_id}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F4C3A]/30 focus:border-[#0F4C3A] appearance-none bg-white"
                        >
                          <option value="">Donasi Umum (Tidak Spesifik)</option>
                          {programs.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nama}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Pilih Rekening / QRIS ── */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Rekening / Metode Pembayaran{" "}
                    <span className="text-rose-500">*</span>
                  </label>

                  {loadingRekenings ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-16 bg-slate-100 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  ) : rekenings.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                      Rekening masjid belum dikonfigurasi. Hubungi admin.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rekenings.map((r) => {
                        const isSelected =
                          String(form.rekening_id) === String(r.id);
                        return (
                          // Ganti <button> jadi <div> agar tidak ada nested button
                          <div
                            key={r.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectRekening(r.id)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSelectRekening(r.id)
                            }
                            className={`w-full text-left border rounded-xl p-4 transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#0F4C3A] bg-[#0F4C3A]/5 ring-2 ring-[#0F4C3A]/20"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            {r.tipe === "bank" ? (
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-[#0F4C3A]" : "bg-slate-100"}`}
                                >
                                  <Landmark
                                    size={16}
                                    className={
                                      isSelected
                                        ? "text-white"
                                        : "text-slate-500"
                                    }
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-slate-800">
                                      {r.bank}
                                    </p>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                      Transfer Bank
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <p className="text-sm text-slate-600 font-mono">
                                      {r.nomor}
                                    </p>
                                    {/* CopyButton sebagai span, bukan button — aman di dalam div */}
                                    <CopyButton text={r.nomor} />
                                  </div>
                                  <p className="text-xs text-slate-400">
                                    a.n. {r.atas_nama}
                                  </p>
                                </div>
                                {isSelected && (
                                  <CheckCircle2
                                    size={18}
                                    className="text-[#0F4C3A] shrink-0"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-[#0F4C3A]" : "bg-slate-100"}`}
                                >
                                  <QrCode
                                    size={16}
                                    className={
                                      isSelected
                                        ? "text-white"
                                        : "text-slate-500"
                                    }
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-slate-800">
                                      {r.label}
                                    </p>
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                      QRIS
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Scan QR code untuk membayar
                                  </p>
                                </div>
                                {r.qris_image_url && (
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setQrisZoom({
                                        url: r.qris_image_url,
                                        label: r.label,
                                      });
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.stopPropagation();
                                        setQrisZoom({
                                          url: r.qris_image_url,
                                          label: r.label,
                                        });
                                      }
                                    }}
                                    className="text-xs text-[#0F4C3A] hover:underline shrink-0 cursor-pointer"
                                  >
                                    Lihat QR
                                  </span>
                                )}
                                {isSelected && (
                                  <CheckCircle2
                                    size={18}
                                    className="text-[#0F4C3A] shrink-0"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tampilkan QRIS image jika rekening QRIS dipilih */}
                  {selectedRekening?.tipe === "qris" &&
                    selectedRekening.qris_image_url && (
                      <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-3">
                        <p className="text-xs text-slate-500 font-medium">
                          Scan QR Code berikut untuk berdonasi:
                        </p>
                        <img
                          src={selectedRekening.qris_image_url}
                          alt="QRIS"
                          className="w-48 h-48 object-contain border border-slate-200 rounded-lg bg-white p-2 cursor-zoom-in"
                          onClick={() =>
                            setQrisZoom({
                              url: selectedRekening.qris_image_url,
                              label: selectedRekening.label,
                            })
                          }
                        />
                        <p className="text-xs text-slate-400">
                          Klik gambar untuk perbesar
                        </p>
                      </div>
                    )}
                </div>

                {/* Upload Bukti */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Bukti Transfer / Screenshot Pembayaran{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  {!file ? (
                    <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0F4C3A]/40 hover:bg-slate-50 transition-colors">
                      <Upload size={24} className="text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">
                        Upload foto atau screenshot bukti transfer
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        PNG, JPG, PDF - maks. 5MB
                      </p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-emerald-50">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {(file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Catatan */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Catatan (Opsional)
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
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || uploading}
                    className="flex items-center space-x-2 bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-70"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Mengupload bukti...</span>
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Konfirmasi</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-800 mb-5">
                Langkah Konfirmasi
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Lakukan Transfer / Scan QRIS",
                    desc: "Transfer ke rekening atau scan QRIS masjid.",
                    active: true,
                  },
                  {
                    step: 2,
                    title: "Isi Formulir",
                    desc: "Lengkapi data dan upload bukti pembayaran.",
                  },
                  {
                    step: 3,
                    title: "Verifikasi Admin",
                    desc: "Admin cek bukti dan verifikasi (maks. 1x24 jam kerja).",
                  },
                  {
                    step: 4,
                    title: "Masuk Laporan",
                    desc: "Donasi tercatat di laporan keuangan publik masjid.",
                  },
                ].map(({ step, title, desc, active }) => (
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
                      <p className="text-sm font-semibold text-slate-800">
                        {title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                <MessageCircle size={14} className="text-[#0F4C3A]" />
                <span>Chat WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
