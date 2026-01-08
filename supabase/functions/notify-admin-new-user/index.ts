import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "esterferreira18000@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewUserNotificationRequest {
  userName: string;
  userEmail: string;
  kitType: string;
}

const getKitLabel = (kitType: string): string => {
  switch (kitType) {
    case '1_pote': return '1 Pote (30 dias)';
    case '3_potes': return '3 Potes (90 dias)';
    case '5_potes': return '5 Potes (150 dias)';
    default: return kitType;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-admin-new-user function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create client with user's JWT to validate authentication
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;
    const authenticatedUserEmail = claimsData.claims.email;
    console.log('Authenticated user:', authenticatedUserId, authenticatedUserEmail);

    const { userName, userEmail, kitType }: NewUserNotificationRequest = await req.json();

    // Security check: Only allow users to notify about their own signup
    // This prevents spam attacks where someone calls this function repeatedly
    if (userEmail !== authenticatedUserEmail) {
      console.error('User tried to notify about different email:', { authenticated: authenticatedUserEmail, requested: userEmail });
      return new Response(
        JSON.stringify({ error: 'Forbidden: Can only notify about your own signup' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Check if this user already triggered a notification recently
    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if profile was created in the last 5 minutes (indicating recent signup)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('user_id', authenticatedUserId)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found for user:', authenticatedUserId);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profileCreatedAt = new Date(profile.created_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    if (profileCreatedAt < fiveMinutesAgo) {
      console.log('Profile created more than 5 minutes ago, notification likely already sent');
      return new Response(
        JSON.stringify({ success: true, message: 'Notification already sent' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Sending notification for new user:", { userName, userEmail, kitType });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "LeveFit <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: "🆕 Novo usuário cadastrado no LeveFit!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #22c55e, #059669); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Novo Usuário!</h1>
            </div>
            
            <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; border: 1px solid #bbf7d0;">
              <h2 style="color: #166534; margin-top: 0;">Detalhes do cadastro:</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dcfce7; color: #4b5563;"><strong>Nome:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dcfce7; color: #111827;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dcfce7; color: #4b5563;"><strong>Email:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #dcfce7; color: #111827;">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #4b5563;"><strong>Kit:</strong></td>
                  <td style="padding: 10px 0; color: #111827;">${getKitLabel(kitType)}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-top: 25px; padding: 20px; background: #fef3c7; border-radius: 12px; border: 1px solid #fde68a;">
              <p style="margin: 0; color: #92400e;">
                ⚠️ <strong>Ação necessária:</strong> Este usuário precisa ser aprovado para acessar o app.
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>LeveFit - Seu guia para uma vida mais saudável 💚</p>
            </div>
          </div>
        `,
      }),
    });

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-admin-new-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);