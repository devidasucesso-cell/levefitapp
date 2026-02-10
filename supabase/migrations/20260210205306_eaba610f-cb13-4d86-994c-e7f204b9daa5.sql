
-- Drop the overly permissive policy
DROP POLICY "Service role can manage orders" ON public.orders;

-- Only allow inserts/updates via service role (webhook uses service_role key)
-- Regular users can only SELECT their own orders (existing policy)
CREATE POLICY "Allow insert via service role only"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Allow update via service role only"
ON public.orders FOR UPDATE
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
