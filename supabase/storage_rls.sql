-- ============================================
-- STORAGE RLS SETUP FOR SHORASHIM APP
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-images', 'family-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing storage policies for this bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow All for Authenticated" ON storage.objects;
DROP POLICY IF EXISTS "Allow All for Anon (TEMPORARY)" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete images" ON storage.objects;

-- 3. Create new, robust policies

-- SELECT: Everyone can view images (since it's a public bucket)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'family-images');

-- INSERT: Any approved user can upload images
CREATE POLICY "Allow approved users to upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'family-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_approved = true
    )
  );

-- UPDATE: Users can update their own uploads, or admins can update anything
CREATE POLICY "Allow users to update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'family-images' AND
    (
      owner = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );

-- DELETE: Only admins can delete images
CREATE POLICY "Allow admins to delete images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'family-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
