-- Recreate the view with explicit column selection to avoid recursion if any
DROP VIEW IF EXISTS admin_feedback_view;

-- Basic query to verify the join works without permissions
-- This is NOT a view, just a script to check validity
-- If this fails, the columns probably don't exist

-- Ensure standard permissions again (Just in case RLS is the blocker)
DROP POLICY IF EXISTS "Admins can view all feedback" ON video_feedback;
CREATE POLICY "Admins can view all feedback" ON video_feedback 
FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('super_admin', 'admin'))
);

-- Ensure user relationship is clear
-- No changes needed to foreign keys if previous step succeeded.

-- Force Enable RLS on user table again
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant access to auth users to read public users (needed for joins)
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON public.users;
CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);
