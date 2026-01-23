-- Add push_prompt_shown column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN push_prompt_shown boolean DEFAULT false;