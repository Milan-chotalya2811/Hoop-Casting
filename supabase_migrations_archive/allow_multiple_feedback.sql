-- Drop the unique constraint that restricts one comment per user per video
-- This allows users to submit multiple feedbacks for the same video (sending messages)
ALTER TABLE public.video_feedback DROP CONSTRAINT IF EXISTS video_feedback_user_id_video_url_key;
