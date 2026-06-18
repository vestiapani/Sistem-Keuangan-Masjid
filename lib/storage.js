import { createClient } from "@/lib/supabase/client";

// Upload file bukti transfer (dari jamaah, tidak perlu login)
export async function uploadBuktiTransfer(file, donasiId) {
  const supabase = createClient();

  const ext = file.name.split(".").pop();
  const path = `${donasiId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("bukti-transfer")
    .upload(path, file, { upsert: false });

  if (error) throw error;
  return path;
}

// Upload file bukti pengeluaran (dari admin)
export async function uploadBuktiPengeluaran(file, pengeluaranId) {
  const supabase = createClient();

  const ext = file.name.split(".").pop();
  const path = `${pengeluaranId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("bukti-pengeluaran")
    .upload(path, file, { upsert: false });

  if (error) throw error;
  return path;
}

// Ambil signed URL untuk preview (berlaku 1 jam)
export async function getSignedUrl(bucket, path) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (error) throw error;
  return data.signedUrl;
}
