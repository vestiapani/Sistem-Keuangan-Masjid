"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function PengaturanPage() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Data profil
  const [namaMasjid, setNamaMasjid] = useState("");
  const [namaBendahara, setNamaBendahara] = useState("");
  const [email, setEmail] = useState("");

  // Ganti password
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [passwordKonfirmasi, setPasswordKonfirmasi] = useState("");

  // Ambil data user & profil dari Supabase
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("nama_bendahara, nama_masjid")
        .eq("id", user.id)
        .single();

      if (profile) {
        setNamaBendahara(profile.nama_bendahara ?? "");
        setNamaMasjid(profile.nama_masjid ?? "");
      }

      setLoadingProfile(false);
    };
    load();
  }, []);

  // Simpan profil (nama masjid + nama bendahara) ke tabel profiles
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Sesi habis. Silakan login ulang.");

      const { error } = await supabase
        .from("profiles")
        .update({
          nama_bendahara: namaBendahara,
          nama_masjid: namaMasjid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Gagal menyimpan profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Ganti password via Supabase Auth
  const handleChangePassword = async () => {
    if (!passwordBaru || passwordBaru.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }
    if (passwordBaru !== passwordKonfirmasi) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();

      // Re-authenticate dulu dengan password lama
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Sesi habis.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: passwordLama,
      });

      if (signInError) {
        toast.error("Password lama salah.");
        return;
      }

      // Update ke password baru
      const { error } = await supabase.auth.updateUser({
        password: passwordBaru,
      });

      if (error) throw error;

      setPasswordLama("");
      setPasswordBaru("");
      setPasswordKonfirmasi("");
      toast.success("Password berhasil diubah.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Gagal mengubah password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="max-w-4xl space-y-6">
        <h3 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h3 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h3>

      {/* Profil Masjid & Admin */}
      <Card>
        <div className="p-5 border-b border-slate-100 font-bold text-slate-800">
          Profil Masjid & Admin
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold text-slate-700">
              Nama Masjid
            </label>
            <Input
              type="text"
              value={namaMasjid}
              onChange={(e) => setNamaMasjid(e.target.value)}
              placeholder="Contoh: Masjid Al-Ikhlas"
            />
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold text-slate-700">
              Nama Bendahara / Admin
            </label>
            <Input
              type="text"
              value={namaBendahara}
              onChange={(e) => setNamaBendahara(e.target.value)}
              placeholder="Nama lengkap"
            />
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold text-slate-700">
              Email Akun
            </label>
            <Input
              type="email"
              value={email}
              disabled
              className="bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400">
              Email tidak dapat diubah dari sini.
            </p>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="bg-[#0F4C3A] text-white mt-2"
          >
            {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardContent>
      </Card>

      {/* Ganti Password */}
      <Card>
        <div className="p-5 border-b border-slate-100 font-bold text-slate-800">
          Ganti Password
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold text-slate-700">
              Password Lama
            </label>
            <Input
              type="password"
              value={passwordLama}
              onChange={(e) => setPasswordLama(e.target.value)}
              placeholder="Masukkan password saat ini"
            />
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold text-slate-700">
              Password Baru
            </label>
            <Input
              type="password"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-sm font-semibold text-slate-700">
              Konfirmasi Password Baru
            </label>
            <Input
              type="password"
              value={passwordKonfirmasi}
              onChange={(e) => setPasswordKonfirmasi(e.target.value)}
              placeholder="Ulangi password baru"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={
              savingPassword ||
              !passwordLama ||
              !passwordBaru ||
              !passwordKonfirmasi
            }
            className="bg-[#0F4C3A] text-white mt-2 disabled:opacity-50"
          >
            {savingPassword ? "Mengubah..." : "Ubah Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
