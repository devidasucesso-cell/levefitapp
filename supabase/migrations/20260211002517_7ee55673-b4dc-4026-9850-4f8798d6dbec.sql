
-- Add Pix key fields to affiliates
ALTER TABLE public.affiliates 
  ADD COLUMN pix_key_type text,
  ADD COLUMN pix_key text;

-- Withdrawals table
CREATE TABLE public.pix_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id),
  amount numeric NOT NULL,
  pix_key_type text NOT NULL,
  pix_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pix_withdrawals ENABLE ROW LEVEL SECURITY;

-- User can view and insert their own withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.pix_withdrawals 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can request withdrawals" ON public.pix_withdrawals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can view and update all withdrawals
CREATE POLICY "Admins can view all withdrawals" ON public.pix_withdrawals 
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update withdrawals" ON public.pix_withdrawals 
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can update their own Pix key on affiliates
CREATE POLICY "Users can update their own affiliate pix" ON public.affiliates 
  FOR UPDATE USING (auth.uid() = user_id);
