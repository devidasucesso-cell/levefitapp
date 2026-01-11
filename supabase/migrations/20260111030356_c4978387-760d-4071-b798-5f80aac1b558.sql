-- Add unique constraint for user_id and date to enable proper upsert
ALTER TABLE public.water_intake_history 
ADD CONSTRAINT water_intake_history_user_date_unique UNIQUE (user_id, date);