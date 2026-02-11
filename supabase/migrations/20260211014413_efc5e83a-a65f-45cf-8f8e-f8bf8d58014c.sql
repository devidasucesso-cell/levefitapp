
-- Fix 1: Remove overly permissive INSERT policy on reservations
-- Reservations are inserted via edge function using service_role (bypasses RLS),
-- so the public INSERT policy is unnecessary and a security risk.
DROP POLICY IF EXISTS "Anyone can insert reservations" ON public.reservations;

-- Add a policy that requires authentication for direct inserts
CREATE POLICY "Authenticated users can insert reservations"
ON public.reservations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 2: Add validation trigger on orders to ensure only valid status transitions
CREATE OR REPLACE FUNCTION public.validate_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  valid_statuses text[] := ARRAY['pending', 'pending_payment', 'paid', 'payment_failed', 'refunded'];
  valid_transitions jsonb := '{
    "pending": ["pending_payment", "paid", "payment_failed"],
    "pending_payment": ["paid", "payment_failed"],
    "paid": ["refunded"],
    "payment_failed": [],
    "refunded": []
  }'::jsonb;
  allowed_next jsonb;
BEGIN
  -- Validate new status is a known status
  IF NEW.status IS NOT NULL AND NOT (NEW.status = ANY(valid_statuses)) THEN
    RAISE EXCEPTION 'Invalid order status: %', NEW.status;
  END IF;

  -- Validate status transition
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    allowed_next := valid_transitions -> OLD.status;
    IF allowed_next IS NOT NULL AND NOT (allowed_next ? NEW.status) THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;

  -- Prevent modification of immutable fields
  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'Cannot change order user_id';
  END IF;

  IF OLD.stripe_session_id IS DISTINCT FROM NEW.stripe_session_id THEN
    RAISE EXCEPTION 'Cannot change stripe_session_id';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_order_update_trigger
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_update();
