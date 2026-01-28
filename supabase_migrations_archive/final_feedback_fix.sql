-- FINAL FIX FOR FEEDBACK SYSTEM
-- Run this entire script in Supabase SQL Editor to fix all issues (Multiple Submissions + Delete Permissions)

-- 1. Allow Multiple Feedbacks (Drop the "One comment per user" rule)
ALTER TABLE public.video_feedback DROP CONSTRAINT IF EXISTS video_feedback_user_id_video_url_key;

-- 2. Ensure RLS is enabled for security
ALTER TABLE public.video_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Add DELETE Policy for Admins (Fixes "Delete not working" issue)
DROP POLICY IF EXISTS "Admins can delete feedback" ON public.video_feedback;

CREATE POLICY "Admins can delete feedback" ON public.video_feedback 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
);

-- 4. Ensure Upsert/Insert is allowed for Users (Already checked, but good to double check)
-- Users were already allowed to insert.
