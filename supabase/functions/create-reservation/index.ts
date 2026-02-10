import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, email, product_title, amount, user_id } = await req.json();

    if (!name || !phone || !email || !product_title) {
      throw new Error("Campos obrigatórios faltando");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: dbError } = await supabaseAdmin.from("reservations").insert({
      name,
      phone,
      email,
      product_title,
      amount: amount || 150,
      user_id: user_id || null,
    });

    if (dbError) throw new Error(`DB error: ${dbError.message}`);
    console.log(`[RESERVATION] Saved reservation for ${name} - ${email}`);

    // Send notification email to admin
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (resendKey && adminEmail) {
      const resend = new Resend(resendKey);
      const formattedPhone = phone.length === 11
        ? `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
        : phone;

      await resend.emails.send({
        from: "LeveFit <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `🎯 Nova Reserva: ${product_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #16a34a;">Nova Reserva Recebida! 🎉</h1>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h2 style="margin-top:0;">${product_title}</h2>
              <p><strong>Nome:</strong> ${name}</p>
              <p><strong>Telefone:</strong> ${formattedPhone}</p>
              <p><strong>E-mail:</strong> ${email}</p>
              <p><strong>Valor:</strong> R$ ${(amount || 150).toFixed(2).replace('.', ',')}</p>
            </div>
            <p style="color: #888; font-size: 14px;">Reserva recebida em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
          </div>
        `,
      });
      console.log(`[RESERVATION] Admin notification sent to ${adminEmail}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[RESERVATION] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
