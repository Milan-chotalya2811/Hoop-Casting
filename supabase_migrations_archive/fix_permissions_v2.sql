-- 1. Contact Submissions Table (Ensure it exists)
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for contact form
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON contact_submissions;
CREATE POLICY "Anyone can insert contact submissions" ON contact_submissions FOR INSERT WITH CHECK (true);

-- Super admin view/delete policies
DROP POLICY IF EXISTS "Super Admins can view contact submissions" ON contact_submissions;
CREATE POLICY "Super Admins can view contact submissions" ON contact_submissions FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin')
);

DROP POLICY IF EXISTS "Super Admins can delete contact submissions" ON contact_submissions;
CREATE POLICY "Super Admins can delete contact submissions" ON contact_submissions FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin')
);


-- 2. Video Feedback Permissions
-- Ensure table exists
CREATE TABLE IF NOT EXISTS video_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE video_feedback ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their *own* feedback
DROP POLICY IF EXISTS "Users can insert own feedback" ON video_feedback;
CREATE POLICY "Users can insert own feedback" ON video_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their *own* feedback
DROP POLICY IF EXISTS "Users can update own feedback" ON video_feedback;
CREATE POLICY "Users can update own feedback" ON video_feedback FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to view their *own* feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON video_feedback;
CREATE POLICY "Users can view own feedback" ON video_feedback FOR SELECT
USING (auth.uid() = user_id);

-- Allow Admins to view ALL feedback
DROP POLICY IF EXISTS "Admins can view all feedback" ON video_feedback;
CREATE POLICY "Admins can view all feedback" ON video_feedback FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'super_admin' OR role = 'admin'))
);


-- 3. Public Users Table (Self-Healing Permissions)
-- Allow authenticated users to INSERT their own row if it's missing (Self-heal)
DROP POLICY IF EXISTS "Users can insert self" ON public.users;
CREATE POLICY "Users can insert self" ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile is usually standard, checking:
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT
USING (auth.uid() = id);

-- Ensure public.users has RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
