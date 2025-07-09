-- supabase/migrations/20250709_enable-rls.sql

-- ✅ Enable Row Level Security (RLS) on public.frameworks
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;

-- ✅ Allow authenticated users to SELECT from public.frameworks
CREATE POLICY "Authenticated users can view frameworks"
  ON public.frameworks
  FOR SELECT
  TO authenticated
  USING (true);

-- 📌 You can adjust future rules here, e.g. INSERT/UPDATE with conditions like auth.uid() = user_id;
-- Example:
-- CREATE POLICY "Insert own records" ON public.frameworks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Update own records" ON public.frameworks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ✅ Done.
