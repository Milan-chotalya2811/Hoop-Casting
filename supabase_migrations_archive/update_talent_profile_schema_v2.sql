-- Add new columns to talent_profiles table for enhanced profile details
ALTER TABLE  public.talent_profiles
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS past_brand_work text,
ADD COLUMN IF NOT EXISTS agency_status text,
ADD COLUMN IF NOT EXISTS pay_rates text,
ADD COLUMN IF NOT EXISTS travel_surat boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS social_links text,
ADD COLUMN IF NOT EXISTS content_rights_agreed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS age integer;

-- Ensure RLS allows update on these new columns (usually existing policy covers all columns, but good to check)
-- Existing policy: "Users can update own profile" likely uses "USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)"
-- So no new policy needed usually.
