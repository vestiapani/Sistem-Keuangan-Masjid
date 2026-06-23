"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, CheckCheck } from "lucide-react";
import { getNotifikasiTerbaru, markAllNotifAsRead } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NotifikasiPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifikasiTerbaru(50);
      setNotifs(data);
    } catch (err) {
      toast.error("Gagal memuat notifikasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const supabase = createClient();
    const channel = supabase
      .channel("notifikasi-page-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifikasis" },
        () => loadData(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [loadData]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotifAsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("Semua notifikasi ditandai sudah dibaca.");
    } catch {
      toast.error("Gagal memperbarui notifikasi.");
    }
  };

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            Semua Notifikasi
          </h3>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {unreadCount} notifikasi belum dibaca
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            className="text-sm"
          >
            <CheckCheck size={14} className="mr-2" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Memuat notifikasi...</p>
        ) : notifs.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada notifikasi.</p>
        ) : (
          notifs.map((n) => (
            <Card
              key={n.id}
              className={`transition-colors ${!n.is_read ? "border-[#0F4C3A]/30 bg-emerald-50/30" : ""}`}
            >
              <CardContent className="p-5 flex items-start space-x-4">
                <div
                  className={`p-2 rounded-full shrink-0 ${
                    n.tipe === "pengeluaran_baru"
                      ? "bg-rose-50 text-rose-500"
                      : "bg-[#E8F3F0] text-[#0F4C3A]"
                  }`}
                >
                  {n.tipe === "pengeluaran_baru" ? (
                    <ArrowUpRight size={20} />
                  ) : (
                    <ArrowDownRight size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-800">{n.judul}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 bg-[#0F4C3A] rounded-full inline-block" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{n.pesan}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                  {new Date(n.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
