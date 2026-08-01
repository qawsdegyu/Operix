-- ==============================================================================
-- OBAREX CMS — DATABASE INITIALIZATION SCRIPT
-- ==============================================================================
-- Run this script in your Supabase SQL Editor.
-- WARNING: This script intentionally disables RLS for easy Admin Dashboard integration using the Anon Key.
-- Once testing is complete, it is highly recommended to enable RLS and require Supabase Auth.

-- 1. SITE CONTENT TABLE
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text UNIQUE NOT NULL,
  content_value text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_content DISABLE ROW LEVEL SECURITY;

-- Insert default site content
INSERT INTO public.site_content (section_key, content_value) VALUES
('hero_title', 'Engineering the Future of Autonomous Operations.'),
('hero_subtitle', 'We build intelligent systems that scale.'),
('hero_btn_primary', 'Initialize Project ➔'),
('hero_btn_secondary', 'View Systems'),
('engine_room_eyebrow', '// the engine room'),
('engine_room_title', 'Systems we engineer.'),
('engine_room_subtitle', 'From autonomous AI agents to self-running infrastructure — precision-built for infinite scale.'),
('portfolio_eyebrow', '// DEPLOYED SYSTEMS'),
('portfolio_title', 'Featured work.'),
('portfolio_subtitle', 'Architectures currently running in production environments.'),
('metrics_eyebrow', '// proof of execution'),
('metrics_title', 'Measured in results.'),
('metrics_subtitle', 'Real systems. Real numbers. Real impact.')
ON CONFLICT (section_key) DO UPDATE SET content_value = EXCLUDED.content_value;


-- 2. SERVICES (Engine Room Bento Cards)
CREATE TABLE IF NOT EXISTS public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb NOT NULL,
  icon_svg text NOT NULL,
  theme_class text,
  visual_html text, -- HTML for the visual section
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- Insert default services
INSERT INTO public.services (title, description, tags, icon_svg, theme_class, visual_html, order_index) VALUES
(
  'Autonomous AI & RAG Systems', 
  'Custom-trained AI agents powered by <span class="highlight">Retrieval-Augmented Generation</span>. We build intelligent <span class="highlight">WhatsApp automation</span> pipelines, knowledge-base assistants, and multi-model AI systems that understand your business context.', 
  '["RAG", "WhatsApp API", "OpenAI", "Vector DB"]', 
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
  'card-ai',
  '<div class="ai-visual"><div class="chat-bubble user-bubble">Extract key metrics from Q3 report.</div><div class="chat-bubble ai-bubble"><span class="ai-typing"></span><span class="ai-text">Vector search complete. Q3 revenue increased by 22% with a 15% reduction in CAC.</span></div></div>',
  1
),
(
  'High-Performance Web Architecture', 
  'Scalable platforms, SaaS products, and real-time dashboards. Sub-second loads. Zero layout shift. Built to convert.', 
  '["Next.js", "Tailwind", "Supabase", "React"]', 
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>', 
  'card-web',
  '<div class="perf-visual"><div class="perf-bar b1"></div><div class="perf-bar b2"></div><div class="perf-bar b3"></div></div>',
  2
),
(
  'Process Automation & Ops', 
  'Replacing manual workflows with autonomous nodes. We orchestrate data across your entire software stack.', 
  '["n8n", "Zapier", "Webhooks", "Node.js"]', 
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', 
  'card-auto',
  '<div class="auto-visual"><div class="node n1"></div><div class="node n2"></div><div class="node n3"></div><svg class="node-line"><path d="M40,50 L100,20 L160,50" stroke="rgba(255,255,255,0.2)" fill="none" stroke-width="2"/></svg></div>',
  3
);


-- 3. PROJECTS (Featured Work)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  badge_text text,
  theme_class text NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb NOT NULL,
  link_url text DEFAULT '#',
  visual_html text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Insert default projects
