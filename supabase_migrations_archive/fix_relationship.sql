-- 1. Sync any missing users from auth.users to public.users
-- This ensures foreign key creation won't fail due to missing data
INSERT INTO public.users (id, email, name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(raw_user_meta_data->>'role', 'talent')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Drop the existing foreign key to auth.users (if it exists)
-- We need to point to public.users to allow the frontend to Join and fetch Name/Email
ALTER TABLE video_feedback DROP CONSTRAINT IF EXISTS video_feedback_user_id_fkey;

-- 3. Add the foreign key to public.users
ALTER TABLE video_feedback
    ADD CONSTRAINT video_feedback_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;

-- 4. Reload Schema Cache (Usually happens automatically, but this comment serves as a reminder)
NOTIFY pgrst, 'reload config';
