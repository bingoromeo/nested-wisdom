"-- Enable Row-Level Security (RLS) on public.frameworks
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;

-- Allow only authenticated users to SELECT
CREATE POLICY ""Allow authenticated read frameworks"" ON public.frameworks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only authenticated users to INSERT
CREATE POLICY ""Allow authenticated insert frameworks"" ON public.frameworks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to UPDATE
CREATE POLICY ""Allow authenticated update frameworks"" ON public.frameworks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only authenticated users to DELETE
CREATE POLICY ""Allow authenticated delete frameworks"" ON public.frameworks
  FOR DELETE USING (auth.role() = 'authenticated');
"
