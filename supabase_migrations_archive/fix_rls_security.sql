-- Instructions:
-- Run this script in the Supabase SQL Editor to fix the "RLS Disabled" security warnings.

-- 1. Enable Row Level Security on the 'users' table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Ensure RLS is enabled on other sensitive tables as well (just in case)
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
