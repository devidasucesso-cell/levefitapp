import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  type: 'test' | 'capsule' | 'water' | 'treatment_end';
  userId?: string;
}

// Decode JWT to get user ID (without verification - Supabase gateway already verified)
function decodeJwt(token: string): { sub?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('JWT does not have 3 parts:', parts.length);
      return null;
    }
    // Convert base64url to base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    const payload = JSON.parse(atob(base64));
    console.log('JWT payload decoded, sub:', payload.sub);
    return payload;
  } catch (e) {
    console.error('JWT decode error:', e);
    return null;
  }
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

// VAPID public key (65 bytes uncompressed P-256 point in base64url)
// Generated using: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'BOEQSjdhorIf8M0XFNlwohK3sTzO9iJwvbYU-fuXRF0tvRpPPMGO6d_gJC_pUQwBT7wD8rKutpNTFHOHN3VqJ0A';

// Create VAPID JWT for web push authentication
async function createVapidJwt(audience: string, subject: string, privateKeyD: string): Promise<string> {
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

  // Decode the public key to extract X and Y coordinates
  const publicKeyBytes = base64urlDecode(VAPID_PUBLIC_KEY);
  console.log('Public key bytes length:', publicKeyBytes.length);
  
  // Public key format: 0x04 + X (32 bytes) + Y (32 bytes)
  if (publicKeyBytes.length !== 65 || publicKeyBytes[0] !== 0x04) {
    throw new Error('Invalid public key format');
  }
  
  const x = base64urlEncode(publicKeyBytes.slice(1, 33));
  const y = base64urlEncode(publicKeyBytes.slice(33, 65));
  
  // Clean private key
  const d = privateKeyD.replace(/[\r\n\s]/g, '');
  
  console.log('Creating JWK with x length:', x.length, 'y length:', y.length, 'd length:', d.length);

  // Create JWK with the private key (d) and corresponding public key (x, y)
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: x,
    y: y,
    d: d,
  };
  
  console.log('Importing VAPID key...');
  
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

  const signatureB64 = base64urlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string; tag?: string; url?: string }
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidPublicKey = VAPID_PUBLIC_KEY;
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@levefit.com';
  
  if (!vapidPrivateKey) {
    console.error('VAPID_PRIVATE_KEY not configured');
    return { success: false, error: 'VAPID key not configured' };
  }

  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    // Create the notification payload matching service worker expectations
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      tag: payload.tag || 'levefit-notification',
      data: {
        url: payload.url || '/dashboard'
      }
    });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': new TextEncoder().encode(notificationPayload).length.toString(),
      'TTL': '86400', // 24 hours
      'Urgency': 'high', // Ensure high priority for background delivery
    };

    // Add VAPID authentication
    try {
      const jwt = await createVapidJwt(audience, vapidSubject, vapidPrivateKey);
      headers['Authorization'] = `vapid t=${jwt}, k=${vapidPublicKey}`;
    } catch (vapidError) {
      console.error('Failed to create VAPID JWT:', vapidError);
      return { success: false, error: 'VAPID JWT creation failed' };
    }

    console.log(`Sending push to: ${subscription.endpoint.substring(0, 50)}...`);
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers,
      body: notificationPayload,
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Push notification failed:', response.status, responseText);
      return { 
        success: false, 
        statusCode: response.status,
        error: `HTTP ${response.status}: ${responseText}` 
      };
    }

    console.log('Push notification sent successfully');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Web push error:', error);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-push-notification function called");

  if (req.method === 'OPTIONS') {
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

    // Decode JWT to get user ID (Supabase gateway already verified the token)
    const token = authHeader.replace('Bearer ', '');
    const jwtPayload = decodeJwt(token);
    
    if (!jwtPayload?.sub) {
      console.error('Could not extract user ID from token');
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authenticatedUserId = jwtPayload.sub;
    console.log('Authenticated user:', authenticatedUserId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, userId }: PushNotificationRequest = await req.json();
    console.log('Notification request:', { type, userId });

    // Authorization check: users can only send notifications to themselves
    // unless they are admins
    if (userId && userId !== authenticatedUserId) {
      // Check if the authenticated user is an admin
      const { data: adminRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authenticatedUserId)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !adminRole) {
        console.error('Non-admin user tried to send notification to another user');
        return new Response(
          JSON.stringify({ error: 'Forbidden: Can only send notifications to yourself' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Admin user authorized to send notification to:', userId);
    }

    let targetUserIds: string[] = [];
    let notificationPayload = {
      title: 'LeveFit',
      body: 'Notificação de teste',
      icon: '/pwa-192x192.png',
      tag: 'levefit-test',
      url: '/dashboard'
    };

    // For test notifications, the target is the authenticated user (or specified userId if admin)
    if (type === 'test') {
      targetUserIds = [userId || authenticatedUserId];
      notificationPayload = {
        title: '🔔 Teste de Notificação',
        body: 'As notificações estão funcionando! Você receberá lembretes mesmo com o app fechado.',
        icon: '/pwa-192x192.png',
        tag: 'levefit-test-' + Date.now(),
        url: '/dashboard'
      };
    } else if (type === 'capsule') {
      // For capsule reminders - only admins can trigger bulk notifications
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authenticatedUserId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!adminRole) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Only admins can trigger bulk notifications' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      const { data: usersToNotify, error: usersError } = await supabase
        .from('notification_settings')
        .select('user_id')
        .eq('capsule_reminder', true)
        .gte('capsule_time', currentTime)
        .lte('capsule_time', `${currentHour}:${(parseInt(currentMinute) + 5).toString().padStart(2, '0')}`);

      if (usersError) {
        console.error('Error fetching users for capsule notification:', usersError);
        throw usersError;
      }

      targetUserIds = usersToNotify?.map(u => u.user_id) || [];
      notificationPayload = {
        title: '💊 Hora da sua cápsula!',
        body: 'Não esqueça de tomar sua cápsula LeveFit hoje.',
        icon: '/pwa-192x192.png',
        tag: 'levefit-capsule-' + Date.now(),
        url: '/calendar'
      };
    } else if (type === 'water') {
      // For water reminders - only admins can trigger bulk notifications
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authenticatedUserId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!adminRole) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Only admins can trigger bulk notifications' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: usersToNotify, error: usersError } = await supabase
        .from('notification_settings')
        .select('user_id')
        .eq('water_reminder', true);

      if (usersError) {
        console.error('Error fetching users for water notification:', usersError);
        throw usersError;
      }

      targetUserIds = usersToNotify?.map(u => u.user_id) || [];
      notificationPayload = {
        title: '💧 Hora de beber água!',
        body: 'Mantenha-se hidratado para melhores resultados.',
        icon: '/pwa-192x192.png',
        tag: 'levefit-water-' + Date.now(),
        url: '/dashboard'
      };
    } else if (type === 'treatment_end') {
      // For treatment end notifications - only admins can trigger
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authenticatedUserId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!adminRole) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Only admins can trigger treatment notifications' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const today = new Date().toISOString().split('T')[0];
      
      const { data: endingProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, kit_type, treatment_start_date')
        .not('treatment_start_date', 'is', null);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

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

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions`);

    let successCount = 0;
    let failureCount = 0;
    const expiredSubscriptions: string[] = [];

    for (const sub of subscriptions || []) {
      const result = await sendWebPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        notificationPayload
      );
      
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        // Track expired subscriptions (410 Gone) for cleanup
        if (result.statusCode === 410) {
          expiredSubscriptions.push(sub.id);
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
