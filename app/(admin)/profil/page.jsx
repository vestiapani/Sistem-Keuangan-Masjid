"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Save, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ProfilPage() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [user, setUser] = useState(null);
  const [namaBendahara, setNamaBendahara] = useState("");
  const [namaMasjid, setNamaMasjid] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("nama_bendahara, nama_masjid, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setNamaBendahara(profile.nama_bendahara ?? "");
        setNamaMasjid(profile.nama_masjid ?? "Masjid Al-Ikhlas");
        if (profile.avatar_url) {
          // Ambil public URL dari storage
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(profile.avatar_url);
          setAvatarUrl(urlData?.publicUrl ?? "");
          setPreviewUrl(urlData?.publicUrl ?? "");
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format foto harus JPG, PNG, atau WEBP.");
      return;
    }
    // Preview lokal dulu
    setPreviewUrl(URL.createObjectURL(file));
    handleUploadPhoto(file);
  };

  const handleUploadPhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Simpan path ke profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: path, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      setAvatarUrl(urlData?.publicUrl ?? "");
      toast.success("Foto profil berhasil diperbarui.");
    } catch (err) {
      console.error("Upload error detail:", err);
      const msg = err?.message ?? err?.error_description ?? JSON.stringify(err);
      toast.error(`Gagal upload: ${msg}`);
      // Revert preview
      setPreviewUrl(avatarUrl);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          nama_bendahara: namaBendahara,
          nama_masjid: namaMasjid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profil berhasil disimpan.");
    } catch (err) {
      console.error(err);
      toast.error(err?.message ?? "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const initials = namaBendahara
    ? namaBendahara
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <h3 className="text-2xl font-bold text-slate-900">Profil Saya</h3>
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
    <div className="max-w-2xl space-y-6">
      <h3 className="text-2xl font-bold text-slate-900">Profil Saya</h3>

      {/* Avatar Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#0F4C3A] flex items-center justify-center ring-4 ring-[#0F4C3A]/20">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Foto profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {initials}
                  </span>
                )}
              </div>
              {/* Tombol kamera */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#0F4C3A] hover:bg-[#0A3629] text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Info */}
            <div>
              <p className="font-bold text-slate-800 text-lg">
                {namaBendahara || "—"}
              </p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">{namaMasjid || "—"}</p>
              <p className="text-xs text-slate-400 mt-3">
                Klik ikon kamera untuk ganti foto. Maks. 2MB (JPG/PNG/WEBP).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <div className="p-5 border-b border-slate-100 font-bold text-slate-800">
          Informasi Akun
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Nama Bendahara / Admin
            </label>
            <Input
              type="text"
              value={namaBendahara}
              onChange={(e) => setNamaBendahara(e.target.value)}
              placeholder="Nama lengkap Anda"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Nama Masjid
            </label>
            <Input
              type="text"
              value={namaMasjid}
              onChange={(e) => setNamaMasjid(e.target.value)}
              placeholder="Nama masjid"
            />
            <p className="text-xs text-slate-400">
              Nama ini akan muncul di sidebar dan navbar.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <Input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400">Email tidak dapat diubah.</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0F4C3A] text-white"
          >
            <Save size={15} className="mr-2" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
