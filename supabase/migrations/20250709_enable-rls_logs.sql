"-- Enable Row-Level Security (RLS) on public.logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Allow only authenticated users to SELECT
CREATE POLICY ""Allow authenticated read logs"" ON public.logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only authenticated users to INSERT
CREATE POLICY ""Allow authenticated insert logs"" ON public.logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to UPDATE
CREATE POLICY ""Allow authenticated update logs"" ON public.logs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only authenticated users to DELETE
CREATE POLICY ""Allow authenticated delete logs"" ON public.logs
  FOR DELETE USING (auth.role() = 'authenticated');
"
