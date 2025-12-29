-- 1. Ensure the profiles table exists with the correct columns
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text default 'member' check (role in ('admin', 'member')),
  is_approved boolean default false,
  full_name text,
  email text,
  created_at timestamp with time zone default now()
);

-- Ensure the is_approved column exists even if table was created previously
alter table public.profiles add column if not exists is_approved boolean default false;

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Basic RLS Policies
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select to authenticated using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 4. Robust Trigger Function
create or replace function public.handle_new_user()
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
declare
  is_first_user boolean;
begin
  -- Use EXISTS for better performance and safety
  select not exists (select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, full_name, email, role, is_approved)
  values (
    new.id, 
    coalesce(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      new.raw_user_meta_data->>'display_name',
      'משתמש חדש'
    ), 
    new.email, 
    case when is_first_user then 'admin' else 'member' end,
    is_first_user -- First user is auto-approved
  )
  on conflict (id) do nothing; -- Prevent errors if profile already exists

  return new;
end;
$$;

-- 5. Re-create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. CRITICAL: Sync existing users who don't have a profile yet
-- This handles users created before the trigger was properly set up
insert into public.profiles (id, full_name, email, role, is_approved)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'משתמש חדש'), 
  email, 
  case when (select count(*) from public.profiles where role = 'admin') = 0 then 'admin' else 'member' end,
  case when (select count(*) from public.profiles where role = 'admin') = 0 then true else false end
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- 7. Ensure at least one admin exists (if somehow missed)
update public.profiles 
set role = 'admin', is_approved = true 
where id = (select id from public.profiles order by created_at asc limit 1)
and not exists (select 1 from public.profiles where role = 'admin');
