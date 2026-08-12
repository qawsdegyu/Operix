-- Create Testimonials Table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote TEXT NOT NULL,
  quote_ar TEXT,
  author_name TEXT NOT NULL,
  author_name_ar TEXT,
  author_role TEXT NOT NULL,
  author_role_ar TEXT,
  project_link TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on testimonials"
  ON public.testimonials
  FOR SELECT
  USING (true);

-- Allow authenticated users to perform all actions
CREATE POLICY "Allow authenticated users full access on testimonials"
  ON public.testimonials
  FOR ALL
  USING (auth.role() = 'authenticated');
