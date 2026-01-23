-- Fix 1: Add unique constraint on kiwify_order_id to prevent duplicate order processing
ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_kiwify_order_id_unique 
UNIQUE (kiwify_order_id);

-- Fix 2: Create admin audit log table for tracking admin actions
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_audit_log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (read-only, no one can delete/update)
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert audit logs (for edge functions)
CREATE POLICY "Service role can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX idx_admin_audit_log_admin_user_id ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_target_table ON public.admin_audit_log(target_table);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);

-- Fix 3: Create admin settings table to store admin email securely (instead of hardcoding)
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings"
ON public.admin_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can modify settings
CREATE POLICY "Admins can modify settings"
ON public.admin_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert the admin email into settings (move from hardcoded value)
INSERT INTO public.admin_settings (key, value) 
VALUES ('admin_email', 'esterferreira18000@gmail.com');

-- Fix 4: Update the handle_admin_user function to use settings table instead of hardcoded email
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_email_value TEXT;
BEGIN
  -- Get admin email from settings table (not hardcoded)
  SELECT value INTO admin_email_value 
  FROM public.admin_settings 
  WHERE key = 'admin_email';
  
  -- If user email matches admin email, auto-approve and add admin role
  IF admin_email_value IS NOT NULL AND NEW.email = admin_email_value THEN
    UPDATE public.profiles SET is_approved = true WHERE user_id = NEW.id;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix 5: Add trigger to log admin wallet modifications
CREATE OR REPLACE FUNCTION public.log_wallet_admin_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if the update was made by an admin (balance changed)
  IF OLD.balance IS DISTINCT FROM NEW.balance AND has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_table,
      target_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'UPDATE_BALANCE',
      'wallets',
      NEW.id,
      jsonb_build_object('balance', OLD.balance),
      jsonb_build_object('balance', NEW.balance)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_wallet_updates
AFTER UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.log_wallet_admin_update();

-- Fix 6: Add trigger to log admin profile access/modifications
CREATE OR REPLACE FUNCTION public.log_profile_admin_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log if admin is updating someone else's profile
  IF auth.uid() != NEW.user_id AND has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action,
      target_table,
      target_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'ADMIN_UPDATE_PROFILE',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'is_approved', OLD.is_approved,
        'weight', OLD.weight,
        'height', OLD.height
      ),
      jsonb_build_object(
        'is_approved', NEW.is_approved,
        'weight', NEW.weight,
        'height', NEW.height
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_profile_admin_updates
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_profile_admin_update();