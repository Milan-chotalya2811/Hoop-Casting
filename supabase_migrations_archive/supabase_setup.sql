-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE (Extending Supabase Auth)
-- This table mirrors the auth.users table but adds our app-specific fields
create table public.users (
  id uuid references auth.users not null primary key,
  name text not null,
  mobile text unique not null,
  email text unique,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security for Users
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- TALENT PROFILES TABLE
create table public.talent_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  
  -- Personal Details
  gender text,
  dob date,
  city text,
  state text,
  country text default 'India',
  
  -- Physical Details
  height_cm numeric,
  weight_kg numeric,
  chest_in numeric,
  waist_in numeric,
  hips_in numeric,
  skin_tone text,
  hair_color text,
  eye_color text,
  
  -- Professional Details
  category text not null, -- e.g., 'Actor', 'Model', etc.
  years_experience numeric default 0,
  languages text[], -- Array of languages
  skills text[],
  past_work text, -- specialized description
  portfolio_links text[], -- Array of URLs
  
  -- Availability
  interested_in text[], -- e.g., ['Ads', 'Movies']
  willing_to_travel boolean default false,
  
  -- Media (URLs from Storage)
  profile_photo_url text,
  gallery_urls text[],
  intro_video_url text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id)
);

-- Row Level Security for Talent Profiles
alter table public.talent_profiles enable row level security;

create policy "Talent profiles are viewable by everyone."
  on public.talent_profiles for select
  using ( true );

create policy "Users can insert their own talent profile."
  on public.talent_profiles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own talent profile."
  on public.talent_profiles for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own talent profile."
  on public.talent_profiles for delete
  using ( auth.uid() = user_id );

-- ADMIN POLICIES (Access to everything)
-- Note: You need to manually update a user's role to 'admin' in the database to use these.

create policy "Admins can view all users."
  on public.users for select
  using ( 
    exists ( select 1 from public.users where id = auth.uid() and role = 'admin' )
  );

create policy "Admins can update all users."
  on public.users for update
  using ( 
    exists ( select 1 from public.users where id = auth.uid() and role = 'admin' )
  );

create policy "Admins can delete all users."
  on public.users for delete
  using ( 
    exists ( select 1 from public.users where id = auth.uid() and role = 'admin' )
  );
  
-- AUTO-UPDATE TRIGGER
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.talent_profiles
  for each row execute procedure moddatetime (updated_at);
  
-- STORAGE BUCKET SETUP (Execute this via Supabase Dashboard or API if SQL not supported for buckets)
-- insert into storage.buckets (id, name, public) values ('talent-media', 'talent-media', true);

-- STORAGE POLICIES
-- create policy "Media is publicly accessible."
--   on storage.objects for select
--   using ( bucket_id = 'talent-media' );
  
-- create policy "Users can upload their own media."
--   on storage.objects for insert
--   with check ( bucket_id = 'talent-media' and auth.uid() = owner );
  
-- create policy "Users can update their own media."
--   on storage.objects for update
--   with check ( bucket_id = 'talent-media' and auth.uid() = owner );
  
-- create policy "Users can delete their own media."
--   on storage.objects for delete
--   using ( bucket_id = 'talent-media' and auth.uid() = owner );
