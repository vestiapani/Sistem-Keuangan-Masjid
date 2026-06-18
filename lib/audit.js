import { createClient } from "@/lib/supabase/client";

export async function logActivity({
  adminId,
  action,
  tableName,
  recordId,
  oldValue = null,
  newValue = null,
}) {
  const supabase = createClient();

  const { error } = await supabase.from("activity_logs").insert({
    admin_id: adminId,
    action,
    table_name: tableName,
    record_id: recordId,
    old_value: oldValue,
    new_value: newValue,
  });

  if (error) {
    console.error("Audit Log Error:", error);
  }
}
