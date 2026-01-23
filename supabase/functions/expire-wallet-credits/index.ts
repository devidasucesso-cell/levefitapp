import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPIRATION_DAYS = 90;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('expire-wallet-credits function called');

  try {
    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the cutoff date (90 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - EXPIRATION_DAYS);
    const cutoffDateStr = cutoffDate.toISOString();

    console.log(`Looking for wallets with no activity since: ${cutoffDateStr}`);

    // Find wallets with balance > 0 that haven't been updated in 90 days
    const { data: expiredWallets, error: fetchError } = await supabase
      .from('wallets')
      .select('id, user_id, balance, updated_at')
      .gt('balance', 0)
      .lt('updated_at', cutoffDateStr);

    if (fetchError) {
      console.error('Error fetching wallets:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch wallets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!expiredWallets || expiredWallets.length === 0) {
      console.log('No expired wallets found');
      return new Response(
        JSON.stringify({ success: true, message: 'No expired wallets', expired_count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredWallets.length} wallet(s) to expire`);

    let expiredCount = 0;
    let totalExpiredAmount = 0;

    for (const wallet of expiredWallets) {
      // Double-check: verify no transactions in the last 90 days for this wallet
      const { data: recentTransactions, error: txError } = await supabase
        .from('wallet_transactions')
        .select('id, created_at')
        .eq('wallet_id', wallet.id)
        .gte('created_at', cutoffDateStr)
        .limit(1);

      if (txError) {
        console.error(`Error checking transactions for wallet ${wallet.id}:`, txError);
        continue;
      }

      // If there are recent transactions, skip this wallet
      if (recentTransactions && recentTransactions.length > 0) {
        console.log(`Wallet ${wallet.id} has recent transactions, skipping`);
        continue;
      }

      const expiredAmount = wallet.balance;

      // Create expiration transaction record
      const { error: insertTxError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: wallet.user_id,
          amount: -expiredAmount,
          type: 'expiration',
          description: `Créditos expirados após ${EXPIRATION_DAYS} dias de inatividade`,
        });

      if (insertTxError) {
        console.error(`Error creating expiration transaction for wallet ${wallet.id}:`, insertTxError);
        continue;
      }

      // Zero the wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ 
          balance: 0, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', wallet.id);

      if (updateError) {
        console.error(`Error zeroing wallet ${wallet.id}:`, updateError);
        continue;
      }

      console.log(`Expired wallet ${wallet.id}: R$${expiredAmount.toFixed(2)} -> R$0.00`);
      expiredCount++;
      totalExpiredAmount += expiredAmount;
    }

    console.log(`Expiration complete: ${expiredCount} wallet(s), R$${totalExpiredAmount.toFixed(2)} total`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Wallet expiration complete',
        expired_count: expiredCount,
        total_expired_amount: totalExpiredAmount,
        expiration_days: EXPIRATION_DAYS,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Expiration error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
