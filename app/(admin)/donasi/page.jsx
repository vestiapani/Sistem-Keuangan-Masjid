"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDonasis } from "@/lib/donasi";
import DonasiFormDialog from "@/components/donasi/DonasiFormDialog";

export default function DonasiPage() {
  const searchParams = useSearchParams();
  const [donasis, setDonasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);

  const loadData = async () => {
    setLoading(true);
    try {
      setDonasis(await getDonasis());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    if (searchParams.get("new") === "1") setOpenDialog(true);
  }, [searchParams]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Donasi Masuk</h3>
          <p className="text-sm text-slate-500 mt-1">
            Daftar donasi yang sudah terverifikasi.
          </p>
        </div>
        <Button
          onClick={() => setOpenDialog(true)}
          className="bg-[#0F4C3A] text-white"
        >
          <Plus size={16} className="mr-2" /> Tambah Donasi
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Memuat data...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Donatur</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donasis.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-slate-400 py-8"
                  >
                    Belum ada donasi.
                  </TableCell>
                </TableRow>
              ) : (
                donasis.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.tanggal_donasi}</TableCell>
                    <TableCell>{d.nama_donatur}</TableCell>
                    <TableCell>{d.kategori}</TableCell>
                    <TableCell className="text-right font-bold text-[#0F4C3A]">
                      Rp {formatRp(d.jumlah_dana)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <DonasiFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSuccess={loadData}
      />
    </div>
  );
}
