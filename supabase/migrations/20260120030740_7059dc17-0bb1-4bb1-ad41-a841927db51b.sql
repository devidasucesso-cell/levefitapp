-- Create a sequence for referral codes starting at 10001
CREATE SEQUENCE IF NOT EXISTS public.referral_code_seq START WITH 10001;

-- Add referral_code column to wallets table with auto-generated LF code
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.referral_code := 'LF' || nextval('referral_code_seq')::TEXT;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate referral code on wallet creation
DROP TRIGGER IF EXISTS generate_wallet_referral_code ON public.wallets;
CREATE TRIGGER generate_wallet_referral_code
  BEFORE INSERT ON public.wallets
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION public.generate_referral_code();

-- Update existing wallets without referral codes
UPDATE public.wallets 
SET referral_code = 'LF' || nextval('referral_code_seq')::TEXT 
WHERE referral_code IS NULL;