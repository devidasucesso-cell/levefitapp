import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID keys - MUST match the key used in usePushNotifications.ts
const VAPID_PUBLIC_KEY = 'BIJswByPtqkQMVr0BAso8dG3XA-4bn4hL5cn0sILvEXj9QEifo7_9cQj15dDu9v__hsWfnzRaA-JaswPxZ54xoI';
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

// HKDF helper using Web Crypto API
async function hkdfDerive(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      key,
      length * 8
    )
  );
}

// Web Push Encryption (RFC 8291 - aes128gcm)
async function encryptPayload(
  subscriberPublicKeyB64: string,
  authSecretB64: string,
  payload: Uint8Array
): Promise<Uint8Array> {
  const subscriberPublicKeyBytes = base64urlDecode(subscriberPublicKeyB64);
  const authSecret = base64urlDecode(authSecretB64);

  // Generate ephemeral ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  const localPublicKey = new Uint8Array(
    await crypto.subtle.exportKey('raw', localKeyPair.publicKey)
  );

  // Import subscriber's public key for ECDH
  const subscriberKey = await crypto.subtle.importKey(
    'raw',
    subscriberPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: subscriberKey },
      localKeyPair.privateKey,
      256
    )
  );

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // RFC 8291 key derivation
  const keyInfoBuf = new Uint8Array([
    ...new TextEncoder().encode('WebPush: info\0'),
    ...subscriberPublicKeyBytes,
    ...localPublicKey,
  ]);
  const ikm = await hkdfDerive(authSecret, sharedSecret, keyInfoBuf, 32);

  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const cek = await hkdfDerive(salt, ikm, cekInfo, 16);

  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');
  const nonce = await hkdfDerive(salt, ikm, nonceInfo, 12);

  // Pad the payload (add delimiter \x02)
  const paddedPayload = new Uint8Array(payload.length + 1);
  paddedPayload.set(payload);
  paddedPayload[payload.length] = 2;

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw', cek, { name: 'AES-GCM' }, false, ['encrypt']
  );
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      aesKey,
      paddedPayload
    )
  );

  // Build aes128gcm content: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + localPublicKey.length);
  header.set(salt, 0);
  header[16] = (rs >> 24) & 0xff;
  header[17] = (rs >> 16) & 0xff;
  header[18] = (rs >> 8) & 0xff;
  header[19] = rs & 0xff;
  header[20] = localPublicKey.length;
  header.set(localPublicKey, 21);

  const result = new Uint8Array(header.length + encrypted.length);
  result.set(header, 0);
  result.set(encrypted, header.length);
  return result;
}

// Send push notification with RFC 8291 encryption
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

    // Encrypt payload per RFC 8291
    const payloadBytes = new TextEncoder().encode(notificationPayload);
    const encryptedBody = await encryptPayload(subscription.p256dh, subscription.auth, payloadBytes);

    const jwt = await createVapidJwt(audience, vapidSubject);
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': encryptedBody.length.toString(),
        'TTL': '86400',
        'Urgency': 'high',
        'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      },
      body: encryptedBody,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Push failed:', response.status, text);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Push error:', error);
    return false;
  }
}

// Varied messages for rich notifications
const waterMessages = [
  { title: '💧 Hora da Água!', body: 'Beba um copo de água agora! Seu corpo agradece. 💪' },
  { title: '💧 Hidrate-se!', body: 'Já bebeu água? Mantenha-se hidratado para mais energia! ⚡' },
  { title: '💧 Pausa para Água!', body: 'Um gole de saúde! Beba água e continue seu dia. 🌟' },
  { title: '💧 Lembrete!', body: 'Seu corpo precisa de água. Beba um copo agora! 🥤' },
  { title: '💧 Água Agora!', body: 'Hidratação é saúde! Não esqueça de beber água. 💦' },
  { title: '💧 Bora Hidratar!', body: 'Cada gole conta! Beba água para manter o foco. 🎯' },
];

const capsuleMessages = [
  { title: '💊 Hora da Cápsula!', body: 'Tome sua LeveFit agora! Mantenha o tratamento em dia. 🔥' },
  { title: '💊 Sua LeveFit!', body: 'Sua cápsula está esperando! Tome agora para melhores resultados. ✨' },
  { title: '💊 Lembrete LeveFit!', body: 'Não esqueça da sua cápsula! Constância é o segredo. 💪' },
  { title: '💊 Tome Agora!', body: 'Hora da sua dose diária de LeveFit! Resultado vem com disciplina. 🏆' },
];

function getRandomMessage(messages: { title: string; body: string }[]) {
  return messages[Math.floor(Math.random() * messages.length)];
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
          const capsMsg = getRandomMessage(capsuleMessages);
          const success = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            {
              title: capsMsg.title,
              body: capsMsg.body,
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
        
        // First notification of the day - check if it's between 7am and 10pm Brazil time
        const brazilOffset = -3 * 60 * 60 * 1000;
        const brazilNow = new Date(now.getTime() + brazilOffset);
        const hour = brazilNow.getUTCHours();
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
          const waterMsg = getRandomMessage(waterMessages);
          const success = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            {
              title: waterMsg.title,
              body: waterMsg.body,
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
