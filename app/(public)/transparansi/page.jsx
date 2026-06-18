"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getRingkasanPublik } from "@/lib/publik";

export default function TransparansiPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pemasukan");

  const formatRp = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n ?? 0);

  useEffect(() => {
    getRingkasanPublik()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-3 py-6">
        <h2 className="text-3xl font-bold text-slate-800">
          Laporan Keuangan Terbuka
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Kami berkomitmen untuk menjaga kepercayaan jamaah dengan menampilkan
          seluruh arus kas masjid secara transparan dan real-time.
        </p>
        <Link
          href="/donasi-publik"
          className="inline-block mt-2 bg-[#0F4C3A] hover:bg-[#0A3629] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-colors"
        >
          Donasi Sekarang →
        </Link>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-t-4 border-t-blue-500">
            <CardContent className="p-6 text-center">
              <Building2 size={28} className="text-blue-500 mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Saldo Kas
              </p>
              <h4 className="text-2xl font-bold text-slate-800">
                {formatRp(data?.saldo)}
              </h4>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-emerald-500">
            <CardContent className="p-6 text-center">
              <ArrowDownRight
                size={28}
                className="text-emerald-500 mx-auto mb-3"
              />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Total Pemasukan
              </p>
              <h4 className="text-2xl font-bold text-emerald-600">
                {formatRp(data?.totalMasuk)}
              </h4>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-rose-500">
            <CardContent className="p-6 text-center">
              <ArrowUpRight size={28} className="text-rose-500 mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Total Pengeluaran
              </p>
              <h4 className="text-2xl font-bold text-rose-600">
                {formatRp(data?.totalKeluar)}
              </h4>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rincian Tab */}
      <div className="space-y-4">
        {/* Tab Toggle */}
        <div className="flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setTab("pemasukan")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === "pemasukan"
                ? "border-[#0F4C3A] text-[#0F4C3A]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setTab("pengeluaran")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === "pengeluaran"
                ? "border-[#0F4C3A] text-[#0F4C3A]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Pengeluaran
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : tab === "pemasukan" ? (
          <div className="space-y-2">
            {data?.donasis?.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Belum ada data pemasukan.
              </p>
            ) : (
              data?.donasis?.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-emerald-50 rounded-full">
                      <ArrowDownRight size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {d.nama_donatur}
                      </p>
                      <p className="text-xs text-slate-400">
                        {d.kategori} • {d.tanggal_donasi}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    +{formatRp(d.jumlah_dana)}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {data?.pengeluarans?.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Belum ada data pengeluaran.
              </p>
            ) : (
              data?.pengeluarans?.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-rose-50 rounded-full">
                      <ArrowUpRight size={16} className="text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {p.keperluan}
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.kategori} • {p.tanggal_pengeluaran}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-rose-600">
                    -{formatRp(p.jumlah_pengeluaran)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
