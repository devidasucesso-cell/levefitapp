import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  type: 'capsule' | 'water' | 'treatment_end';
  userId?: string;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
}

const sendPushNotification = async (subscription: PushSubscription, payload: object) => {
  const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY');
  
  if (!FIREBASE_SERVER_KEY) {
    console.error('FIREBASE_SERVER_KEY not configured');
    return false;
  }

  try {
    // Using Web Push API with FCM
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: subscription.endpoint,
        data: payload,
        notification: payload,
      }),
    });

    if (!response.ok) {
      console.error('FCM error:', await response.text());
      return false;
    }

    console.log('Push sent successfully to:', subscription.user_id);
    return true;
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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

    if (type === 'capsule') {
      // Get users with capsule reminder enabled at this time
      const { data: settings, error } = await supabase
        .from('notification_settings')
        .select('user_id, capsule_time')
        .eq('capsule_reminder', true);

      if (error) {
        console.error('Error fetching notification settings:', error);
        throw error;
      }

      // Check which users should receive notification now
      for (const setting of settings || []) {
        if (setting.capsule_time) {
          const [hour, minute] = setting.capsule_time.split(':').map(Number);
          // Allow 5-minute window for cron timing
          if (hour === currentHour && Math.abs(minute - currentMinute) <= 5) {
            // Check if user already took capsule today
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
      // Get users with water reminder enabled
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
      // Get users in the last 5 days of treatment
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

    // Send notifications to target users
    let successCount = 0;
    let failCount = 0;

    for (const targetUserId of targetUsers) {
      // Get push subscriptions for this user
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', targetUserId);

      if (subError) {
        console.error('Error fetching subscriptions:', subError);
        continue;
      }

      for (const sub of subscriptions || []) {
        for (const notification of notifications) {
          const success = await sendPushNotification(sub, notification);
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