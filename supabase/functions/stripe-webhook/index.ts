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

        // Send confirmation email for async payments (boleto/pix)
        if (session.customer_details?.email) {
          // Fetch session to get amount
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
