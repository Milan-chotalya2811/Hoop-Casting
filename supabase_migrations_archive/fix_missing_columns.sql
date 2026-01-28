-- FIX: Add Missing Admin Columns
-- The admin panel relies on 'is_hidden' and 'deleted_at' columns which were missing in the initial schema.
-- This script adds them safely.

-- 1. Add 'is_hidden' column (default to false)
ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

-- 2. Add 'deleted_at' column (timestamp for soft deletes)
ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- 3. Add 'internal_name' and 'internal_email' for admin-created talents (orphans)
-- These allow admins to create talent profiles without a linked Auth User initially.
ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS internal_name text,
ADD COLUMN IF NOT EXISTS internal_email text,
ADD COLUMN IF NOT EXISTS internal_mobile text;

-- 4. Make 'user_id' nullable? 
-- The original schema has "user_id uuid references public.users(id) on delete cascade not null".
-- If Admins create talents without an account, user_id must be nullable.
ALTER TABLE public.talent_profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload config';
