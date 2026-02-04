-- Create a function to auto-generate and claim an access code for a user
CREATE OR REPLACE FUNCTION public.auto_generate_and_claim_code(claiming_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_code text;
  new_code_id uuid;
BEGIN
  -- Check if user already has a validated code
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = claiming_user_id AND code_validated = true
  ) THEN
    RETURN json_build_object('success', true, 'already_validated', true);
  END IF;

  -- Generate a unique code
  generated_code := 'AUTO-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  
  -- Create the access code
  INSERT INTO access_codes (code, is_used, used_by, used_at)
  VALUES (generated_code, true, claiming_user_id, now())
  RETURNING id INTO new_code_id;
  
  -- Update the user's profile to mark code as validated
  UPDATE profiles 
  SET code_validated = true, updated_at = now()
  WHERE user_id = claiming_user_id;
  
  RETURN json_build_object(
    'success', true, 
    'code', generated_code,
    'code_id', new_code_id
  );
END;
$$;