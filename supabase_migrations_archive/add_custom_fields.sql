ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}'::jsonb;
