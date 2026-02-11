
CREATE OR REPLACE FUNCTION public.get_monthly_affiliate_ranking()
RETURNS TABLE (
  rank_position bigint,
  affiliate_name text,
  affiliate_code text,
  sales_count bigint,
  total_commission numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY COUNT(s.id) DESC, SUM(s.commission_amount) DESC) as rank_position,
    LEFT(p.name, 1) || '***' as affiliate_name,
    a.affiliate_code,
    COUNT(s.id) as sales_count,
    COALESCE(SUM(s.commission_amount), 0) as total_commission
  FROM affiliates a
  JOIN profiles p ON p.user_id = a.user_id
  LEFT JOIN affiliate_sales s ON s.affiliate_id = a.id
    AND s.status = 'paid'
    AND s.created_at >= date_trunc('month', now())
  WHERE a.is_active = true
  GROUP BY a.id, a.affiliate_code, p.name
  HAVING COUNT(s.id) > 0
  ORDER BY sales_count DESC, total_commission DESC
  LIMIT 10;
$$;
