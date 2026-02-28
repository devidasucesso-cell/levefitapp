
-- Table: user_points (total accumulated points per user)
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all points" ON public.user_points FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all points" ON public.user_points FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: points_history (audit log of point actions)
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points history" ON public.points_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points history" ON public.points_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all points history" ON public.points_history FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Table: rewards (available rewards)
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'discount',
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Rewards are visible to all authenticated users
CREATE POLICY "Authenticated users can view active rewards" ON public.rewards FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage rewards" ON public.rewards FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Table: redeemed_rewards
CREATE TABLE public.redeemed_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id),
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.redeemed_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own redeemed rewards" ON public.redeemed_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own redeemed rewards" ON public.redeemed_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all redeemed rewards" ON public.redeemed_rewards FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update redeemed rewards" ON public.redeemed_rewards FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed initial rewards
INSERT INTO public.rewards (name, description, points_cost, type) VALUES
  ('🎫 Desconto de R$10 na loja', 'Ganhe R$10 de desconto na sua próxima compra na loja LeveFit', 100, 'discount'),
  ('🍰 Receita Exclusiva Premium', 'Desbloqueie uma receita exclusiva premium para seu tratamento', 50, 'recipe'),
  ('🎁 Brinde Surpresa', 'Receba um brinde surpresa especial LeveFit na sua próxima compra', 200, 'gift');

-- Function to auto-create user_points on new user
CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_points (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_points
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_points();
