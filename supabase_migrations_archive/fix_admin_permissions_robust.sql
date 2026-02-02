-- ROBUST ADMIN FIX using SECURITY DEFINER
-- This bypasses RLS recursion issues by using a privileged function to check roles.

-- 1. Create a secure function to check if the current user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the database owner,
-- bypassing RLS on the 'public.users' table safely.
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

-- 2. Update 'talent_profiles' Policies
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.talent_profiles;
DROP POLICY IF EXISTS "Public View Active Only" ON public.talent_profiles;

-- Allow Admins to View ALL, Users to View OWN
CREATE POLICY "Admins View All / Users View Own"
ON public.talent_profiles FOR SELECT
USING (
    is_admin() 
    OR 
    auth.uid() = user_id
);

-- Note: We also need a policy for 'Public' to view active profiles if that's a requirement for the main site?
-- Assuming yes, but let's separate it.
CREATE POLICY "Public View Active"
ON public.talent_profiles FOR SELECT
USING (
    is_hidden = false 
    AND deleted_at IS NULL
);


-- 3. Update 'users' Policies
-- Admins need to join with the users table to see names/emails.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;

CREATE POLICY "Admins View All Users"
ON public.users FOR SELECT
USING (
    is_admin() 
    OR 
    id = auth.uid()
);

-- If you need public profiles to display user names (e.g. for the public talent page), enable this:
-- CREATE POLICY "Public can view basic user info" ... (Skipping for now to prioritize Admin Security)


-- 4. Reload configuration
NOTIFY pgrst, 'reload config';
