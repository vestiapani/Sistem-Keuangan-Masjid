"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/context/ProfileContext";

export default function ProfilPage() {
  const fileInputRef = useRef(null);
  const { profile, updateProfile } = useProfile();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [namaBendahara, setNamaBendahara] = useState("");
  const [namaMasjid, setNamaMasjid] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Sync dari context saat pertama load
  useEffect(() => {
    if (!profile.loading) {
      setNamaBendahara(profile.namaBendahara);
      setNamaMasjid(profile.namaMasjid);
      setPreviewUrl(profile.avatarUrl);
      setLoading(false);
    }
  }, [profile.loading]);

  // Ambil email user (tidak ada di context)
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setEmail(user.email ?? "");
      }
    };
    getUser();
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
    setPreviewUrl(URL.createObjectURL(file));
    handleUploadPhoto(file);
  };

  const handleUploadPhoto = async (file) => {
    if (!userId) return;
    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: path, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) throw updateError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const newAvatarUrl = urlData?.publicUrl ?? "";
      setPreviewUrl(newAvatarUrl);

      // Update context supaya Navbar & Sidebar langsung reflect
      updateProfile({ avatarUrl: newAvatarUrl });

      toast.success("Foto profil berhasil diperbarui.");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(`Gagal upload: ${err?.message ?? "Coba lagi."}`);
      setPreviewUrl(profile.avatarUrl);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
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
        .eq("id", userId);

      if (error) throw error;

      // Update context supaya Navbar & Sidebar langsung reflect tanpa re-fetch
      updateProfile({ namaBendahara, namaMasjid });

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

            <div>
              <p className="font-bold text-slate-800 text-lg">
                {namaBendahara || "—"}
              </p>
              <p className="text-sm text-slate-500">{email}</p>
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
              value={email}
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
