
-- Sequence for affiliate codes
CREATE SEQUENCE IF NOT EXISTS affiliate_code_seq START WITH 1001;

-- Affiliates table
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  affiliate_code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  total_sales integer DEFAULT 0,
  total_commission numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint on user_id
ALTER TABLE public.affiliates ADD CONSTRAINT affiliates_user_id_unique UNIQUE (user_id);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliates
CREATE POLICY "Users can view their own affiliate" ON public.affiliates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own affiliate" ON public.affiliates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all affiliates" ON public.affiliates FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update affiliates" ON public.affiliates FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-generate affiliate code trigger
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.affiliate_code := 'AFF' || nextval('affiliate_code_seq')::TEXT;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_affiliate_code
  BEFORE INSERT ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_affiliate_code();

-- Affiliate sales table
CREATE TABLE public.affiliate_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id),
  order_id text NOT NULL UNIQUE,
  sale_amount numeric NOT NULL,
  commission_amount numeric NOT NULL,
  customer_email text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

-- Enable RLS
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliate_sales (user sees via affiliate_id join)
CREATE POLICY "Users can view their own sales" ON public.affiliate_sales FOR SELECT 
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all sales" ON public.affiliate_sales FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update sales" ON public.affiliate_sales FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));
