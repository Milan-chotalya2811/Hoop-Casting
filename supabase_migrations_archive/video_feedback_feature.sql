-- Table for Admin Settings (e.g. Video URL)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key text PRIMARY KEY,
    value text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by uuid REFERENCES public.users(id)
);

-- RLS for admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read settings" ON public.admin_settings;
CREATE POLICY "Public can read settings" ON public.admin_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.admin_settings;
CREATE POLICY "Admins can update settings" ON public.admin_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
);

-- Table for Video Feedback
CREATE TABLE IF NOT EXISTS public.video_feedback (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) NOT NULL,
    user_name text, -- Cache name in case user is deleted/name changes, or just join? Join is better.
    video_url text NOT NULL,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, video_url)
);

-- RLS for video_feedback
ALTER TABLE public.video_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own feedback" ON public.video_feedback;
CREATE POLICY "Users can read own feedback" ON public.video_feedback FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all feedback" ON public.video_feedback;
CREATE POLICY "Admins can read all feedback" ON public.video_feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
);

DROP POLICY IF EXISTS "Users can insert own feedback" ON public.video_feedback;
CREATE POLICY "Users can insert own feedback" ON public.video_feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON public.video_feedback;
CREATE POLICY "Users can update own feedback" ON public.video_feedback FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert initial video setting if not exists
INSERT INTO public.admin_settings (key, value) VALUES ('feedback_video_url', 'https://www.youtube.com/embed/dQw4w9WgXcQ') ON CONFLICT (key) DO NOTHING;
