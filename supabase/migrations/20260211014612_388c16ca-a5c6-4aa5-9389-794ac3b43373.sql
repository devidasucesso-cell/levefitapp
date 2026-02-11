
-- Tighten reservations INSERT policy: require user_id to match authenticated user
-- Edge function uses service_role (bypasses RLS), so this only affects direct client access
DROP POLICY IF EXISTS "Authenticated users can insert reservations" ON public.reservations;

CREATE POLICY "Users can insert their own reservations"
ON public.reservations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));
