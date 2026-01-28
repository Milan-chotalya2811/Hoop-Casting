-- Add column to track if user must change password
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;

-- Add policy for admins to update this (if not covered by existing policies)
-- The existing 'Admins Manage All' or 'Admin View Users' policies likely cover select/view.
-- We need to ensure Admin can UPDATE this flag.
-- Assuming we have an RLS policy for admins on public.users. If not, add one.
CREATE POLICY "Admins can update users"
ON public.users
FOR UPDATE
USING ( is_admin() );

-- Ideally user can update their own flag (to set it false after change)
CREATE POLICY "Users can update own record"
ON public.users
FOR UPDATE
USING ( auth.uid() = id );
