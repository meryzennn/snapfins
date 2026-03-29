"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function deleteUserAccountAction() {
  const supabaseServer = await createServerClient();
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const userId = user.id;

  // 1. Delete App Data (transactions / assets) before deleting the user.
  // This cleans up everything explicitly in case the schema does not cascade deletes.
  const { error: txError } = await supabaseServer
    .from("transactions")
    .delete()
    .eq("user_id", userId);
  
  if (txError) {
    throw new Error("Failed to delete user ledger data: " + txError.message);
  }

  const { error: assetError } = await supabaseServer
    .from("assets")
    .delete()
    .eq("user_id", userId);

  if (assetError) {
    console.warn("Assets deletion skipped or failed:", assetError);
  }

  // 2. Delete the actual Auth user using the Service Role Key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing. Real account deletion cannot proceed.");
  }

  // Use a dedicated admin client with the service_role key to bypass RLS and edit auth
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);

  if (deleteUserError) {
    throw new Error("Failed to violently delete user account from Supabase Auth: " + deleteUserError.message);
  }

  return { success: true };
}
