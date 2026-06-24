"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  CreditCard,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  QrCode,
  Upload,
  X,
  Landmark,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// ─── Rekening Bank & QRIS ─────────────────────────────────────────
function RekeningSection({ userId }) {
  const [rekenings, setRekenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tipe, setTipe] = useState("bank"); // "bank" | "qris"
  const [qrisFile, setQrisFile] = useState(null);
  const [qrisPreview, setQrisPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formBank, setFormBank] = useState({
    bank: "",
    atas_nama: "",
    nomor: "",
  });
  const [formQris, setFormQris] = useState({ label: "" });

  const BANK_LIST = [
    "BSI",
    "BNI",
    "BRI",
    "Mandiri",
    "BCA",
    "BTN",
    "CIMB Niaga",
    "Danamon",
    "Muamalat",
    "Bank Jatim",
  ];

  const loadRekenings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rekening_masjid")
      .select("*")
      .eq("aktif", true)
      .order("created_at", { ascending: true });
    if (!error) setRekenings(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadRekenings();
  }, []);

  const handleQrisFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Ukuran foto QRIS maksimal 3MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format foto harus JPG, PNG, atau WEBP.");
      return;
    }
    setQrisFile(file);
    setQrisPreview(URL.createObjectURL(file));
  };

  const handleTambahBank = async () => {
    if (!formBank.bank || !formBank.atas_nama || !formBank.nomor) {
      toast.error("Harap isi semua field rekening bank.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rekening_masjid")
        .insert([
          {
            tipe: "bank",
            bank: formBank.bank,
            atas_nama: formBank.atas_nama,
            nomor: formBank.nomor,
            created_by: userId,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setRekenings((prev) => [...prev, data]);
      setFormBank({ bank: "", atas_nama: "", nomor: "" });
      toast.success("Rekening bank berhasil ditambahkan.");
    } catch (err) {
      toast.error(err?.message ?? "Gagal menambah rekening.");
    } finally {
      setSaving(false);
    }
  };

  const handleTambahQris = async () => {
    if (!formQris.label) {
      toast.error("Harap isi label QRIS.");
      return;
    }
    if (!qrisFile) {
      toast.error("Harap upload foto QRIS.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();

      // Upload foto QRIS ke bucket
      const ext = qrisFile.name.split(".").pop();
      const path = `qris-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("qris-masjid")
        .upload(path, qrisFile, { upsert: false });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("rekening_masjid")
        .insert([
          {
            tipe: "qris",
            label: formQris.label,
            qris_image_path: path,
            created_by: userId,
          },
        ])
        .select()
        .single();
      if (error) throw error;

      setRekenings((prev) => [...prev, data]);
      setFormQris({ label: "" });
      setQrisFile(null);
      setQrisPreview(null);
      toast.success("QRIS berhasil ditambahkan.");
    } catch (err) {
      toast.error(err?.message ?? "Gagal menambah QRIS.");
    } finally {
      setSaving(false);
    }
  };

  const handleHapus = async (rekening) => {
    if (
      !confirm(
        `Yakin hapus ${rekening.tipe === "qris" ? "QRIS" : "rekening"} ini?`,
      )
    )
      return;
    try {
      const supabase = createClient();

      // Hapus file QRIS dari storage jika ada
      if (rekening.tipe === "qris" && rekening.qris_image_path) {
        await supabase.storage
          .from("qris-masjid")
          .remove([rekening.qris_image_path]);
      }

      const { error } = await supabase
        .from("rekening_masjid")
        .delete()
        .eq("id", rekening.id);
      if (error) throw error;

      setRekenings((prev) => prev.filter((r) => r.id !== rekening.id));
      toast.success("Berhasil dihapus.");
    } catch (err) {
      toast.error(err?.message ?? "Gagal menghapus.");
    }
  };

  const getQrisUrl = (path) => {
    if (!path) return null;
    const supabase = createClient();
    const { data } = supabase.storage.from("qris-masjid").getPublicUrl(path);
    return data?.publicUrl ?? null;
  };

  return (
    <Card>
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <CreditCard size={18} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Rekening & QRIS Masjid</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ditampilkan di halaman konfirmasi donasi publik.
          </p>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Daftar rekening yang sudah ada */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 bg-slate-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : rekenings.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Belum ada rekening atau QRIS. Tambahkan di bawah.
          </p>
        ) : (
          <div className="space-y-2">
            {rekenings.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 gap-3"
              >
                {r.tipe === "bank" ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-blue-50 rounded-md shrink-0">
                      <Landmark size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {r.bank} — {r.nomor}
                      </p>
                      <p className="text-xs text-slate-500">
                        a.n. {r.atas_nama}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-emerald-50 rounded-md shrink-0">
                      <QrCode size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      {r.qris_image_path && (
                        <img
                          src={getQrisUrl(r.qris_image_path)}
                          alt="QRIS"
                          className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {r.label}
                        </p>
                        <p className="text-xs text-slate-500">QRIS</p>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleHapus(r)}
                  className="p-1.5 text-rose-400 hover:bg-rose-50 rounded transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form tambah — toggle bank / qris */}
        <div className="border border-dashed border-slate-300 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">Tambah Baru</p>
            {/* Toggle tipe */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setTipe("bank")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                  tipe === "bank"
                    ? "bg-[#0F4C3A] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Landmark size={12} /> Bank
              </button>
              <button
                onClick={() => setTipe("qris")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                  tipe === "qris"
                    ? "bg-[#0F4C3A] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <QrCode size={12} /> QRIS
              </button>
            </div>
          </div>

          {tipe === "bank" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={formBank.bank}
                  onChange={(e) =>
                    setFormBank({ ...formBank, bank: e.target.value })
                  }
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="">Pilih Bank</option>
                  {BANK_LIST.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Nomor Rekening"
                  value={formBank.nomor}
                  onChange={(e) =>
                    setFormBank({ ...formBank, nomor: e.target.value })
                  }
                />
                <Input
                  placeholder="Atas Nama"
                  value={formBank.atas_nama}
                  onChange={(e) =>
                    setFormBank({ ...formBank, atas_nama: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleTambahBank}
                disabled={saving}
                size="sm"
                className="bg-[#0F4C3A] text-white"
              >
                <Plus size={14} className="mr-1.5" />
                {saving ? "Menyimpan..." : "Tambah Rekening Bank"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder='Label, misal: "QRIS Masjid At-Taqwa"'
                value={formQris.label}
                onChange={(e) => setFormQris({ label: e.target.value })}
              />

              {/* Upload foto QRIS */}
              {!qrisPreview ? (
                <label className="border-2 border-dashed border-slate-200 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0F4C3A]/40 hover:bg-slate-50 transition-colors">
                  <Upload size={20} className="text-slate-400 mb-2" />
                  <p className="text-xs font-medium text-slate-600">
                    Upload foto QRIS masjid
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    JPG, PNG, WEBP — maks. 3MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleQrisFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <img
                    src={qrisPreview}
                    alt="Preview QRIS"
                    className="w-16 h-16 object-cover rounded border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {qrisFile?.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {qrisFile
                        ? (qrisFile.size / 1024).toFixed(0) + " KB"
                        : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setQrisFile(null);
                      setQrisPreview(null);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <Button
                onClick={handleTambahQris}
                disabled={saving}
                size="sm"
                className="bg-[#0F4C3A] text-white"
              >
                <Plus size={14} className="mr-1.5" />
                {saving ? "Mengupload..." : "Tambah QRIS"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Info Masjid ──────────────────────────────────────────────────
function InfoMasjidSection({ userId }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    alamat: "",
    telepon: "",
    email_masjid: "",
    website: "",
    kapasitas: "",
    tahun_berdiri: "",
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("info_masjid").select("*").single();
      if (data) {
        setForm({
          alamat: data.alamat ?? "",
          telepon: data.telepon ?? "",
          email_masjid: data.email_masjid ?? "",
          website: data.website ?? "",
          kapasitas: data.kapasitas ?? "",
          tahun_berdiri: data.tahun_berdiri ?? "",
        });
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("info_masjid").upsert({
        ...form,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSaved(true);
      toast.success("Info masjid berhasil disimpan.");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err?.message ?? "Gagal menyimpan info masjid.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-lg">
          <Building2 size={18} className="text-[#0F4C3A]" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Informasi Masjid</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Data kontak dan lokasi masjid untuk halaman publik.
          </p>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Alamat Lengkap
            </label>
            <textarea
              rows={2}
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
              className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Nomor Telepon
            </label>
            <Input
              placeholder="0812xxxx / (021) xxxx"
              value={form.telepon}
              onChange={(e) => setForm({ ...form, telepon: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Email Masjid
            </label>
            <Input
              type="email"
              placeholder="info@masjid.com"
              value={form.email_masjid}
              onChange={(e) =>
                setForm({ ...form, email_masjid: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Website
            </label>
            <Input
              placeholder="https://masjid.com"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Kapasitas Jamaah
            </label>
            <Input
              type="number"
              placeholder="500"
              value={form.kapasitas}
              onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Tahun Berdiri
            </label>
            <Input
              type="number"
              placeholder="1985"
              value={form.tahun_berdiri}
              onChange={(e) =>
                setForm({ ...form, tahun_berdiri: e.target.value })
              }
            />
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0F4C3A] text-white"
        >
          {saved ? (
            <>
              <CheckCircle2 size={15} className="mr-2" />
              Tersimpan
            </>
          ) : (
            <>
              <Save size={15} className="mr-2" />
              {saving ? "Menyimpan..." : "Simpan Info Masjid"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Notifikasi ───────────────────────────────────────────────────
function NotifikasiSection({ userId }) {
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    donasi_baru: true,
    donasi_diverifikasi: true,
    pengeluaran_baru: true,
    donasi_ditolak: true,
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("notif_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (data) {
        setPrefs({
          donasi_baru: data.donasi_baru ?? true,
          donasi_diverifikasi: data.donasi_diverifikasi ?? true,
          pengeluaran_baru: data.pengeluaran_baru ?? true,
          donasi_ditolak: data.donasi_ditolak ?? true,
        });
      }
    };
    if (userId) load();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("notif_preferences").upsert({
        user_id: userId,
        ...prefs,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Preferensi notifikasi disimpan.");
    } catch (err) {
      toast.error(err?.message ?? "Gagal menyimpan preferensi.");
    } finally {
      setSaving(false);
    }
  };

  const toggles = [
    {
      key: "donasi_baru",
      label: "Donasi Baru Masuk",
      desc: "Notifikasi saat ada donasi baru dari jamaah",
    },
    {
      key: "donasi_diverifikasi",
      label: "Donasi Terverifikasi",
      desc: "Notifikasi saat admin memverifikasi donasi",
    },
    {
      key: "pengeluaran_baru",
      label: "Pengeluaran Baru",
      desc: "Notifikasi saat ada pengeluaran kas dicatat",
    },
    {
      key: "donasi_ditolak",
      label: "Donasi Ditolak",
      desc: "Notifikasi saat donasi ditolak admin",
    },
  ];

  return (
    <Card>
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-amber-50 rounded-lg">
          <Bell size={18} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Preferensi Notifikasi</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih jenis notifikasi yang ingin ditampilkan.
          </p>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          {toggles.map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() =>
                  setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-4 ${
                  prefs[key] ? "bg-[#0F4C3A]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    prefs[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0F4C3A] text-white"
        >
          <Save size={15} className="mr-2" />
          {saving ? "Menyimpan..." : "Simpan Preferensi"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Keamanan ─────────────────────────────────────────────────────
function KeamananSection() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [passwordKonfirmasi, setPasswordKonfirmasi] = useState("");

  const handleChangePassword = async () => {
    if (!passwordBaru || passwordBaru.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }
    if (passwordBaru !== passwordKonfirmasi) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
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

      const { error } = await supabase.auth.updateUser({
        password: passwordBaru,
      });
      if (error) throw error;

      setPasswordLama("");
      setPasswordBaru("");
      setPasswordKonfirmasi("");
      toast.success("Password berhasil diubah.");
    } catch (err) {
      toast.error(err?.message ?? "Gagal mengubah password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-rose-50 rounded-lg">
          <Shield size={18} className="text-rose-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Keamanan Akun</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola password dan keamanan akun admin.
          </p>
        </div>
      </div>
      <CardContent className="p-6 space-y-4 max-w-md">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Password Lama
          </label>
          <div className="relative">
            <Input
              type={showOld ? "text" : "password"}
              value={passwordLama}
              onChange={(e) => setPasswordLama(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowOld((v) => !v)}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Password Baru
          </label>
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordBaru && (
            <div className="flex gap-1 mt-1">
              {[
                passwordBaru.length >= 6,
                /[A-Z]/.test(passwordBaru),
                /[0-9]/.test(passwordBaru),
              ].map((ok, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${ok ? "bg-[#0F4C3A]" : "bg-slate-200"}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              value={passwordKonfirmasi}
              onChange={(e) => setPasswordKonfirmasi(e.target.value)}
              placeholder="Ulangi password baru"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordKonfirmasi && passwordBaru !== passwordKonfirmasi && (
            <p className="text-xs text-rose-500">Password tidak cocok.</p>
          )}
          {passwordKonfirmasi && passwordBaru === passwordKonfirmasi && (
            <p className="text-xs text-emerald-600">Password cocok.</p>
          )}
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={
            saving || !passwordLama || !passwordBaru || !passwordKonfirmasi
          }
          className="bg-[#0F4C3A] text-white disabled:opacity-50"
        >
          {saving ? "Mengubah..." : "Ubah Password"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function PengaturanPage() {
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setLoadingUser(false);
    };
    getUser();
  }, []);

  if (loadingUser) {
    return (
      <div className="max-w-4xl space-y-6">
        <h3 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-slate-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h3>
        <p className="text-sm text-slate-500 mt-1">
          Kelola informasi masjid, rekening, notifikasi, dan keamanan akun.
        </p>
      </div>
      <InfoMasjidSection userId={userId} />
      <RekeningSection userId={userId} />
      <NotifikasiSection userId={userId} />
      <KeamananSection />
    </div>
  );
}
