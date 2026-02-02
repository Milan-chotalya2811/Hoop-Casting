-- Instructions:
-- 1. Replace 'YOUR_EMAIL_HERE' with your actual login email address in the code below.
-- 2. Run this entire script in the Supabase SQL Editor.
-- 3. If successful, refresh your website.

-- Step 1: Ensure the 'super_admin' role is allowed in the database constraints
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'super_admin'));

-- Step 2: Insert the user if they don't exist, or Update them if they do
-- We look up the UUID from auth.users using the email
DO $$
DECLARE
    target_email TEXT := 'dhruv.monkeyads@gmail.com'; -- <--- CHANGE THIS EMAIL
    target_uuid UUID;
BEGIN
    -- Find the user's UUID
    SELECT id INTO target_uuid FROM auth.users WHERE email = target_email;

    IF target_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users. Please sign up first.', target_email;
    END IF;

    -- Upsert into public.users
    INSERT INTO public.users (id, email, name, mobile, role)
    VALUES (
        target_uuid, 
        target_email, 
        'Super Admin', 
        '0000000000', -- Placeholder mobile if missing
        'super_admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'super_admin';
    
    RAISE NOTICE 'User % has been promoted to Super Admin.', target_email;
END $$;
