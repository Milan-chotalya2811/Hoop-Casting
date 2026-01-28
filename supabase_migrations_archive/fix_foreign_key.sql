DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'video_feedback_user_id_fkey' 
        AND table_name = 'video_feedback'
    ) THEN
        ALTER TABLE video_feedback DROP CONSTRAINT video_feedback_user_id_fkey;
    END IF;
END $$;

-- Re-add the constraint pointing to auth.users with correct On Delete behavior
ALTER TABLE video_feedback
    ADD CONSTRAINT video_feedback_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Also Ensure public.users exists and has entries (Self-Healing trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'talent')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
