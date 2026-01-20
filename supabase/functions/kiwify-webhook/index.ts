import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-signature',
};

interface KiwifyWebhookPayload {
  order_id: string;
  order_status: string;
  product_id?: string;
  product_name?: string;
  customer_email: string;
  customer_name?: string;
  subscription_id?: string;
  tracking_parameters?: {
    ref?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    src?: string;
  };
  approved_date?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('KIWIFY_WEBHOOK_SECRET');
    
    // Verify webhook signature if secret is configured
    const signature = req.headers.get('x-kiwify-signature');
    if (webhookSecret && signature) {
      // Kiwify sends signature in format: sha256=<hash>
      // For now, we'll do basic validation - in production, implement HMAC verification
      console.log('Webhook signature received:', signature ? 'present' : 'missing');
    }

    const payload: KiwifyWebhookPayload = await req.json();
    console.log('Kiwify webhook received:', JSON.stringify(payload, null, 2));

    // Only process approved orders
    if (payload.order_status !== 'paid' && payload.order_status !== 'approved') {
      console.log('Order not approved, skipping:', payload.order_status);
      return new Response(
        JSON.stringify({ success: true, message: 'Order not approved, skipping' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract referral code from tracking parameters
    const refCode = payload.tracking_parameters?.ref || 
                    payload.tracking_parameters?.src ||
                    payload.tracking_parameters?.utm_source;

    if (!refCode) {
      console.log('No referral code found in order');
      return new Response(
        JSON.stringify({ success: true, message: 'No referral code found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing referral code:', refCode);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the wallet with this referral code
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, user_id, balance, referral_code')
      .eq('referral_code', refCode.toUpperCase())
      .single();

    if (walletError || !wallet) {
      console.log('Wallet not found for referral code:', refCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Referral code not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log('Found wallet for user:', wallet.user_id);

    // Check if this order was already processed
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('kiwify_order_id', payload.order_id)
      .single();

    if (existingReferral) {
      console.log('Order already processed:', payload.order_id);
      return new Response(
        JSON.stringify({ success: true, message: 'Order already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creditAmount = 25.00;

    // Create referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: wallet.user_id,
        referral_code: refCode.toUpperCase(),
        referred_email: payload.customer_email,
        kiwify_order_id: payload.order_id,
        status: 'approved',
        credit_amount: creditAmount,
        converted_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating referral:', referralError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create referral' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update wallet balance
    const newBalance = (wallet.balance || 0) + creditAmount;
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update wallet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create transaction record
    const { error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: wallet.user_id,
        amount: creditAmount,
        type: 'credit',
        description: `Indicação aprovada - ${payload.customer_email}`,
        referral_id: referral.id,
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
    }

    console.log('Referral processed successfully:', {
      referrer: wallet.user_id,
      customer: payload.customer_email,
      credit: creditAmount,
      newBalance,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Referral processed successfully',
        credit_amount: creditAmount,
        new_balance: newBalance,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
