"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Clock, FileImage, X } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { getSignedUrl } from "@/lib/storage";

export default function VerifikasiPage() {
  const [donasis, setDonasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [preview, setPreview] = useState(null);

  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("donasis")
      .select("*")
      .eq("status_verifikasi", filter)
      .order("created_at", { ascending: false });

    if (error) toast.error("Gagal memuat data.");
    else setDonasis(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePreviewBukti = async (donasi) => {
    if (!donasi.bukti_transfer_url) return;
    try {
      const url = await getSignedUrl(
        "bukti-transfer",
        donasi.bukti_transfer_url,
      );
      setPreview({ url, nama: donasi.nama_donatur });
    } catch {
      toast.error("Gagal memuat bukti transfer.");
    }
  };

  const handleVerifikasi = (id, status) => {
    const isVerify = status === "verified";

    toast(
      <div className="bg-white rounded-xl shadow-xl ring-1 ring-slate-200 p-4 space-y-3 w-full">
        <p className="text-sm font-semibold text-slate-800">
          {isVerify ? "Verifikasi donasi ini?" : "Tolak donasi ini?"}
        </p>
        <p className="text-xs text-slate-500">
          {isVerify
            ? "Donasi akan masuk ke laporan keuangan."
            : "Donasi akan ditandai sebagai ditolak."}
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss();
              const supabase = createClient();

              const {
                data: { user },
              } = await supabase.auth.getUser();

              // Ambil data donasi sebelum update (untuk notifikasi)
              const { data: donasiData } = await supabase
                .from("donasis")
                .select("nama_donatur, jumlah_dana, kategori")
                .eq("id", id)
                .single();

              const { error } = await supabase
                .from("donasis")
                .update({
                  status_verifikasi: status,
                  verified_by: user?.id ?? null,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", id);

              if (error) {
                toast.error("Gagal memperbarui status.");
              } else {
                toast.success(
                  isVerify
                    ? "Donasi berhasil diverifikasi!"
                    : "Donasi ditolak.",
                );

                // Insert notifikasi
                try {
                  const formatRpLocal = (n) =>
                    new Intl.NumberFormat("id-ID").format(n);
                  await supabase.from("notifikasis").insert([
                    {
                      tipe: isVerify ? "donasi_diverifikasi" : "donasi_ditolak",
                      judul: isVerify
                        ? "Donasi Terverifikasi"
                        : "Donasi Ditolak",
                      pesan: isVerify
                        ? `Donasi dari ${donasiData?.nama_donatur ?? "Donatur"} sebesar Rp ${formatRpLocal(donasiData?.jumlah_dana ?? 0)} telah diverifikasi`
                        : `Donasi dari ${donasiData?.nama_donatur ?? "Donatur"} ditolak`,
                      is_read: false,
                    },
                  ]);
                } catch (notifErr) {
                  console.warn("Gagal buat notifikasi:", notifErr);
                }

                loadData();
              }
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold text-white ${
              isVerify
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-500 hover:bg-rose-600"
            }`}
          >
            Ya, {isVerify ? "verifikasi" : "tolak"}
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1.5 rounded text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"
          >
            Batal
          </button>
        </div>
      </div>,
      { duration: Infinity, unstyled: true },
    );
  };

  const badgeStatus = {
    pending: "bg-amber-100 text-amber-700",
    verified: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-600",
  };

  const labelStatus = {
    pending: "Menunggu",
    verified: "Terverifikasi",
    rejected: "Ditolak",
  };

  return (
    <>
      {/* Modal Preview Bukti */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-lg w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  Bukti Transfer
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{preview.nama}</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              {preview.url.endsWith(".pdf") ? (
                <iframe
                  src={preview.url}
                  className="w-full h-96 rounded-lg border border-slate-200"
                  title="Bukti Transfer PDF"
                />
              ) : (
                <img
                  src={preview.url}
                  alt="Bukti Transfer"
                  className="w-full rounded-lg object-contain max-h-96"
                />
              )}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0F4C3A] font-semibold hover:underline"
              >
                Buka di tab baru →
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Verifikasi Donasi
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Kelola donasi yang masuk dari website jamaah.
            </p>
          </div>

          <div className="flex space-x-2">
            {["pending", "verified", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 text-xs font-semibold rounded-md border transition-all ${
                  filter === s
                    ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {labelStatus[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Banner pending */}
        {filter === "pending" && !loading && donasis.length > 0 && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <Clock size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700 font-medium">
              Ada <span className="font-bold">{donasis.length} donasi</span>{" "}
              menunggu verifikasi Anda.
            </p>
          </div>
        )}

        {/* Tabel */}
        <Card className="shadow-sm border-slate-200">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-400">
              Memuat data...
            </div>
          ) : donasis.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              Tidak ada donasi dengan status "{labelStatus[filter]}".
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Donatur</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Bukti</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead>Status</TableHead>
                  {filter === "pending" && (
                    <TableHead className="text-center">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {donasis.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-slate-500 text-xs">
                      {d.tanggal_donasi}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {d.nama_donatur}
                        </p>
                        {d.keterangan && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {d.keterangan}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{d.kategori}</TableCell>
                    <TableCell>{d.metode_pembayaran}</TableCell>
                    <TableCell>
                      {d.bukti_transfer_url ? (
                        <button
                          onClick={() => handlePreviewBukti(d)}
                          className="flex items-center space-x-1.5 text-xs text-[#0F4C3A] hover:underline"
                        >
                          <FileImage size={14} />
                          <span>Lihat bukti</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Tidak ada
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-800">
                      Rp {formatRp(d.jumlah_dana)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeStatus[d.status_verifikasi]}`}
                      >
                        {labelStatus[d.status_verifikasi]}
                      </span>
                    </TableCell>
                    {filter === "pending" && (
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleVerifikasi(d.id, "verified")}
                            title="Verifikasi"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => handleVerifikasi(d.id, "rejected")}
                            title="Tolak"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
