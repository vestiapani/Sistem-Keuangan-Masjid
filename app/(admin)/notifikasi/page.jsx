"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { getNotifikasiTerbaru } from "@/lib/dashboard";

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka);

  useEffect(() => {
    getNotifikasiTerbaru(10)
      .then((data) =>
        setNotifs(
          data.map((t) => ({
            id: t.id,
            type: t.type,
            title:
              t.type === "Pemasukan"
                ? `${t.cat} Masuk`
                : `Pengeluaran: ${t.cat}`,
            desc: `${t.desc} — Rp ${formatRp(t.amount)}`,
            time: t.date,
          })),
        ),
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <h3 className="text-2xl font-bold text-slate-900">Semua Notifikasi</h3>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Memuat notifikasi...</p>
        ) : notifs.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada transaksi.</p>
        ) : (
          notifs.map((n) => (
            <Card
              key={n.id}
              className="hover:border-[#0F4C3A] transition-colors cursor-pointer"
            >
              <CardContent className="p-5 flex items-start space-x-4">
                <div
                  className={`p-2 rounded-full ${
                    n.type === "Pemasukan"
                      ? "bg-[#E8F3F0] text-[#0F4C3A]"
                      : "bg-rose-50 text-rose-500"
                  }`}
                >
                  {n.type === "Pemasukan" ? (
                    <ArrowDownRight size={20} />
                  ) : (
                    <ArrowUpRight size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{n.title}</h4>
                  <p className="text-sm text-slate-600">{n.desc}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {n.time}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
