-- ============================================
-- SUPABASE FAMILY_MEMBERS TABLE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS public.family_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  image_url TEXT,
  story_images JSONB DEFAULT '[]',
  birth_year INTEGER,
  birth_month INTEGER,
  birth_day INTEGER,
  birth_date TEXT,
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

-- Step 2: Enable Row Level Security
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow authenticated users to read family members" ON public.family_members;
DROP POLICY IF EXISTS "Allow authenticated users to insert/update family members" ON public.family_members;
DROP POLICY IF EXISTS "Allow anon users to insert/update family members" ON public.family_members;

-- Step 4: Create RLS Policies
CREATE POLICY "Allow authenticated users to read family members" 
ON public.family_members FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to insert/update family members" 
ON public.family_members FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- TEMPORARY: Allow anon users (REMOVE THIS AFTER TESTING)
CREATE POLICY "Allow anon users to insert/update family members" 
ON public.family_members FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_members_status ON public.family_members(status);
CREATE INDEX IF NOT EXISTS idx_family_members_father_id ON public.family_members(father_id);
CREATE INDEX IF NOT EXISTS idx_family_members_mother_id ON public.family_members(mother_id);
CREATE INDEX IF NOT EXISTS idx_family_members_spouse_id ON public.family_members(spouse_id);

-- Step 6: Verify table creation
SELECT 
    'Table created successfully!' as message,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'family_members' AND table_schema = 'public';

-- Step 7: Insert test data (optional)
INSERT INTO public.family_members (
    id,
    name,
    status,
    created_date,
    updated_date
) VALUES (
    'test-001',
    'Test Family Member',
    'approved',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 8: Verify test data
SELECT * FROM public.family_members WHERE id = 'test-001';
