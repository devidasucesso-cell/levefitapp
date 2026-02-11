import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendPaymentConfirmationEmail(email: string, amountTotal: number) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("[STRIPE-WEBHOOK] RESEND_API_KEY not configured, skipping email");
    return;
  }

  const resend = new Resend(resendKey);
  const formattedAmount = (amountTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  try {
    await resend.emails.send({
      from: "LeveFit <onboarding@resend.dev>",
      to: [email],
      subject: "✅ Pagamento Confirmado - LeveFit",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #16a34a; margin: 0;">Pagamento Confirmado!</h1>
          </div>
          <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333;">Olá! 👋</p>
            <p style="font-size: 16px; color: #333;">Seu pagamento de <strong>${formattedAmount}</strong> foi confirmado com sucesso.</p>
            <p style="font-size: 16px; color: #333;">Seu pedido está sendo preparado e em breve você receberá mais informações sobre o envio.</p>
          </div>
          <div style="text-align: center; padding: 20px 0; color: #888; font-size: 14px;">
            <p>Obrigado por comprar na <strong>LeveFit</strong>! 💚</p>
          </div>
        </div>
      `,
    });
    console.log(`[STRIPE-WEBHOOK] Confirmation email sent to ${email}`);
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Failed to send email:", err);
  }
}
function getCommissionRate(monthlySales: number, kitType: string): number {
  // Tiered commission rates based on monthly sales volume and kit type
  if (monthlySales >= 31) {
    // Level 3 - Avançado
    if (kitType === "kit5") return 0.45;
    if (kitType === "kit3") return 0.40;
    return 0.35; // kit1
  } else if (monthlySales >= 11) {
    // Level 2 - Intermediário
    if (kitType === "kit5") return 0.40;
    if (kitType === "kit3") return 0.35;
    return 0.30; // kit1
  } else {
    // Level 1 - Iniciante
    if (kitType === "kit5") return 0.35;
    if (kitType === "kit3") return 0.30;
    return 0.25; // kit1
  }
}

async function getMonthlyConfirmedSales(supabaseAdmin: any, affiliateId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count } = await supabaseAdmin
    .from("affiliate_sales")
    .select("id", { count: "exact", head: true })
    .eq("affiliate_id", affiliateId)
    .eq("status", "paid")
    .gte("created_at", startOfMonth);
  return count ?? 0;
}

async function processAffiliateCommission(supabaseAdmin: any, session: Stripe.Checkout.Session) {
  const affiliateCode = session.metadata?.affiliate_code;
  if (!affiliateCode) return;

  const amountTotal = session.amount_total ?? 0;
  if (amountTotal <= 0) return;

  const kitType = session.metadata?.kit_type || "kit1";
  console.log(`[STRIPE-WEBHOOK] Processing affiliate commission for code: ${affiliateCode}, kit: ${kitType}`);

  try {
    // Find affiliate by code
    const { data: affiliate, error: affError } = await supabaseAdmin
      .from("affiliates")
      .select("*")
      .eq("affiliate_code", affiliateCode)
      .eq("is_active", true)
      .single();

    if (affError || !affiliate) {
      console.log(`[STRIPE-WEBHOOK] Affiliate not found or inactive: ${affiliateCode}`);
      return;
    }

    // Check for duplicate
    const { data: existing } = await supabaseAdmin
      .from("affiliate_sales")
      .select("id")
      .eq("order_id", session.id)
      .maybeSingle();

    if (existing) {
      console.log(`[STRIPE-WEBHOOK] Duplicate affiliate sale for session: ${session.id}`);
      return;
    }

    // Get monthly sales count to determine level
    const monthlySales = await getMonthlyConfirmedSales(supabaseAdmin, affiliate.id);
    const commissionRate = getCommissionRate(monthlySales, kitType);

    const saleAmount = amountTotal / 100;
    const commissionAmount = saleAmount * commissionRate;
    console.log(`[STRIPE-WEBHOOK] Monthly sales: ${monthlySales}, rate: ${commissionRate * 100}%, commission: R$${commissionAmount.toFixed(2)}`);

    // Insert affiliate sale
    await supabaseAdmin.from("affiliate_sales").insert({
      affiliate_id: affiliate.id,
      order_id: session.id,
      sale_amount: saleAmount,
      commission_amount: commissionAmount,
      customer_email: session.customer_details?.email || null,
      status: "paid",
      paid_at: new Date().toISOString(),
    });

    // Update affiliate totals
    await supabaseAdmin
      .from("affiliates")
      .update({
        total_sales: (affiliate.total_sales || 0) + 1,
        total_commission: (affiliate.total_commission || 0) + commissionAmount,
      })
      .eq("id", affiliate.id);

    // Credit wallet
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", affiliate.user_id)
      .single();

    if (wallet) {
      await supabaseAdmin
        .from("wallets")
        .update({ balance: wallet.balance + commissionAmount })
        .eq("id", wallet.id);

      await supabaseAdmin.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        user_id: affiliate.user_id,
        amount: commissionAmount,
        type: "affiliate_commission",
        description: `Comissão de venda (${(commissionRate * 100).toFixed(0)}%) - R$ ${saleAmount.toFixed(2)}`,
      });
    }

    // Check for level-up: new monthly sales count is monthlySales + 1 (this sale)
    const newMonthlySales = monthlySales + 1;
    const levelNames: Record<number, string> = { 11: "Intermediário 🚀", 31: "Avançado 🏆" };
    if (newMonthlySales === 11 || newMonthlySales === 31) {
      const levelName = levelNames[newMonthlySales];
      console.log(`[STRIPE-WEBHOOK] Affiliate ${affiliate.affiliate_code} leveled up to ${levelName}!`);
      try {
        const fnUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push-notification`;
        await fetch(fnUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            type: "custom",
            userId: affiliate.user_id,
            title: `🎉 Parabéns! Nível ${levelName}`,
            body: `Você atingiu ${newMonthlySales} vendas no mês e subiu de nível! Suas comissões aumentaram.`,
            tag: "affiliate-level-up",
            url: "/referral",
          }),
        });
      } catch (pushErr) {
        console.error("[STRIPE-WEBHOOK] Level-up notification error:", pushErr);
      }
    }

    console.log(`[STRIPE-WEBHOOK] Affiliate commission of R$${commissionAmount.toFixed(2)} credited to ${affiliate.affiliate_code}`);
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Error processing affiliate commission:", err);
  }
}

