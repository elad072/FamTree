-- Family Members RLS Policies
-- Drop existing policies
drop policy if exists "Allow authenticated users to read family members" on public.family_members;
drop policy if exists "Allow authenticated users to insert/update family members" on public.family_members;
drop policy if exists "Allow anon users to insert/update family members" on public.family_members;
drop policy if exists "Members can view approved" on public.family_members;
drop policy if exists "Authenticated users can insert" on public.family_members;
drop policy if exists "Admins full access" on public.family_members;

-- SELECT: Approved users see approved members, Admins see ALL (including pending)
create policy "Users can view family members" on public.family_members
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
create policy "Approved users can insert members" on public.family_members
  for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_approved = true
    )
  );

-- UPDATE: Only admins can update
create policy "Admins can update members" on public.family_members
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- DELETE: Only admins can delete
create policy "Admins can delete members" on public.family_members
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
