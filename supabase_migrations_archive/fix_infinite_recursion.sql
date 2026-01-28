-- FIX INFINITE RECURSION IN POLICIES
-- The recursion happens because the policy "Super Admins can view all users" selects from 'public.users' 
-- to check if the current user is a super admin. This check itself triggers the policy again, 
-- creating an infinite loop.

-- Solution: We should NOT query the 'public.users' table inside the policy for 'public.users'.
-- Instead, we should rely on a secure way to check roles, OR assume the user can read their own row (already covered),
-- OR use a separate function (security definer) to check admin status without triggering RLS recursively.

-- However, a simpler fix for now is to allow any authenticated user to READ the users table (public profiles),
-- or at least their own row, without complex cross-checks.

-- Let's clean up and use a non-recursive approach.

-- 1. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Super Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Super Admins can delete all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users." ON public.users;
DROP POLICY IF EXISTS "Admins can update all users." ON public.users;
DROP POLICY IF EXISTS "Admins can delete all users." ON public.users;

-- 2. Define Cleaner Policies

-- A. VIEWING: Everyone can view public profiles (simplest, no recursion)
-- This was likely already there ("Public profiles are viewable by everyone."), so we ensure it's the main one.
-- If that policy exists and is true, we don't need a specific "Admin" view policy because Admin is part of "Everyone".
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);


-- B. UPDATING/DELETING: This is where we need the Admin Check.
-- To avoid recursion, we can use a JWT claim if available, but since we store roles in the table, 
-- we need to check the role WITHOUT triggering the SELECT policy recursively on the same row being checked.
-- Since we just made SELECT public (true), checking (SELECT role FROM users WHERE id = auth.uid()) should now be safe 
-- because the SELECT policy is just 'dtrue' and doesn't depend on another query.

CREATE POLICY "Super Admins can update all users"
ON public.users FOR UPDATE
USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Super Admins can delete all users"
ON public.users FOR DELETE
USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);
