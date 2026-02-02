-- Add unique constraint to user_id in talent_profiles to prevent duplicates
ALTER TABLE public.talent_profiles 
ADD CONSTRAINT talent_profiles_user_id_key UNIQUE (user_id);

-- Optionally drop the problematic foreign key if it's incorrect regardless of uniqueness, 
-- BUT 'talent_profiles_user_id_fkey' sounds like the standard FK to public.users(id).
-- The error "insert or update on table... violates foreign key constraint" usually means
-- either:
-- 1. Inserting a user_id that doesn't exist in 'users' table.
-- 2. Inserting a record with a user_id that conflicts with another record IF it was a unique constraint,
--    but the error says 'violates foreign key constraint', which points to #1.
-- HOWEVER, if the user says "don't show this error in user page", it might be an UPSERT issue
-- where it tries to INSERT instead of UPDATE for an existing user_id.

-- Let's ensure 'user_id' is unique so UPSERT works correctly via ON CONFLICT (user_id).
