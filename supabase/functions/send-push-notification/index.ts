import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  type: 'capsule' | 'water' | 'treatment_end' | 'test';
  userId?: string;
}

// Web Push notification sending using fetch
const sendWebPushNotification = async (
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; tag: string }
) => {
  const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
  const VAPID_PUBLIC_KEY = 'BLBz4T_GnpH8xUuw2qQlZGv5yBhH5F1yoKr_t5C5J9rRlJj8u0v8G9H6LpO3RnHK9hT0mN5vF7oJ8lK9zXaYpQM';
  
  if (!VAPID_PRIVATE_KEY) {
    console.error('VAPID_PRIVATE_KEY not configured');
    return false;
  }

  try {
    // Create JWT for VAPID authentication
    const header = { alg: 'ES256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      aud: new URL(subscription.endpoint).origin,
      exp: now + 12 * 60 * 60, // 12 hours
      sub: 'mailto:levefit@app.com',
    };

    // For now, use a simpler approach - send via the push service directly
    // Note: Full VAPID implementation requires crypto operations
    console.log('Sending push to:', subscription.endpoint);
    console.log('Payload:', JSON.stringify(payload));

    // Try to send using basic push
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Push error:', response.status, errorText);
      
      // If push fails, it might be due to expired subscription
      if (response.status === 410 || response.status === 404) {
        console.log('Subscription expired or invalid');
      }
      return false;
    }

    console.log('Push sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, userId }: PushNotificationRequest = await req.json();
    console.log('Processing notification type:', type, 'for user:', userId || 'all');

    let notifications: { title: string; body: string; tag: string }[] = [];
    let targetUsers: string[] = [];

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    if (type === 'test') {
      // Test notification for specific user
      if (userId) {
        targetUsers = [userId];
      } else {
        // Get all users with push subscriptions for test
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('user_id')
          .limit(1);
        if (subs && subs.length > 0) {
          targetUsers = [subs[0].user_id];
        }
      }
      
      notifications = [{
        title: '🔔 Teste de Notificação',
        body: 'As notificações push estão funcionando! 🎉',
        tag: 'test-notification',
      }];

    } else if (type === 'capsule') {
      const { data: settings, error } = await supabase
        .from('notification_settings')
        .select('user_id, capsule_time')
        .eq('capsule_reminder', true);

      if (error) throw error;

      for (const setting of settings || []) {
        if (setting.capsule_time) {
          const [hour, minute] = setting.capsule_time.split(':').map(Number);
          if (hour === currentHour && Math.abs(minute - currentMinute) <= 5) {
            const { data: capsuleDay } = await supabase
              .from('capsule_days')
              .select('id')
              .eq('user_id', setting.user_id)
              .eq('date', today)
              .maybeSingle();

            if (!capsuleDay) {
              targetUsers.push(setting.user_id);
            }
          }
        }
      }

      notifications = [{
        title: '💊 Hora do LeveFit!',
        body: 'Não esqueça de tomar sua cápsula LeveFit hoje!',
        tag: 'capsule-reminder',
      }];

    } else if (type === 'water') {
      const { data: settings, error } = await supabase
        .from('notification_settings')
        .select('user_id')
        .eq('water_reminder', true);

      if (error) throw error;
      targetUsers = (settings || []).map(s => s.user_id);

      notifications = [{
        title: '💧 Beba Água!',
        body: 'É hora de se hidratar! Beba um copo de água.',
        tag: 'water-reminder',
      }];

    } else if (type === 'treatment_end') {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, kit_type, treatment_start_date')
        .not('treatment_start_date', 'is', null)
        .not('kit_type', 'is', null);

      if (error) throw error;

      const kitDurations: Record<string, number> = {
        '1_pote': 30,
        '2_potes': 60,
        '3_potes': 90,
        '5_potes': 150,
      };

      for (const profile of profiles || []) {
        const duration = kitDurations[profile.kit_type] || 30;
        const startDate = new Date(profile.treatment_start_date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);
        
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining >= 0 && daysRemaining <= 5) {
          targetUsers.push(profile.user_id);
        }
      }

      notifications = [{
        title: '🎯 Reta final do tratamento!',
        body: 'Você está nos últimos dias! Continue firme no seu objetivo!',
        tag: 'treatment-end-reminder',
      }];
    }

    console.log('Target users:', targetUsers.length);

    let successCount = 0;
    let failCount = 0;

    for (const targetUserId of targetUsers) {
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', targetUserId);

      if (subError) {
        console.error('Error fetching subscriptions:', subError);
        continue;
      }

      console.log('Found subscriptions for user:', subscriptions?.length || 0);

      for (const sub of subscriptions || []) {
        for (const notification of notifications) {
          const success = await sendWebPushNotification(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            notification
          );
          if (success) successCount++;
          else failCount++;
        }
      }
    }

    console.log(`Notifications sent: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failCount,
        targetUsers: targetUsers.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);