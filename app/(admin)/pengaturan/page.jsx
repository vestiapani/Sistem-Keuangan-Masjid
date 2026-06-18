"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function PengaturanPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Profil masjid dan admin berhasil diperbarui.");
    }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h3 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h3>
      <Card>
        <div className="p-5 border-b border-slate-100 font-bold">Profil Masjid</div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold">Nama Masjid</label>
            <Input type="text" defaultValue="Masjid Al-Ikhlas" />
          </div>
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold">Nama Bendahara (Admin)</label>
            <Input type="text" defaultValue="Pani" />
          </div>
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold">Password Baru</label>
            <Input type="password" placeholder="Kosongkan jika tidak diubah" />
          </div>
          <Button onClick={handleSave} disabled={loading} className="bg-[#0F4C3A] text-white mt-4">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}