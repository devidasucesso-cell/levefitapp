import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID keys
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';

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

    return response.ok;
  } catch (error) {
    console.error('Push error:', error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log("schedule-notifications function called");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type } = await req.json();
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}:00`;
    
    let successCount = 0;
    let totalUsers = 0;

    if (type === 'capsule') {
      // Find users whose capsule time matches current time (within 5 min window)
      const { data: settings, error } = await supabase
        .from('notification_settings')
        .select('user_id, capsule_time')
        .eq('capsule_reminder', true)
        .not('capsule_time', 'is', null);

      if (error) throw error;

      // Filter users whose capsule time is within 5 min window
      const targetUsers = settings?.filter(s => {
        if (!s.capsule_time) return false;
        const [h, m] = s.capsule_time.split(':').map(Number);
        const settingMinutes = h * 60 + m;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        return Math.abs(settingMinutes - currentMinutes) <= 2;
      }) || [];

      totalUsers = targetUsers.length;
      console.log(`Capsule reminders: ${totalUsers} users to notify at ${currentTime}`);

      for (const setting of targetUsers) {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', setting.user_id);

        for (const sub of subs || []) {
          const success = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            {
              title: '💊 Hora do LeveFit!',
              body: 'Não esqueça de tomar sua cápsula hoje para melhores resultados!',
              tag: 'levefit-capsule-' + Date.now(),
              url: '/calendar'
            }
          );
          if (success) successCount++;
        }
      }
    } else if (type === 'water') {
      // Find users who need water reminders based on their interval
      const { data: settings, error } = await supabase
        .from('notification_settings')
        .select('user_id, water_interval, last_water_notification')
        .eq('water_reminder', true);

      if (error) throw error;

      const targetUsers = settings?.filter(s => {
        if (!s.water_interval) return false;
        const intervalMs = s.water_interval * 60 * 1000;
        
        // Check if enough time has passed since last notification
        if (s.last_water_notification) {
          const lastNotif = new Date(s.last_water_notification).getTime();
          const elapsed = now.getTime() - lastNotif;
          return elapsed >= intervalMs;
        }
        
        // First notification of the day - check if it's between 7am and 10pm
        const hour = now.getHours();
        return hour >= 7 && hour <= 22;
      }) || [];

      totalUsers = targetUsers.length;
      console.log(`Water reminders: ${totalUsers} users to notify`);

      for (const setting of targetUsers) {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', setting.user_id);

        let userNotified = false;
        for (const sub of subs || []) {
          const success = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            {
              title: '💧 Hora de beber água!',
              body: 'Mantenha-se hidratado para potencializar os resultados do LeveFit.',
              tag: 'levefit-water-' + Date.now(),
              url: '/dashboard'
            }
          );
          if (success) {
            successCount++;
            userNotified = true;
          }
        }

        // Update last notification time if user was notified
        if (userNotified) {
          await supabase
            .from('notification_settings')
            .update({ last_water_notification: now.toISOString() })
            .eq('user_id', setting.user_id);
        }
      }
    }

    console.log(`Sent ${successCount} notifications to ${totalUsers} users`);

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: totalUsers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in schedule-notifications:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
