import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID keys - MUST match the key used in usePushNotifications.ts
const VAPID_PUBLIC_KEY = 'BC9cm85BFHtf-yMSubfrA1Ity9v91Q7_4R2mvhT41ABOd6tGmH90JViwCdvrOMgcP9tWPzJ5brhOeC5ukAlAvoE';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';

// Milestone notifications - sent at specific days of treatment
const MILESTONE_NOTIFICATIONS: Record<number, { title: string; body: string }> = {
  1: { title: '🎉 Bem-vinda ao LeveFit!', body: 'Seu processo começa hoje 💚' },
  3: { title: '💊 Dia 3!', body: 'Seu corpo já está se adaptando ✨' },
  5: { title: '🏅 Primeira conquista!', body: 'Continue firme 💚' },
  7: { title: '✅ Semana 1 concluída!', body: 'Ótimo começo 👏' },
  10: { title: '💚 Dia 10!', body: 'Constância gera resultado.' },
  14: { title: '🌱 2 semanas completas!', body: 'Seu corpo responde.' },
  18: { title: '👀 Falta pouco…', body: 'Continue registrando no app.' },
  21: { title: '🔓 Dia 21!', body: 'Você está muito perto 🎁' },
  23: { title: '🎯 Quase lá!', body: 'Complete suas conquistas.' },
  25: { title: '🎁 Benefício desbloqueado!', body: 'Não interrompa seus resultados.' },
};

// Helper to encode to base64url
function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper to decode base64url to Uint8Array
function base64urlDecode(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Create VAPID JWT
async function createVapidJwt(audience: string, subject: string): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 60 * 60, sub: subject };

  const headerB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const publicKeyBytes = base64urlDecode(VAPID_PUBLIC_KEY);
  const x = base64urlEncode(publicKeyBytes.slice(1, 33));
  const y = base64urlEncode(publicKeyBytes.slice(33, 65));

  const jwk = { kty: 'EC', crv: 'P-256', x, y, d: VAPID_PRIVATE_KEY };
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsignedToken));

  return `${unsignedToken}.${base64urlEncode(new Uint8Array(signature))}`;
}

// Send push notification
async function sendPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string; tag?: string; url?: string }
): Promise<boolean> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const vapidSubject = 'mailto:admin@levefit.com';
    
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      tag: payload.tag || 'levefit-notification',
      data: { url: payload.url || '/dashboard' }
    });

    const jwt = await createVapidJwt(audience, vapidSubject);
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': new TextEncoder().encode(notificationPayload).length.toString(),
        'TTL': '86400',
        'Urgency': 'high',
        'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      },
      body: notificationPayload,
    });

    if (!response.ok) {
      console.error('Push failed:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Push error:', error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log("milestone-notifications function called");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let successCount = 0;
    let totalUsers = 0;

    // Get all profiles with treatment_start_date
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, name, treatment_start_date')
      .not('treatment_start_date', 'is', null);

    if (profilesError) {
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles with treatment start date`);

    // Check each profile for milestone days
    for (const profile of profiles || []) {
      if (!profile.treatment_start_date) continue;

      const startDate = new Date(profile.treatment_start_date);
      const diffTime = today.getTime() - startDate.getTime();
      const treatmentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      console.log(`User ${profile.user_id}: treatment day ${treatmentDay}`);

      // Check if today is a milestone day
      const milestone = MILESTONE_NOTIFICATIONS[treatmentDay];
      if (!milestone) continue;

      totalUsers++;
      const name = profile.name?.split(' ')[0] || 'Usuário';

      // Get push subscriptions for this user
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', profile.user_id);

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscription for user ${profile.user_id}`);
        continue;
      }

      // Send personalized milestone notification
      for (const sub of subscriptions) {
        const success = await sendPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          {
            title: milestone.title.replace('{name}', name),
            body: milestone.body,
            icon: '/pwa-192x192.png',
            tag: `levefit-milestone-day${treatmentDay}-${todayStr}`,
            url: '/dashboard'
          }
        );

        if (success) {
          successCount++;
          console.log(`Sent milestone notification for day ${treatmentDay} to user ${profile.user_id}`);
        }
      }
    }

    console.log(`Sent ${successCount} milestone notifications to ${totalUsers} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        total: totalUsers,
        date: todayStr
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in milestone-notifications:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
