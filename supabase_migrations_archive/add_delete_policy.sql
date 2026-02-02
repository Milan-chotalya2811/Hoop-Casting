-- Add DELETE policy for admins on video_feedback table
DROP POLICY IF EXISTS "Admins can delete feedback" ON public.video_feedback;

CREATE POLICY "Admins can delete feedback" ON public.video_feedback 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin'))
);
