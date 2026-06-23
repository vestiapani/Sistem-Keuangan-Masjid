"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Minus,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  getDashboardData,
  getMonthlyCashflow,
  getNotifikasiTerbaru,
  generatePeriodeOptions,
} from "@/lib/dashboard";

export default function DashboardPage() {
  const periodeOptions = generatePeriodeOptions(24);
  const [periode, setPeriode] = useState(periodeOptions[0]);
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n ?? 0);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDashboardData(periode);
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, [periode]);

  const loadChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const result = await getMonthlyCashflow();
      setChartData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const loadNotifs = useCallback(async () => {
    try {
      const result = await getNotifikasiTerbaru(5);
      setNotifs(result);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadChart();
    loadNotifs();
  }, [loadChart, loadNotifs]);

  // Realtime: subscribe ke notifikasis + donasis + pengeluarans
  useEffect(() => {
    const { createClient } = require("@/lib/supabase/client");
    const supabase = createClient();

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donasis" },
        () => {
          loadDashboard();
          loadChart();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pengeluarans" },
        () => {
          loadDashboard();
          loadChart();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifikasis" },
        () => {
          loadNotifs();
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadDashboard, loadChart, loadNotifs]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            Ringkasan Keuangan
          </h3>
          <p className="text-sm text-slate-500 mt-1">Periode: {periode}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="bg-white border border-slate-200 text-sm rounded-md px-3 py-2 outline-none"
          >
            {periodeOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Link href="/pengeluaran">
            <Button variant="outline" className="bg-white">
              <Minus size={16} className="mr-2" /> Input Pengeluaran
            </Button>
          </Link>
          <Link href="/donasi?new=1">
            <Button className="bg-[#0F4C3A] text-white">
              <Plus size={16} className="mr-2" /> Tambah Donasi
            </Button>
          </Link>
        </div>
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
          <Card>
            <CardContent className="p-6">
              <h4 className="text-3xl font-bold text-slate-900">
                Rp {formatRp(data?.saldoKasSekarang)}
              </h4>
              <p className="text-xs text-slate-500 uppercase mt-2">
                Total Saldo Kas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h4 className="text-3xl font-bold text-[#0F4C3A]">
                Rp {formatRp(data?.totalMasukPeriode)}
              </h4>
              <p className="text-xs text-slate-500 uppercase mt-2">
                Donasi {periode}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h4 className="text-3xl font-bold text-rose-600">
                Rp {formatRp(data?.totalKeluarPeriode)}
              </h4>
              <p className="text-xs text-slate-500 uppercase mt-2">
                Pengeluaran {periode}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart + Transaksi + Notif */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Line Chart */}
        <Card className="lg:col-span-2">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-bold">Tren Arus Kas (6 Bulan)</h3>
            <TrendingUp size={16} className="text-slate-400" />
          </div>
          <CardContent className="p-4">
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-sm text-slate-400">Memuat chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="bulan"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${(v / 1000000).toFixed(1)}jt`
                        : `${(v / 1000).toFixed(0)}rb`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [`Rp ${formatRp(value)}`, ""]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pemasukan"
                    name="Pemasukan"
                    stroke="#0F4C3A"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#0F4C3A" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pengeluaran"
                    name="Pengeluaran"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#f43f5e" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Transaksi Terakhir */}
        <Card>
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-bold">Transaksi Terakhir</h3>
            <button
              onClick={loadDashboard}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ↻ Refresh
            </button>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-slate-400 text-center">
                Memuat...
              </div>
            ) : !data?.transaksiTerakhir?.length ? (
              <div className="p-6 text-sm text-slate-400 text-center">
                Belum ada transaksi di periode ini.
              </div>
            ) : (
              data.transaksiTerakhir.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border-b last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        item.type === "Pemasukan"
                          ? "bg-[#E8F3F0] text-[#0F4C3A]"
                          : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {item.type === "Pemasukan" ? (
                        <ArrowDownRight size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[120px]">
                        {item.desc}
                      </p>
                      <p className="text-xs text-slate-500">{item.date}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      item.type === "Pemasukan"
                        ? "text-[#0F4C3A]"
                        : "text-rose-600"
                    }`}
                  >
                    {item.type === "Pemasukan" ? "+" : "-"}
                    {formatRp(item.amount)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notifikasi Terbaru */}
        <Card className="lg:col-span-3">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-bold">Aktivitas Terbaru</h3>
            <Link
              href="/notifikasi"
              className="text-xs text-[#0F4C3A] hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <CardContent className="p-0">
            {notifs.length === 0 ? (
              <div className="p-6 text-sm text-slate-400 text-center">
                Belum ada aktivitas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {notifs.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-4 flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        n.tipe === "pengeluaran_baru"
                          ? "bg-rose-50 text-rose-500"
                          : "bg-[#E8F3F0] text-[#0F4C3A]"
                      }`}
                    >
                      {n.tipe === "pengeluaran_baru" ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {n.judul}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {n.pesan}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
