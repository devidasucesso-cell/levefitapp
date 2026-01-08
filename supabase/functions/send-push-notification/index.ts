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

async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string }
) {
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  if (!vapidPrivateKey) {
    throw new Error('VAPID_PRIVATE_KEY not configured');
  }

  // Use web-push library equivalent for Deno
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response;
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
    console.log('Authenticated user:', authenticatedUserId);

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
      icon: '/pwa-192x192.png'
    };

    // For test notifications, the target is the authenticated user (or specified userId if admin)
    if (type === 'test') {
      targetUserIds = [userId || authenticatedUserId];
      notificationPayload = {
        title: '🔔 Teste de Notificação',
        body: 'As notificações estão funcionando corretamente!',
        icon: '/pwa-192x192.png'
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
        icon: '/pwa-192x192.png'
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
        icon: '/pwa-192x192.png'
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
        icon: '/pwa-192x192.png'
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

    for (const sub of subscriptions || []) {
      try {
        await sendWebPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          notificationPayload
        );
        successCount++;
      } catch (error) {
        console.error('Failed to send notification:', error);
        failureCount++;
      }
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

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
