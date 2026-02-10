
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  product_title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 150.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all reservations"
  ON public.reservations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own reservations"
  ON public.reservations FOR SELECT
  USING (auth.uid() = user_id);
