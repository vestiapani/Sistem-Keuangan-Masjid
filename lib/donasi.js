import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/audit";

export async function getDonasis() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("donasis")
    .select("*")
    .eq("status_verifikasi", "verified")
    .order("tanggal_donasi", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addDonasi(payload) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("donasis")
    .insert([
      {
        ...payload,
        status_verifikasi: "verified",
        verified_by: user?.id ?? null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    adminId: user?.id,
    action: "CREATE_DONATION",
    tableName: "donasis",
    recordId: data.id,
    newValue: data,
  });

  return data;
}

export async function updateDonasi(id, jumlah_dana) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: oldData } = await supabase
    .from("donasis")
    .select("*")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("donasis")
    .update({
      jumlah_dana,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    adminId: user?.id,
    action: "UPDATE_DONATION",
    tableName: "donasis",
    recordId: id,
    oldValue: oldData,
    newValue: data,
  });

  return data;
}

export async function deleteDonasi(id) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: oldData } = await supabase
    .from("donasis")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("donasis").delete().eq("id", id);

  if (error) throw error;

  await logActivity({
    adminId: user?.id,
    action: "DELETE_DONATION",
    tableName: "donasis",
    recordId: id,
    oldValue: oldData,
  });
}

export async function verifyDonasi(id) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: oldData } = await supabase
    .from("donasis")
    .select("*")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("donasis")
    .update({
      status_verifikasi: "verified",
      verified_by: user.id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await logActivity({
    adminId: user.id,
    action: "VERIFY_DONATION",
    tableName: "donasis",
    recordId: id,
    oldValue: oldData,
    newValue: data,
  });

  return data;
}
