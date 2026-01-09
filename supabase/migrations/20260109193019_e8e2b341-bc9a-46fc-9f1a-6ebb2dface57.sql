-- Fix access_codes SELECT policy to prevent code theft
-- Drop the insecure policy that allows all authenticated users to view all codes
DROP POLICY IF EXISTS "Authenticated users can view codes" ON public.access_codes;

-- Create a secure policy: users can only see codes they have used
CREATE POLICY "Users can view their own used codes" 
ON public.access_codes 
FOR SELECT 
USING (used_by = auth.uid());

-- Admins can view all codes (already exists, but ensure it's there)
DROP POLICY IF EXISTS "Admins can view all access codes" ON public.access_codes;
CREATE POLICY "Admins can view all access codes" 
ON public.access_codes 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));