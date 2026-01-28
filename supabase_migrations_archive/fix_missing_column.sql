-- The error occurs because the 'custom_fields' column does not exist in your database table 'talent_profiles'.
-- Run this script to add it.

ALTER TABLE public.talent_profiles 
ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}'::jsonb;

-- Reload the schema cache to ensure the API knows about the new column
NOTIFY pgrst, 'reload config';
