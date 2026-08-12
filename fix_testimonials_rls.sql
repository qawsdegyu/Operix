-- Fix RLS to allow anon inserts since admin panel has no auth yet
DROP POLICY IF EXISTS "Allow authenticated users full access on testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow all actions for everyone" ON public.testimonials;

CREATE POLICY "Allow all actions for everyone"
  ON public.testimonials
  FOR ALL
  USING (true)
  WITH CHECK (true);
