-- Allow admins to insert access codes
CREATE POLICY "Admins can insert access codes" 
ON public.access_codes 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete access codes
CREATE POLICY "Admins can delete access codes" 
ON public.access_codes 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all profiles (for fetching user names)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));