import { createClient } from "@/lib/supabase/client";

// ============================================================
// Ambil semua kegiatan (publik & admin)
// ============================================================
export async function getKegiatans({ kategori, status } = {}) {
  const supabase = createClient();

  let query = supabase
    .from("kegiatans")
    .select("*")
    .order("tanggal", { ascending: true });

  if (kategori && kategori !== "Semua") {
    query = query.eq("kategori", kategori);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Ambil kegiatan mendatang saja (tanggal >= hari ini)
// ============================================================
export async function getKegiatansMendatang(limit = 10) {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("kegiatans")
    .select("*")
    .gte("tanggal", today)
    .eq("status", "aktif")
    .order("tanggal", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Ambil satu kegiatan by ID
// ============================================================
export async function getKegiatanById(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("kegiatans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// Tambah kegiatan baru (admin)
// ============================================================
export async function addKegiatan(payload) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("kegiatans")
    .insert([{ ...payload, created_by: user?.id ?? null }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// Update kegiatan (admin)
// ============================================================
export async function updateKegiatan(id, payload) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("kegiatans")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// Hapus kegiatan (admin)
// ============================================================
export async function deleteKegiatan(id) {
  const supabase = createClient();
  const { error } = await supabase.from("kegiatans").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// Helper: format tanggal Indonesia
// ============================================================
export function formatTanggalKegiatan(tanggal) {
  const date = new Date(tanggal + "T00:00:00");
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTanggalBadge(tanggal) {
  const date = new Date(tanggal + "T00:00:00");
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

// ============================================================
// Helper: cek apakah kegiatan kuota penuh
// ============================================================
export function isKuotaPenuh(kegiatan) {
  if (!kegiatan.kuota) return false;
  return kegiatan.pendaftar >= kegiatan.kuota;
}
