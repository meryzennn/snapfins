import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE() {
  try {
    // 1. Identify the authenticated user
    const supabaseServer = await createServerClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id;

    // 2. Delete app data — transactions first, then assets
    const { error: txError } = await supabaseServer
      .from("transactions")
      .delete()
      .eq("user_id", userId);

    if (txError) {
      console.error("Failed to delete transactions:", txError);
      return NextResponse.json(
        { message: "Failed to delete ledger data: " + txError.message },
        { status: 500 }
      );
    }

    const { error: assetError } = await supabaseServer
      .from("assets")
      .delete()
      .eq("user_id", userId);

    if (assetError) {
      // Non-fatal — log and continue
      console.warn("Assets deletion warning:", assetError);
    }

    // 3. Delete the auth user using the service role admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { message: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing." },
        { status: 500 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Failed to delete auth user:", deleteUserError);
      return NextResponse.json(
        { message: "Failed to delete account: " + deleteUserError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error in DELETE /api/actions/user:", err);
    return NextResponse.json(
      { message: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
