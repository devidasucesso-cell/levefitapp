-- Create table for completed exercises
CREATE TABLE public.completed_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Create table for completed recipes
CREATE TABLE public.completed_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create table for completed detox drinks
CREATE TABLE public.completed_detox (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  detox_id TEXT NOT NULL,
  detox_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, detox_id)
);

-- Create table to track shown achievements (to not repeat)
CREATE TABLE public.shown_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  shown_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on all tables
ALTER TABLE public.completed_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_detox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shown_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for completed_exercises
CREATE POLICY "Users can view their own completed exercises" ON public.completed_exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completed exercises" ON public.completed_exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completed exercises" ON public.completed_exercises FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for completed_recipes
CREATE POLICY "Users can view their own completed recipes" ON public.completed_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completed recipes" ON public.completed_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completed recipes" ON public.completed_recipes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for completed_detox
CREATE POLICY "Users can view their own completed detox" ON public.completed_detox FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completed detox" ON public.completed_detox FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completed detox" ON public.completed_detox FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for shown_achievements
CREATE POLICY "Users can view their own shown achievements" ON public.shown_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shown achievements" ON public.shown_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);