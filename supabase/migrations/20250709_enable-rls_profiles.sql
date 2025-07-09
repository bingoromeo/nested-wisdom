"-- Enable Row-Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow only authenticated users to SELECT
CREATE POLICY ""Allow authenticated read profiles"" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only authenticated users to INSERT
CREATE POLICY ""Allow authenticated insert profiles"" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to UPDATE
CREATE POLICY ""Allow authenticated update profiles"" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only authenticated users to DELETE
CREATE POLICY ""Allow authenticated delete profiles"" ON public.profiles
  FOR DELETE USING (auth.role() = 'authenticated');
"
