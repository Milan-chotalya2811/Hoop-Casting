-- COMPLETE ADMIN FIX
-- This script does everything: Adds missing columns AND fixes permissions.
-- Run this SINGLE script in the Supabase SQL Editor to fix all "column does not exist" and permission errors.

-- ==============================================================================
-- PART 1: SCHEMA UPDATES (Add Missing Columns)
-- ==============================================================================

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

-- 4. Make 'user_id' nullable
-- If Admins create talents without an account, user_id must be nullable.
ALTER TABLE public.talent_profiles 
ALTER COLUMN user_id DROP NOT NULL;


-- ==============================================================================
-- PART 2: PERMISSIONS & SECURITY (Fix RLS)
-- ==============================================================================

-- 5. Create a secure function to check if the current user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the database owner,
-- bypassing RLS on the 'public.users' table to avoid "infinite recursion".
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update 'talent_profiles' Policies
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old/conflicting policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Public View Active Only" ON public.talent_profiles;
DROP POLICY IF EXISTS "Admins View All / Users View Own" ON public.talent_profiles;
DROP POLICY IF EXISTS "Public View Active" ON public.talent_profiles;

-- Allow Admins to View ALL, Users to View OWN
CREATE POLICY "Admins View All / Users View Own"
ON public.talent_profiles FOR SELECT
USING (
    is_admin() 
    OR 
    (auth.uid() = user_id)
);

-- Allow Public to View Active & Non-Deleted
CREATE POLICY "Public View Active"
ON public.talent_profiles FOR SELECT
USING (
    is_hidden = false 
    AND deleted_at IS NULL
);

-- Allow Admins to INSERT/UPDATE/DELETE everything
CREATE POLICY "Admins Manage All"
ON public.talent_profiles FOR ALL
USING ( is_admin() );

-- Allow Users to Update their OWN
CREATE POLICY "Users Update Own"
ON public.talent_profiles FOR UPDATE
USING ( auth.uid() = user_id );

-- 7. Update 'users' Policies
-- Admins need to join with the users table to see names/emails.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin View Users" ON public.users;
DROP POLICY IF EXISTS "Admins View All Users" ON public.users;

CREATE POLICY "Admin View Users"
ON public.users FOR SELECT
USING (
    is_admin() 
    OR 
    id = auth.uid()
);

-- 8. Reload Schema Cache
NOTIFY pgrst, 'reload config';