INSERT INTO public.projects (title, description, badge_text, theme_class, tags, visual_html, order_index) VALUES
(
  'Murshid AI', 
  'Autonomous legal assistant powered by advanced RAG. Capable of analyzing thousands of legal documents in seconds.', 
  'AI RAG Agent', 
  'pf-murshid', 
  '["OpenAI", "Pinecone", "LangChain", "Next.js"]',
  '<div class="pf-visual-bg"><div class="abs-ai"><div class="abs-node n1"></div><div class="abs-node n2"></div><div class="abs-node n3"></div></div></div>',
  1
),
(
  'AGS Architecture', 
  'Full-stack automated governance platform with RBAC dashboards and compliance automation.', 
  'Enterprise System', 
  'pf-ags', 
  '["Next.js", "PostgreSQL", "RBAC", "n8n"]',
  '<div class="pf-visual-bg"><div class="abs-grid"><div class="ag-box b1"></div><div class="ag-box b2"></div><div class="ag-box b3"></div><div class="ag-box b4"></div></div></div>',
  2
),
(
  'SanaSkills System', 
  'AI-powered adaptive learning with personalized paths, skill assessments, and analytics.', 
  'Learning Platform', 
  'pf-sana', 
  '["React", "Node.js", "AI/ML", "MongoDB"]',
  '<div class="pf-visual-bg"><div class="abs-wave"><div class="aw-bar w1"></div><div class="aw-bar w2"></div><div class="aw-bar w3"></div><div class="aw-bar w4"></div><div class="aw-bar w5"></div></div></div>',
  3
);


-- 4. METRICS (Measured in results)
CREATE TABLE IF NOT EXISTS public.metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  target_value integer NOT NULL,
  suffix text,
  theme_class text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.metrics DISABLE ROW LEVEL SECURITY;

-- Insert default metrics
INSERT INTO public.metrics (label, target_value, suffix, theme_class, order_index) VALUES
('Hours Automated', 10000, '+', 'm-emerald', 1),
('Architectures Deployed', 50, '+', 'm-blue', 2),
('Workflows Running', 200, '+', 'm-purple', 3),
('Place - Vision jo Startup', 2, 'nd', 'm-gold', 4);


-- 5. LEADS (Intake Form Submissions)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_name text NOT NULL,
  corporate_entity text NOT NULL,
  operator_email text NOT NULL,
  budget_range text,
  system_specs text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- 6. TEAM MEMBERS (The Architects)
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb NOT NULL,
  linkedin_url text,
  github_url text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Insert default team members
INSERT INTO public.team_members (name, role, description, image_url, tags, linkedin_url, github_url, order_index) VALUES
(
  'Abdelrahman Al-Salhout', 
  'Founder & AI Systems Engineer', 
  'Architecting complex RAG agents, autonomous business pipelines, and core automation infrastructure.', 
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=800&h=500',
  '["RAG AI", "n8n Architecture", "Operations Scaling"]'::jsonb,
  '#',
  '#',
  1
),
(
  'Abdallah Tahat',
  'Lead Web Application Designer / Partner',
  'Designing high-performance, conversion-optimized user interfaces and seamless digital experiences.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800&h=500',
  '["UI/UX Vision", "Frontend Architecture", "System Design"]'::jsonb,
  '#',
  '#',
  2
);

-- ==========================================
-- 7. AI & RAG SYSTEM (pgvector)
-- ==========================================

-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Document Library Metadata (Files uploaded by admin)
CREATE TABLE IF NOT EXISTS public.rag_library (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL,
  size_bytes bigint NOT NULL,
  chunk_count integer DEFAULT 0,
  status text DEFAULT 'Indexed',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rag_library DISABLE ROW LEVEL SECURITY;

-- Vector Store (Text chunks and their embeddings)
CREATE TABLE IF NOT EXISTS public.rag_vectors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.rag_library(id) ON DELETE CASCADE,
  filename text NOT NULL,
  content text NOT NULL,
  embedding vector(1536) NOT NULL, -- 1536 is the dimension for OpenAI text-embedding-3-small
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rag_vectors DISABLE ROW LEVEL SECURITY;

-- Create an index for faster similarity searches (Cosine Similarity)
CREATE INDEX ON public.rag_vectors USING hnsw (embedding vector_cosine_ops);

-- Similarity Search Function (Called via Supabase RPC)
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  filename text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_vectors.id,
    rag_vectors.document_id,
    rag_vectors.filename,
    rag_vectors.content,
    1 - (rag_vectors.embedding <=> query_embedding) AS similarity
  FROM rag_vectors
  WHERE 1 - (rag_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
