import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  type: 'test' | 'capsule' | 'water' | 'treatment_end' | 'daily_summary';
  userId?: string;
}

// Helper to encode to base64url
function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper to decode base64url to Uint8Array
function base64urlDecode(base64url: string): Uint8Array {
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// VAPID keys
const VAPID_PUBLIC_KEY = 'BC2gGb8zod8oErGPwQt-UMS8_6UZiJTegdi17sMQsb4joMcCvMS0axTjJc8Z7dw-RfWtFnF8v10R2u0N5CkvSPU';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';

// Create VAPID JWT for web push authentication
async function createVapidJwt(audience: string, subject: string): Promise<string> {
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: subject,
  };

  const headerB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  try {
    // Decode public key (uncompressed format: 0x04 + x + y)
    const publicKeyBytes = base64urlDecode(VAPID_PUBLIC_KEY);
    const x = base64urlEncode(publicKeyBytes.slice(1, 33));
    const y = base64urlEncode(publicKeyBytes.slice(33, 65));
    const d = VAPID_PRIVATE_KEY;

    if (!d) {
      throw new Error('VAPID_PRIVATE_KEY not configured');
    }

    // Log key info for debugging (not the actual values for security)
    console.log(`VAPID key check - Public key length: ${VAPID_PUBLIC_KEY.length}, Private key length: ${d.length}`);
    console.log(`x length: ${x.length}, y length: ${y.length}`);

    const jwk = { kty: 'EC' as const, crv: 'P-256' as const, x, y, d };
    
    const key = await crypto.subtle.importKey(
      'jwk', 
      jwk, 
      { name: 'ECDSA', namedCurve: 'P-256' }, 
      false, 
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' }, 
      key, 
      new TextEncoder().encode(unsignedToken)
    );

    return `${unsignedToken}.${base64urlEncode(new Uint8Array(signature))}`;
  } catch (error) {
    console.error('Error creating VAPID JWT:', error);
    throw error;
  }
}

