"-- Enable Row-Level Security (RLS) on public.messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow only authenticated users to SELECT
CREATE POLICY ""Allow authenticated read messages"" ON public.messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only authenticated users to INSERT
CREATE POLICY ""Allow authenticated insert messages"" ON public.messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to UPDATE
CREATE POLICY ""Allow authenticated update messages"" ON public.messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only authenticated users to DELETE
CREATE POLICY ""Allow authenticated delete messages"" ON public.messages
  FOR DELETE USING (auth.role() = 'authenticated');
"
