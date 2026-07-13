import { supabase } from "./supabase.ts";
export type AppRole = "superadmin" | "admin" | "editor" | "viewer" | "student";
export interface RegisteredUser {
  user_id: string;
  email: string;
  display_name: string | null;
  role: AppRole;
  is_active: boolean;
  assigned_at: string | null;
}
function client() {
  if (!supabase) throw new Error("Supabase no está configurado");
  return supabase;
}
export async function searchUsers(term = ""): Promise<RegisteredUser[]> {
  const { data, error } = await client().rpc("search_registered_users", {
    search_term: term,
    result_limit: 50,
  });
  if (error) throw error;
  return (data || []) as RegisteredUser[];
}
export async function assignRole(userId: string, role: AppRole, note = "") {
  const { error } = await client().rpc("assign_user_role", {
    target_user: userId,
    new_role: role,
    internal_note: note || null,
  });
  if (error) throw error;
}
export async function revokeRole(userId: string, note = "") {
  const { error } = await client().rpc("revoke_user_role", {
    target_user: userId,
    internal_note: note || null,
  });
  if (error) throw error;
}
export async function listAdminRows(table: string) {
  const { data, error } = await client().from(table).select("*").limit(100);
  if (error) throw error;
  return data || [];
}
export async function saveAdminRow(table: string, row: Record<string, unknown>) {
  const {
    data: { user },
  } = await client().auth.getUser();
  if (!user) throw new Error("Sesión requerida");
  const payload = { ...row, updated_by: user.id, ...(!row.id ? { created_by: user.id } : {}) };
  const { data, error } = await client().from(table).upsert(payload).select().single();
  if (error) throw error;
  return data;
}
export async function deleteAdminRow(table: string, id: string) {
  const { error } = await client().from(table).delete().eq("id", id);
  if (error) throw error;
}
export async function listAudit() {
  const { data, error } = await client()
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}
