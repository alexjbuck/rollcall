-- RollCall initial schema with strict multi-tenant RLS
-- This migration creates tables, indexes, helper functions and RLS policies
-- to enforce organization isolation and role-based access.

-- Extensions
create extension if not exists pgcrypto;

-- Helper will be defined after dependent tables are created

-- Organizations (multi-tenant support)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- User profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  full_name text,
  role text check (role in ('admin', 'member')) default 'member',
  created_at timestamptz default now()
);

-- Drill events (define requirements)
create table if not exists public.drill_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  location text,
  start_date date not null,
  end_date date not null,
  created_by uuid references public.profiles(id),
  is_mandatory boolean default true,
  minimum_days_required integer,
  reminder_days integer default 7,
  created_at timestamptz default now(),
  constraint valid_date_range check (end_date >= start_date)
);

-- User availability (completely independent from drill events)
create table if not exists public.user_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  available_date date not null,
  notes text,
  marked_at timestamptz default now(),
  unique(user_id, available_date)
);

-- Invitations for new users
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  role text check (role in ('admin', 'member')) default 'member',
  invited_by uuid references public.profiles(id),
  token uuid default gen_random_uuid() unique,
  used boolean default false,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- Helper: check if current user is admin of given organization
create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.organization_id = org_id
      and p.role = 'admin'
  );
$$;

-- Indexes for performance
create index if not exists idx_user_availability_date on public.user_availability(available_date);
create index if not exists idx_user_availability_user_date on public.user_availability(user_id, available_date);
create index if not exists idx_drill_events_dates on public.drill_events(start_date, end_date);
create index if not exists idx_profiles_org on public.profiles(organization_id);
create index if not exists idx_org_name on public.organizations(lower(name));
create index if not exists idx_invitations_org_email on public.invitations(organization_id, lower(email));

-- Attendance analysis: compute overlap at query time
create or replace function public.get_drill_attendance(drill_id uuid)
returns table (
  user_id uuid,
  user_email text,
  user_name text,
  days_attending integer,
  total_drill_days integer,
  attendance_dates date[],
  meets_requirement boolean
)
language plpgsql
as $$
begin
  return query
  with drill_info as (
    select id,
           organization_id,
           start_date,
           end_date,
           minimum_days_required,
           (end_date - start_date + 1) as total_days
    from public.drill_events
    where id = drill_id
  ),
  user_attendance as (
    select p.id as user_id,
           p.email,
           coalesce(p.full_name, p.email) as full_name,
           count(ua.available_date) as days_attending,
           array_agg(ua.available_date order by ua.available_date) as attendance_dates
    from public.profiles p
    cross join drill_info di
    left join public.user_availability ua
      on ua.user_id = p.id
     and ua.available_date between di.start_date and di.end_date
     and ua.organization_id = di.organization_id
    where p.organization_id = di.organization_id
    group by p.id, p.email, p.full_name
  )
  select ua.*, di.total_days,
         case when di.minimum_days_required is null then true
              when ua.days_attending >= di.minimum_days_required then true
              else false end as meets_requirement
  from user_attendance ua
  cross join drill_info di;
end;
$$;

-- Enable Row Level Security
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.drill_events enable row level security;
alter table public.user_availability enable row level security;
alter table public.invitations enable row level security;

-- RLS: Organizations
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.organization_id = organizations.id
  )
);

drop policy if exists org_insert on public.organizations;
create policy org_insert on public.organizations
for insert to authenticated
with check (true);

drop policy if exists org_update on public.organizations;
create policy org_update on public.organizations
for update to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

drop policy if exists org_delete on public.organizations;
create policy org_delete on public.organizations
for delete to authenticated
using (public.is_org_admin(id));

-- RLS: Profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select using (
  exists (
    select 1 from public.profiles me
    where me.id = auth.uid()
      and me.organization_id = profiles.organization_id
  )
);

drop policy if exists profiles_insert on public.profiles;
-- Typically handled via trigger. Allow self-insert only as fallback.
create policy profiles_insert on public.profiles
for insert to authenticated
with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update to authenticated
using (
  id = auth.uid() or public.is_org_admin(organization_id)
)
with check (
  id = auth.uid() or public.is_org_admin(organization_id)
);

-- Disallow deletes by default (no delete policy)

-- RLS: Drill events
drop policy if exists drills_select on public.drill_events;
create policy drills_select on public.drill_events
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.organization_id = drill_events.organization_id
  )
);

drop policy if exists drills_mutate on public.drill_events;
create policy drills_mutate on public.drill_events
for all to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

-- RLS: User availability
drop policy if exists availability_select on public.user_availability;
create policy availability_select on public.user_availability
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.organization_id = user_availability.organization_id
  )
);

drop policy if exists availability_insert on public.user_availability;
create policy availability_insert on public.user_availability
for insert to authenticated
with check (
  (
    user_id = auth.uid() and
    organization_id = (
      select organization_id from public.profiles where id = auth.uid()
    )
  ) or public.is_org_admin(organization_id)
);

drop policy if exists availability_update on public.user_availability;
create policy availability_update on public.user_availability
for update to authenticated
using (
  user_id = auth.uid() or public.is_org_admin(organization_id)
)
with check (
  user_id = auth.uid() or public.is_org_admin(organization_id)
);

drop policy if exists availability_delete on public.user_availability;
create policy availability_delete on public.user_availability
for delete to authenticated
using (
  user_id = auth.uid() or public.is_org_admin(organization_id)
);

-- RLS: Invitations (admin-only within org)
drop policy if exists invitations_select on public.invitations;
create policy invitations_select on public.invitations
for select to authenticated
using (public.is_org_admin(organization_id));

drop policy if exists invitations_mutate on public.invitations;
create policy invitations_mutate on public.invitations
for all to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

-- Optional: profile bootstrap trigger when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

