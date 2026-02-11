
-- Allow admins to insert affiliate sales
CREATE POLICY "Admins can insert sales"
ON public.affiliate_sales
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
