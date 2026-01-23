-- Fix the overly permissive INSERT policy on admin_audit_log
-- Drop the current policy
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.admin_audit_log;

-- The audit log inserts are done by triggers with SECURITY DEFINER, so no INSERT policy is needed
-- If needed, we could add a policy that only allows inserts from authenticated users:
CREATE POLICY "Authenticated users can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);