async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string; tag?: string; url?: string }
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@levefit.com';

  try {
    console.log(`Attempting push to endpoint: ${subscription.endpoint.substring(0, 60)}...`);
    
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      tag: payload.tag || 'levefit-notification',
      data: { url: payload.url || '/dashboard' }
    });
    
    console.log('Creating VAPID JWT...');
    const jwt = await createVapidJwt(audience, vapidSubject);
    console.log('VAPID JWT created successfully');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': new TextEncoder().encode(notificationPayload).length.toString(),
      'TTL': '86400',
      'Urgency': 'high',
      'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
    };

    console.log(`Sending push request to ${audience}...`);
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers,
      body: notificationPayload,
    });

    const responseText = await response.text();
    console.log(`Push response: ${response.status} - ${responseText.substring(0, 200)}`);
    
    if (!response.ok) {
      console.error(`Push notification failed: ${response.status} ${responseText}`);
      return { success: false, statusCode: response.status, error: `HTTP ${response.status}: ${responseText}` };
    }

    console.log('Push notification sent successfully!');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Web push error:', errorMessage);
    console.error('Error stack:', errorStack);
    return { success: false, error: errorMessage };
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-push-notification function called");

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with anon key to validate user token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the Authorization header and extract user
    const authHeader = req.headers.get('Authorization');
    let authenticatedUserId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Use getUser to properly validate the JWT and extract user
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (!authError && user) {
        authenticatedUserId = user.id;
        console.log('Authenticated user:', authenticatedUserId);
      } else {
        console.log('Auth error or no user:', authError?.message);
      }
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, userId }: PushNotificationRequest = await req.json();
    console.log('Notification request:', { type, userId, authenticatedUserId });

    // Determine target user - prefer userId from body, fallback to authenticated user
    const targetUserId = userId || authenticatedUserId;
    
    if (!targetUserId && type === 'test') {
      console.error('No user ID available for test notification');
      return new Response(
        JSON.stringify({ error: 'User ID required', sent: 0 }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let targetUserIds: string[] = [];
    let notificationPayload = {
      title: 'LeveFit',
      body: 'Notificação de teste',
      icon: '/pwa-192x192.png',
      tag: 'levefit-test',
      url: '/dashboard'
    };

    if (type === 'test') {
      targetUserIds = [targetUserId!];
      notificationPayload = {
        title: '🔔 Teste de Notificação',
        body: 'As notificações estão funcionando! Você receberá lembretes mesmo com o app fechado.',
        icon: '/pwa-192x192.png',
        tag: 'levefit-test-' + Date.now(),
        url: '/dashboard'
      };
    } else if (type === 'capsule') {
      const now = new Date();
      
      // Convert UTC to Brazil time (UTC-3) for comparison
      // User's capsule_time is stored in Brazil timezone
      const brazilOffset = -3 * 60 * 60 * 1000; // -3 hours in milliseconds
      const brazilNow = new Date(now.getTime() + brazilOffset);
      const brazilHour = brazilNow.getUTCHours();
      const brazilMinute = brazilNow.getUTCMinutes();
      const currentBrazilMinutes = brazilHour * 60 + brazilMinute;

      console.log(`Current Brazil time: ${brazilHour}:${brazilMinute} (${currentBrazilMinutes} minutes)`);

      const { data: usersToNotify, error: usersError } = await supabase
        .from('notification_settings')
        .select('user_id, capsule_time')
        .eq('capsule_reminder', true)
        .not('capsule_time', 'is', null);

      if (usersError) {
        console.error('Error fetching notification settings:', usersError);
        throw usersError;
      }

      console.log(`Found ${usersToNotify?.length || 0} users with capsule reminder enabled`);

      // Filter users whose capsule time is within 2 min window
      // capsule_time is stored as "HH:MM:SS" in Brazil timezone
      const filtered = usersToNotify?.filter(s => {
        if (!s.capsule_time) return false;
        // Handle both "HH:MM" and "HH:MM:SS" formats
        const timeParts = s.capsule_time.split(':').map(Number);
        const settingMinutes = timeParts[0] * 60 + timeParts[1];
        
        const diff = Math.abs(settingMinutes - currentBrazilMinutes);
        
        console.log(`User ${s.user_id}: capsule_time=${s.capsule_time}, setting=${settingMinutes}, brazil=${currentBrazilMinutes}, diff=${diff}`);
        
        return diff <= 2 || diff >= (24 * 60 - 2); // Handle midnight wrap-around
      }) || [];

      console.log(`Filtered to ${filtered.length} users to notify`);

      targetUserIds = filtered.map(u => u.user_id);
      notificationPayload = {
        title: '💊 Hora da sua cápsula!',
        body: 'Não esqueça de tomar sua cápsula LeveFit hoje.',
        icon: '/pwa-192x192.png',
        tag: 'levefit-capsule-' + Date.now(),
        url: '/calendar'
      };
    } else if (type === 'water') {
      const now = new Date();
      
      const { data: usersToNotify, error: usersError } = await supabase
        .from('notification_settings')
        .select('user_id, water_interval, last_water_notification')
        .eq('water_reminder', true);

      if (usersError) throw usersError;

      const filtered = usersToNotify?.filter(s => {
        if (!s.water_interval) return false;
        const intervalMs = s.water_interval * 60 * 1000;
        
        if (s.last_water_notification) {
          const lastNotif = new Date(s.last_water_notification).getTime();
          const elapsed = now.getTime() - lastNotif;
          return elapsed >= intervalMs;
        }
        
        const hour = now.getHours();
        return hour >= 7 && hour <= 22;
      }) || [];

      targetUserIds = filtered.map(u => u.user_id);
      notificationPayload = {
        title: '💧 Hora de beber água!',
        body: 'Mantenha-se hidratado para melhores resultados.',
        icon: '/pwa-192x192.png',
        tag: 'levefit-water-' + Date.now(),
        url: '/dashboard'
      };
    } else if (type === 'daily_summary') {
      // Daily summary notification - sent once per day
      const { data: allUsers, error: usersError } = await supabase
        .from('push_subscriptions')
        .select('user_id');
      
      if (usersError) throw usersError;
      
      // Get unique user IDs
      const uniqueUserIds = [...new Set(allUsers?.map(u => u.user_id) || [])];
      
      // For each user, generate personalized summary
      for (const uid of uniqueUserIds) {
        // Get user profile and progress data
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, water_intake, water_goal, treatment_start_date, kit_type')
          .eq('user_id', uid)
          .single();
        
        // Get capsule days count
        const { count: capsuleDays } = await supabase
          .from('capsule_days')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', uid);
        
        // Get today's water intake
        const today = new Date().toISOString().split('T')[0];
        const { data: todayWater } = await supabase
          .from('water_intake_history')
          .select('total_intake')
          .eq('user_id', uid)
          .eq('date', today)
          .single();
        
        const waterProgress = todayWater?.total_intake || 0;
        const waterGoal = profile?.water_goal || 2000;
        const waterPercent = Math.round((waterProgress / waterGoal) * 100);
        
        // Calculate treatment day
        let treatmentDay = 0;
        if (profile?.treatment_start_date) {
          const startDate = new Date(profile.treatment_start_date);
          const diffTime = new Date().getTime() - startDate.getTime();
          treatmentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
        
        const name = profile?.name?.split(' ')[0] || 'Usuário';
        
        notificationPayload = {
          title: `📊 Resumo do Dia, ${name}!`,
          body: `Dia ${treatmentDay} de tratamento | ${capsuleDays || 0} cápsulas | Água: ${waterPercent}%`,
          icon: '/pwa-192x192.png',
          tag: 'levefit-daily-summary-' + today,
          url: '/progress'
        };
        
        targetUserIds.push(uid);
      }
      
      // Set a generic notification for the batch (will be customized per user above)
      if (targetUserIds.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'No users to notify', sent: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (type === 'treatment_end') {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: endingProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, kit_type, treatment_start_date')
        .not('treatment_start_date', 'is', null);

      if (profilesError) throw profilesError;

      const usersEndingToday = endingProfiles?.filter(profile => {
        if (!profile.treatment_start_date || !profile.kit_type) return false;
        
        const startDate = new Date(profile.treatment_start_date);
        let treatmentDays = 30;
        if (profile.kit_type === '3_potes') treatmentDays = 90;
        if (profile.kit_type === '5_potes') treatmentDays = 150;
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + treatmentDays);
        
        return endDate.toISOString().split('T')[0] === today;
      }) || [];

      targetUserIds = usersEndingToday.map(u => u.user_id);
      notificationPayload = {
        title: '🎉 Parabéns!',
        body: 'Seu tratamento LeveFit terminou hoje! Veja seus resultados.',
        icon: '/pwa-192x192.png',
        tag: 'levefit-treatment-end-' + Date.now(),
        url: '/progress'
      };
    }

    console.log(`Sending ${type} notifications to ${targetUserIds.length} users`);

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No users to notify', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch push subscriptions for target users
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUserIds);

    if (subError) throw subError;

    console.log(`Found ${subscriptions?.length || 0} subscriptions`);

    let successCount = 0;
    let failureCount = 0;
    const expiredSubscriptions: string[] = [];

    // For daily_summary, we need personalized notifications per user
    if (type === 'daily_summary') {
      for (const sub of subscriptions || []) {
        // Get personalized data for this user
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, water_goal, treatment_start_date')
          .eq('user_id', sub.user_id)
          .single();
        
        const { count: capsuleDays } = await supabase
          .from('capsule_days')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', sub.user_id);
        
        const today = new Date().toISOString().split('T')[0];
        const { data: todayWater } = await supabase
          .from('water_intake_history')
          .select('total_intake')
          .eq('user_id', sub.user_id)
          .eq('date', today)
          .single();
        
        const waterProgress = todayWater?.total_intake || 0;
        const waterGoal = profile?.water_goal || 2000;
        const waterPercent = Math.round((waterProgress / waterGoal) * 100);
        
        let treatmentDay = 0;
        if (profile?.treatment_start_date) {
          const startDate = new Date(profile.treatment_start_date);
          const diffTime = new Date().getTime() - startDate.getTime();
          treatmentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
        
        const name = profile?.name?.split(' ')[0] || 'Usuário';
        
        const personalPayload = {
          title: `📊 Resumo do Dia, ${name}!`,
          body: `Dia ${treatmentDay} | ${capsuleDays || 0} cápsulas tomadas | Água hoje: ${waterPercent}%`,
          icon: '/pwa-192x192.png',
          tag: 'levefit-daily-summary-' + today,
          url: '/progress'
        };
        
        const result = await sendWebPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          personalPayload
        );
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          if (result.statusCode === 410) {
            expiredSubscriptions.push(sub.id);
          }
        }
      }
    } else {
      for (const sub of subscriptions || []) {
        const result = await sendWebPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          notificationPayload
        );
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          if (result.statusCode === 410) {
            expiredSubscriptions.push(sub.id);
          }
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredSubscriptions.length > 0) {
      console.log(`Cleaning up ${expiredSubscriptions.length} expired subscriptions`);
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', expiredSubscriptions);
    }

    console.log(`Notifications sent: ${successCount} success, ${failureCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failureCount,
        total: subscriptions?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
