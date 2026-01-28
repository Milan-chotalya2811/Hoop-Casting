-- FIX: Admin Data Visibility
-- This script explicitly grants View (SELECT) permissions to Admins for the talent_profiles table.
-- Without this, Admins cannot see profiles that belong to other users due to RLS.

-- 1. Reset/Ensure RLS is enabled
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential conflicting policies to ensure a clean slate for Read access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.talent_profiles;

-- 3. Create the Admin View Policy
-- This policy allows a user to SELECT rows from talent_profiles IF:
-- They are the owner (user_id = auth.uid()) OR
-- They have an 'admin' or 'super_admin' role in the public.users table.

CREATE POLICY "Admins can view all profiles"
ON public.talent_profiles FOR SELECT
USING (
    -- User can see their own
    auth.uid() = user_id 
    OR 
    -- Admins can see everyone's
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- 4. Ensure Users Table is readable (needed for the admin check above)
-- We previously set this to public, but let's reinforce it safely.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.users FOR SELECT 
USING (true);

-- 5. Notify to reload schema cache
NOTIFY pgrst, 'reload config';
