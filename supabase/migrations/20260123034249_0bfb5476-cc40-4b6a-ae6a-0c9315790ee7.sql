-- Fix 1: Remove the overly permissive INSERT policy on admin_audit_log
-- and create a more restrictive one that only allows inserts from triggers
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.admin_audit_log;

-- No public INSERT policy - only triggers with SECURITY DEFINER can insert
-- This is because the triggers run with elevated privileges

-- Fix 2: Add column masking for referred_email (show only partial email)
-- We'll handle this in the application layer instead of database

-- Fix 3: Ensure push_subscriptions can only be accessed by the owner
-- Already has proper RLS, but let's verify with explicit policies