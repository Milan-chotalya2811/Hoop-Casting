-- Remove the restrictive check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Re-add the constraint with 'talent' included
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'admin', 'talent', 'user'));

-- Also, update the default if necessary
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'talent';
