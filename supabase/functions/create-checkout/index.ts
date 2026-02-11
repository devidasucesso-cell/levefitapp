import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    if (!user?.email) throw new Error("User not authenticated");

    // Parse cart items, affiliate code, and wallet discount from request body
    const { items, affiliate_code, wallet_discount } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate wallet discount distribution across items
    const walletDiscountAmount = wallet_discount ? parseFloat(wallet_discount) : 0;
    const itemsTotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    const discountRatio = walletDiscountAmount > 0 ? walletDiscountAmount / itemsTotal : 0;

    // Build line items dynamically from cart data (applying wallet discount proportionally)
    const lineItems = items.map((item: { title: string; price: number; quantity: number; image?: string }) => {
      const discountedPrice = walletDiscountAmount > 0
        ? Math.max(0, item.price - (item.price * discountRatio))
        : item.price;
      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: item.title,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(discountedPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get("origin") || "https://levefitapp.lovable.app";

    // Determine shipping: free for 3+ pots, R$15 for 1 pot
    const totalQuantity = items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
    const hasFreeShipping = totalQuantity >= 3;

    const shippingOptions = hasFreeShipping
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount" as const,
              fixed_amount: { amount: 0, currency: "brl" },
              display_name: "Frete Grátis",
              delivery_estimate: {
                minimum: { unit: "business_day" as const, value: 5 },
                maximum: { unit: "business_day" as const, value: 10 },
              },
            },
          },
        ]
      : [
          {
            shipping_rate_data: {
              type: "fixed_amount" as const,
              fixed_amount: { amount: 1500, currency: "brl" },
              display_name: "Envio Padrão",
              delivery_estimate: {
                minimum: { unit: "business_day" as const, value: 5 },
                maximum: { unit: "business_day" as const, value: 10 },
              },
            },
          },
        ];

    // Create Checkout Session
    // Determine kit type from items total
    const itemsTotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    let kitType = "kit1";
    if (itemsTotal >= 500) kitType = "kit5";
    else if (itemsTotal >= 300) kitType = "kit3";

    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      payment_method_types: ["card", "boleto"],
      shipping_address_collection: { allowed_countries: ["BR"] },
      shipping_options: shippingOptions,
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store`,
      metadata: { kit_type: kitType },
    };

    // Attach affiliate code if present
    if (affiliate_code) {
      sessionParams.metadata.affiliate_code = affiliate_code;
    }

    // Attach wallet discount metadata for webhook processing
    if (walletDiscountAmount > 0) {
      sessionParams.metadata.wallet_discount = walletDiscountAmount.toString();
      sessionParams.metadata.wallet_user_id = user.id;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Save order to database with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseAdmin.from("orders").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      status: "pending",
      amount_total: 0,
      currency: "brl",
      customer_email: user.email,
      items: JSON.stringify(items),
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-CHECKOUT] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
