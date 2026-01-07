-- Add kit_type and treatment_start_date to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kit_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS treatment_start_date date DEFAULT NULL;

-- Create constraint for valid kit types
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_kit_type CHECK (kit_type IN ('1_pote', '3_potes', '5_potes') OR kit_type IS NULL);