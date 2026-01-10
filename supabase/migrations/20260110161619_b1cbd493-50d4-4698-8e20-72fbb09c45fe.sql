-- Create water intake history table
CREATE TABLE public.water_intake_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  total_intake INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.water_intake_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own water history" 
ON public.water_intake_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water history" 
ON public.water_intake_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water history" 
ON public.water_intake_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_water_intake_history_updated_at
BEFORE UPDATE ON public.water_intake_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();