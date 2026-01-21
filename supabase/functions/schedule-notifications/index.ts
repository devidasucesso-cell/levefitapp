import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID keys - MUST match the key used in usePushNotifications.ts
const VAPID_PUBLIC_KEY = 'BKc8xqaDTei1MxJfz-0ENQzUoJEPof7R4EszA68XxDb8m8Xs9xW5FwTz__e8L55NbqBJpn_R_qcLjMBqLJpdXHM';
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
    
    let successCount = 0;
    let totalUsers = 0;
    const expiredSubscriptions: string[] = [];

    if (type === 'capsule') {
      // Find users whose capsule time matches current time (within 5 min window)
      const { data: settings, error } = await supabase
        .from('notification_settings')
        .select('user_id, capsule_time')
        .eq('capsule_reminder', true)
        .not('capsule_time', 'is', null);

      if (error) throw error;

      // Convert UTC to Brazil time (UTC-3) for comparison
      // User's capsule_time is stored in Brazil timezone
      const brazilOffset = -3 * 60 * 60 * 1000; // -3 hours in milliseconds
      const brazilNow = new Date(now.getTime() + brazilOffset);
      const brazilHour = brazilNow.getUTCHours();
      const brazilMinute = brazilNow.getUTCMinutes();
      const currentBrazilMinutes = brazilHour * 60 + brazilMinute;
      
      console.log(`Current Brazil time: ${brazilHour}:${brazilMinute} (${currentBrazilMinutes} minutes)`);

      // Filter users whose capsule time is within 2 min window
      const targetUsers = settings?.filter(s => {
        if (!s.capsule_time) return false;
        const timeParts = s.capsule_time.split(':').map(Number);
        const settingMinutes = timeParts[0] * 60 + timeParts[1];
        const diff = Math.abs(settingMinutes - currentBrazilMinutes);
        
        console.log(`User ${s.user_id}: capsule_time=${s.capsule_time}, setting=${settingMinutes}, brazil=${currentBrazilMinutes}, diff=${diff}`);
        
        // Handle midnight wrap-around
        return diff <= 2 || diff >= (24 * 60 - 2);
      }) || [];

      totalUsers = targetUsers.length;
      console.log(`Capsule reminders: ${totalUsers} users to notify`);

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
    } else if (type === 'journey_daily') {
        // New Logic: Process Daily Journey Notifications based on user creation date
        console.log('Processing journey notifications...');
        const { data: activeUsers, error: usersError } = await supabase
          .from('profiles')
          .select('user_id, created_at, name')
          .not('created_at', 'is', null);
    
        if (!usersError && activeUsers) {
          let journeyCount = 0;
          
          for (const user of activeUsers) {
            if (!user.created_at) continue;
            
            // Calculate days since start (diffDays = 1 means first day)
            const startDate = new Date(user.created_at);
            const diffTime = Math.abs(now.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            let notification = null;
    
            // Journey Timeline Logic - Exact Match for Day
            switch (diffDays) {
              case 1:
                notification = { title: '🎉 Bem-vinda ao LeveFit!', body: 'Seu processo começa hoje 💚', tag: 'journey-day-1' };
                break;
              case 3:
                notification = { title: '💊 Dia 3!', body: 'Seu corpo já está se adaptando ✨', tag: 'journey-day-3' };
                break;
              case 5:
                notification = { title: '🏅 Primeira conquista!', body: 'Continue firme 💚', tag: 'journey-day-5' };
                break;
              case 7:
                notification = { title: '✅ Semana 1 concluída!', body: 'Ótimo começo 👏', tag: 'journey-day-7' };
                break;
              case 10:
                notification = { title: '💚 Dia 10!', body: 'Constância gera resultado.', tag: 'journey-day-10' };
                break;
              case 14:
                notification = { title: '🌱 2 semanas completas!', body: 'Seu corpo responde.', tag: 'journey-day-14' };
                break;
              case 18:
                notification = { title: '👀 Falta pouco…', body: 'Continue registrando no app.', tag: 'journey-day-18' };
                break;
              case 21:
                notification = { title: '🔓 Dia 21!', body: 'Você está muito perto 🎁', tag: 'journey-day-21' };
                break;
              case 23:
                notification = { title: '🎯 Quase lá!', body: 'Complete suas conquistas.', tag: 'journey-day-23' };
                break;
              case 25:
                notification = { title: '🎁 Benefício desbloqueado!', body: 'Não interrompa seus resultados. 🔥', tag: 'journey-day-25', url: '/progress' };
                break;
            }
    
            if (notification) {
              const { data: subs } = await supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', user.user_id);
    
              for (const sub of subs || []) {
                const success = await sendPush(
                  { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
                  {
                    title: notification.title,
                    body: notification.body,
                    tag: notification.tag,
                    url: notification.url || '/dashboard'
                  }
                );
                if (success) journeyCount++;
              }
            }
          }
          console.log(`Sent ${journeyCount} journey notifications`);
          successCount += journeyCount;
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
} else if (type === 'daily_summary') {
      // Daily summary notifications - sent at 8pm
      console.log('Sending daily summary notifications');
      
      // Get all users with push subscriptions
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*');
      
      if (error) throw error;
      
      // Get unique user IDs
      const userIds = [...new Set(subscriptions?.map(s => s.user_id) || [])];
      totalUsers = userIds.length;
      
      for (const userId of userIds) {
        // Get user data for personalized notification
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, water_goal, treatment_start_date')
          .eq('user_id', userId)
          .single();
        
        const { count: capsuleDays } = await supabase
          .from('capsule_days')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        const today = now.toISOString().split('T')[0];
        const { data: todayWater } = await supabase
          .from('water_intake_history')
          .select('total_intake')
          .eq('user_id', userId)
          .eq('date', today)
          .single();
        
        const waterProgress = todayWater?.total_intake || 0;
        const waterGoal = profile?.water_goal || 2000;
        const waterPercent = Math.round((waterProgress / waterGoal) * 100);
        
        let treatmentDay = 0;
        if (profile?.treatment_start_date) {
          const startDate = new Date(profile.treatment_start_date);
          const diffTime = now.getTime() - startDate.getTime();
          treatmentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
        
        const name = profile?.name?.split(' ')[0] || 'Usuário';
        
        // Get this user's subscriptions
        const userSubs = subscriptions?.filter(s => s.user_id === userId) || [];
        
        for (const sub of userSubs) {
          const success = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            {
              title: `📊 Resumo do Dia, ${name}!`,
              body: `Dia ${treatmentDay} de tratamento | ${capsuleDays || 0} cápsulas | Água: ${waterPercent}%`,
              icon: '/pwa-192x192.png',
              tag: 'levefit-daily-summary-' + today,
              url: '/progress'
            }
          );
          if (success) successCount++;
        }
      }
    } else if (type === 'imc_reminder') {
      // IMC update reminder - check users who haven't updated in 7+ days
      console.log('Checking IMC update reminders');
      
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Get all users with push subscriptions
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*');
      
      if (error) throw error;
      
      const userIds = [...new Set(subscriptions?.map(s => s.user_id) || [])];
      
      for (const userId of userIds) {
        // Get user's last progress entry
        const { data: lastProgress } = await supabase
          .from('progress_history')
          .select('date')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .single();
        
        // Check if last update was 7+ days ago
        if (lastProgress && lastProgress.date <= sevenDaysAgo) {
          totalUsers++;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', userId)
            .single();
          
          const name = profile?.name?.split(' ')[0] || 'Usuário';
          const userSubs = subscriptions?.filter(s => s.user_id === userId) || [];
          
          for (const sub of userSubs) {
            const success = await sendPush(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              {
                title: `📏 Hora de atualizar seu IMC, ${name}!`,
                body: 'Já se passaram 7 dias! Registre seu peso para acompanhar seu progresso.',
                icon: '/pwa-192x192.png',
                tag: 'levefit-imc-reminder-' + now.toISOString().split('T')[0],
                url: '/dashboard'
              }
            );
            if (success) successCount++;
          }
        }
      }
      
      console.log(`IMC reminders: ${totalUsers} users notified`);
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
