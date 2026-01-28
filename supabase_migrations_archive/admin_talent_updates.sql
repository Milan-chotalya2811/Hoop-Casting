-- Make user_id nullable to allow admin-created profiles without auth accounts
ALTER TABLE public.talent_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Add internal fields for admin-created profiles
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS internal_name text;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS internal_email text;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS internal_mobile text;