async function processWalletDiscount(supabaseAdmin: any, session: Stripe.Checkout.Session) {
  const walletDiscount = session.metadata?.wallet_discount;
  const walletUserId = session.metadata?.wallet_user_id;
  if (!walletDiscount || !walletUserId) return;

  const discountAmount = parseFloat(walletDiscount);
  if (discountAmount <= 0) return;

  console.log(`[STRIPE-WEBHOOK] Processing wallet discount of R$${discountAmount.toFixed(2)} for user ${walletUserId}`);

  try {
    // Fetch wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", walletUserId)
      .single();

    if (walletError || !wallet) {
      console.error("[STRIPE-WEBHOOK] Wallet not found for discount deduction");
      return;
    }

    if (wallet.balance < discountAmount) {
      console.error(`[STRIPE-WEBHOOK] Insufficient wallet balance: ${wallet.balance} < ${discountAmount}`);
      return;
    }

    // Deduct balance
    await supabaseAdmin
      .from("wallets")
      .update({ balance: wallet.balance - discountAmount })
      .eq("id", wallet.id);

    // Record transaction
    await supabaseAdmin.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: walletUserId,
      amount: -discountAmount,
      type: "purchase",
      description: `Desconto aplicado na compra (Session: ${session.id})`,
    });

    console.log(`[STRIPE-WEBHOOK] Wallet discount of R$${discountAmount.toFixed(2)} deducted successfully`);
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Error processing wallet discount:", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("[STRIPE-WEBHOOK] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature" }), { status: 400, headers: corsHeaders });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: corsHeaders });
  }

  console.log(`[STRIPE-WEBHOOK] Event received: ${event.type}`);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[STRIPE-WEBHOOK] Checkout completed: ${session.id}`);

        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            status: session.payment_status === "paid" ? "paid" : "pending_payment",
            stripe_payment_intent_id: session.payment_intent as string,
            amount_total: session.amount_total ?? 0,
          })
          .eq("stripe_session_id", session.id);

        if (error) console.error("[STRIPE-WEBHOOK] Update error:", error);
        else console.log(`[STRIPE-WEBHOOK] Order updated to ${session.payment_status}`);

        // Process affiliate commission for immediate payments (card)
        if (session.payment_status === "paid") {
          await processAffiliateCommission(supabaseAdmin, session);
          await processWalletDiscount(supabaseAdmin, session);
        }

        // Send confirmation email for immediate payments (card)
        if (session.payment_status === "paid" && session.customer_details?.email) {
          await sendPaymentConfirmationEmail(session.customer_details.email, session.amount_total ?? 0);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[STRIPE-WEBHOOK] Async payment succeeded: ${session.id}`);

        const { error } = await supabaseAdmin
          .from("orders")
          .update({ status: "paid" })
          .eq("stripe_session_id", session.id);

        if (error) console.error("[STRIPE-WEBHOOK] Update error:", error);

        await processAffiliateCommission(supabaseAdmin, session);
        await processWalletDiscount(supabaseAdmin, session);

        // Send confirmation email for async payments (boleto/pix)
        if (session.customer_details?.email) {
          const fullSession = await stripe.checkout.sessions.retrieve(session.id);
          await sendPaymentConfirmationEmail(session.customer_details.email, fullSession.amount_total ?? 0);
        }
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[STRIPE-WEBHOOK] Async payment failed: ${session.id}`);

        const { error } = await supabaseAdmin
          .from("orders")
          .update({ status: "payment_failed" })
          .eq("stripe_session_id", session.id);

        if (error) console.error("[STRIPE-WEBHOOK] Update error:", error);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`[STRIPE-WEBHOOK] Charge refunded: ${charge.payment_intent}`);

        if (charge.payment_intent) {
          const { error } = await supabaseAdmin
            .from("orders")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", charge.payment_intent as string);

          if (error) console.error("[STRIPE-WEBHOOK] Update error:", error);
        }
        break;
      }

      default:
        console.log(`[STRIPE-WEBHOOK] Unhandled event: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[STRIPE-WEBHOOK] Processing error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
