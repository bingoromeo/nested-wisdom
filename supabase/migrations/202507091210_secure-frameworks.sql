-- Enable RLS for public.frameworks
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow any authenticated user to read frameworks
CREATE POLICY "Users can view frameworks"
  ON public.frameworks
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only allow admins to insert/update/delete
CREATE POLICY "Admins manage frameworks"
  ON public.frameworks
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
