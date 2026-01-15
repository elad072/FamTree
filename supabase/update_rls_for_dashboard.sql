-- Update RLS policies to allow users to update members they created
drop policy if exists "Admins can update members" on public.family_members;

create policy "Admins and creators can update members" on public.family_members
  for update to authenticated
  using (
    -- Admins can update anything
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
    OR
    -- Creators can update their own entries
    (created_by_id = auth.uid()::text)
  );

-- Also update SELECT policy to allow creators to see their own pending members
drop policy if exists "Users can view family members" on public.family_members;

create policy "Users can view family members" on public.family_members
  for select to authenticated
  using (
    -- Admins see everything
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
    OR
    -- Creators see their own entries (even if pending)
    (created_by_id = auth.uid()::text)
    OR
    -- Approved users see only approved members
    (
      status = 'approved' and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.is_approved = true
      )
    )
  );
