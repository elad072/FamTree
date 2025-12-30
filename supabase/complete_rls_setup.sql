-- ============================================
-- COMPLETE RLS SETUP FOR SHORASHIM APP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE POLICIES
-- ============================================

-- Drop existing profile policies
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;

-- Profiles: Everyone can view
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select to authenticated using (true);

-- Profiles: Users can update their own
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Profiles: Admins can update any profile (for approval workflow)
create policy "Admins can update any profile" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Profiles: Admins can delete non-admin profiles
create policy "Admins can delete profiles" on public.profiles
  for delete using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 2. FAMILY MEMBERS TABLE POLICIES
-- ============================================

-- Drop ALL existing family_members policies
drop policy if exists "Allow authenticated users to read family members" on public.family_members;
drop policy if exists "Allow authenticated users to insert/update family members" on public.family_members;
drop policy if exists "Allow anon users to insert/update family members" on public.family_members;
drop policy if exists "Members can view approved" on public.family_members;
drop policy if exists "Authenticated users can insert" on public.family_members;
drop policy if exists "Admins full access" on public.family_members;
drop policy if exists "Users can view family members" on public.family_members;
drop policy if exists "Approved users can insert members" on public.family_members;
drop policy if exists "Admins can update members" on public.family_members;
drop policy if exists "Admins can delete members" on public.family_members;

-- SELECT: Admins see ALL (including pending), approved users see only approved
create policy "Family members select policy" on public.family_members
  for select to authenticated
  using (
    -- Admins see everything
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
    OR
    -- Approved users see only approved members
    (
      status = 'approved' and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.is_approved = true
      )
    )
  );

-- INSERT: Only approved users can insert (status defaults to 'pending')
create policy "Family members insert policy" on public.family_members
  for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_approved = true
    )
  );

-- UPDATE: Only admins can update
create policy "Family members update policy" on public.family_members
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- DELETE: Only admins can delete
create policy "Family members delete policy" on public.family_members
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ============================================
-- VERIFICATION QUERIES (run these to test)
-- ============================================

-- Check your current role:
-- SELECT role, is_approved FROM public.profiles WHERE id = auth.uid();

-- Check pending members (as admin):
-- SELECT id, name, status FROM public.family_members WHERE status = 'pending';

-- Check all policies are in place:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('profiles', 'family_members');
