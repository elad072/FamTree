-- Create a table for family members
CREATE TABLE IF NOT EXISTS public.family_members (
  id TEXT PRIMARY KEY, -- Using TEXT to accommodate the IDs from the JSON backup
  name TEXT NOT NULL,
  nickname TEXT,
  image_url TEXT,
  story_images JSONB DEFAULT '[]',
  birth_year INTEGER,
  birth_month INTEGER,
  birth_day INTEGER,
  birth_date TEXT, -- Keeping as text since some values might not be valid ISO dates
  death_year INTEGER,
  death_month INTEGER,
  death_day INTEGER,
  death_date TEXT,
  birth_place TEXT,
  birth_place_notes TEXT,
  life_story TEXT,
  childhood_stories JSONB DEFAULT '[]',
  father_id TEXT,
  mother_id TEXT,
  spouse_id TEXT,
  unlinked_spouse_name TEXT,
  marital_status TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'approved',
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_id TEXT,
  created_by TEXT,
  is_sample BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read data
CREATE POLICY "Allow authenticated users to read family members" 
ON public.family_members FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to insert/update (for the import script and later features)
CREATE POLICY "Allow authenticated users to insert/update family members" 
ON public.family_members FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- TEMPORARY: Allow anon users to insert (USE ONLY FOR INITIAL IMPORT)
CREATE POLICY "Allow anon users to insert/update family members" 
ON public.family_members FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Create storage bucket for family images
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-images', 'family-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'family-images');

CREATE POLICY "Allow All for Authenticated" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'family-images');

CREATE POLICY "Allow All for Anon (TEMPORARY)" ON storage.objects
  FOR ALL TO anon USING (bucket_id = 'family-images');
