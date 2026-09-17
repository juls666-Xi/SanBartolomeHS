import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function syncUserRoleToSupabase(userId: string, role: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });

  if (error) {
    console.error("Failed to sync role to Supabase:", error);
    throw error;
  }
}

export async function getUserRoleFromSupabase(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user.user_metadata?.role ?? null;
}