"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
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

export default function VerifikasiPage() {
  const [donasis, setDonasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleVerifikasi = async (id, status) => {
    const label = status === "verified" ? "verifikasi" : "tolak";
    if (!confirm(`Yakin ingin ${label} donasi ini?`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("donasis")
      .update({
        status_verifikasi: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Gagal memperbarui status.");
    } else {
      toast.success(
        status === "verified"
          ? "Donasi berhasil diverifikasi!"
          : "Donasi ditolak.",
      );
      loadData();
    }
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

        {/* Filter Status */}
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

      {/* Summary pending count */}
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
  );
}
