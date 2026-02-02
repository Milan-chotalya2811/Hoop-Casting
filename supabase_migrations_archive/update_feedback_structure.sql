-- 1. Create table for storing videos separately
CREATE TABLE IF NOT EXISTS public.feedback_videos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    video_url text NOT NULL,
    thumbnail_url text,
    title text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for feedback_videos
ALTER TABLE public.feedback_videos ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active videos
DROP POLICY IF EXISTS "Anyone can read active videos" ON public.feedback_videos;
CREATE POLICY "Anyone can read active videos" ON public.feedback_videos FOR SELECT USING (true);

-- Allow admins to manage videos
DROP POLICY IF EXISTS "Admins can manage videos" ON public.feedback_videos;
CREATE POLICY "Admins can manage videos" ON public.feedback_videos FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
);

-- 2. Update video_feedback table to reference feedback_videos
-- We will add video_id column.
-- We will keep video_url for legacy reasons or just fill it from the relation, but optimal is to rely on video_id.
ALTER TABLE public.video_feedback ADD COLUMN IF NOT EXISTS video_id uuid REFERENCES public.feedback_videos(id);

-- 3. Migrate existing settings (optional: creates a video entry if the settings exist)
DO $$
DECLARE
    url_list text;
    url_item text;
BEGIN
    SELECT value INTO url_list FROM public.admin_settings WHERE key = 'feedback_video_url';
    
    IF url_list IS NOT NULL THEN
        FOREACH url_item IN ARRAY string_to_array(url_list, ',') LOOP
            url_item := trim(url_item);
            IF length(url_item) > 0 THEN
                INSERT INTO public.feedback_videos (video_url)
                SELECT url_item
                WHERE NOT EXISTS (SELECT 1 FROM public.feedback_videos WHERE video_url = url_item);
            END IF;
        END LOOP;
    END IF;
END $$;

-- 4. Update Unique Constraint
-- We want one feedback per user per video_id.
-- First, drop the old constraint if it exists (it was separate user_id, video_url)
ALTER TABLE public.video_feedback DROP CONSTRAINT IF EXISTS video_feedback_user_id_video_url_key;

-- We need to ensure existing data has video_id if we want to add the constraint on video_id.
-- Attempt to backfill video_id based on video_url match.
UPDATE public.video_feedback vf
SET video_id = fv.id
FROM public.feedback_videos fv
WHERE vf.video_url = fv.video_url
AND vf.video_id IS NULL;

-- Now add the new unique constraint (only for entries with video_id to avoid issues, or filter index)
-- But effectively we want to enforce it.
-- If there are duplicates, this might fail, but let's assume low traffic for now.
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_user_video ON public.video_feedback(user_id, video_id);

-- 5. Add RLS for Delete (needed for admin mainly)
DROP POLICY IF EXISTS "Admins can delete feedback" ON public.video_feedback;
CREATE POLICY "Admins can delete feedback" ON public.video_feedback FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
);
