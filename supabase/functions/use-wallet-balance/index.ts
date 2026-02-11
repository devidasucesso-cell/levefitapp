import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { amount, product_title, items } = await req.json();
    if (!amount || amount <= 0) throw new Error("Invalid amount");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch wallet with row-level lock via service role
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) throw new Error("Wallet not found");
    if (wallet.balance < amount) throw new Error("Insufficient balance");

    // Deduct balance atomically
    const newBalance = wallet.balance - amount;
    const { error: updateError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance })
      .eq("id", wallet.id)
      .eq("balance", wallet.balance); // optimistic concurrency check

    if (updateError) throw new Error("Failed to deduct balance, please try again");

    // Record transaction
    await supabaseAdmin.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: user.id,
      amount: -amount,
      type: "purchase",
      description: `Compra: ${product_title || "Loja LeveFit"}`,
    });

    // Create order record
    const sessionId = `wallet_${crypto.randomUUID()}`;
    await supabaseAdmin.from("orders").insert({
      user_id: user.id,
      stripe_session_id: sessionId,
      status: "paid",
      amount_total: Math.round(amount * 100),
      currency: "brl",
      customer_email: user.email,
      items: items ? JSON.stringify(items) : null,
    });

    console.log(`[USE-WALLET] User ${user.id} paid R$${amount.toFixed(2)} with wallet balance`);

    return new Response(JSON.stringify({ success: true, new_balance: newBalance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[USE-WALLET] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
