-- Add unique constraint on progress_history for user_id and date to enable proper upsert
ALTER TABLE public.progress_history ADD CONSTRAINT progress_history_user_id_date_key UNIQUE (user_id, date);