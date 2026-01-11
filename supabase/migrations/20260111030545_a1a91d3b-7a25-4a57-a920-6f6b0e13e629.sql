-- Add water_goal column to profiles for personalized water targets
ALTER TABLE public.profiles 
ADD COLUMN water_goal integer DEFAULT 2000;

-- Add last_water_notification column to notification_settings for tracking
ALTER TABLE public.notification_settings 
ADD COLUMN last_water_notification timestamp with time zone DEFAULT NULL;