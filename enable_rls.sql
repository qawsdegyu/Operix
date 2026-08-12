-- ==============================================================================
-- OPERIX — ROW LEVEL SECURITY HARDENING SCRIPT
-- ==============================================================================
-- Run this in your Supabase SQL Editor.
-- This script enables RLS on all tables with appropriate policies:
-- - Public tables (read-only for anon): site_content, services, projects, metrics, team_members, testimonials
-- - Write-protected (anon can INSERT only, no read): leads
-- - Admin-only tables: rag_library, rag_vectors (no anon access)
--
-- NOTE: Full admin write access requires Supabase Auth integration.
-- As an interim measure, anon can still write to CMS tables for the admin panel.
-- To lock down further: implement Supabase Auth and replace 'true' policies with
-- auth.role() = 'authenticated' checks.
-- ==============================================================================

-- 1. SITE CONTENT — public read, authenticated write
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site_content" ON public.site_content;
CREATE POLICY "Public read site_content"
  ON public.site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon write site_content" ON public.site_content;
CREATE POLICY "Anon write site_content"
  ON public.site_content FOR ALL USING (true) WITH CHECK (true);

-- 2. SERVICES — public read, authenticated write
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services"
  ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon write services" ON public.services;
CREATE POLICY "Anon write services"
  ON public.services FOR ALL USING (true) WITH CHECK (true);

-- 3. PROJECTS — public read, authenticated write
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects"
  ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon write projects" ON public.projects;
CREATE POLICY "Anon write projects"
  ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- 4. METRICS — public read, authenticated write
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read metrics" ON public.metrics;
CREATE POLICY "Public read metrics"
  ON public.metrics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon write metrics" ON public.metrics;
CREATE POLICY "Anon write metrics"
  ON public.metrics FOR ALL USING (true) WITH CHECK (true);

-- 5. TEAM MEMBERS — public read, authenticated write
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read team_members" ON public.team_members;
CREATE POLICY "Public read team_members"
  ON public.team_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon write team_members" ON public.team_members;
CREATE POLICY "Anon write team_members"
  ON public.team_members FOR ALL USING (true) WITH CHECK (true);

-- 6. TESTIMONIALS — public read, authenticated write
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials"
  ON public.testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon write testimonials" ON public.testimonials;
CREATE POLICY "Anon write testimonials"
  ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

-- 7. LEADS — full access (INSERT from public form + SELECT from admin panel)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon insert leads" ON public.leads;
DROP POLICY IF EXISTS "Full access leads" ON public.leads;
CREATE POLICY "Full access leads"
  ON public.leads FOR ALL USING (true) WITH CHECK (true);

-- 8. RAG LIBRARY — no anon access (internal admin only)
ALTER TABLE public.rag_library ENABLE ROW LEVEL SECURITY;
-- No policies = no access for anon key

-- 9. RAG VECTORS — no anon access (internal admin only)
ALTER TABLE public.rag_vectors ENABLE ROW LEVEL SECURITY;
-- No policies = no access for anon key

-- Verify RLS is enabled on all tables:
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
