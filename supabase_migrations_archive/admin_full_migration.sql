-- 1. Update roles to includes super_admin
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'super_admin'));

-- 2. Add admin fields to talent_profiles
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- 3. Dynamic Form Table
CREATE TABLE IF NOT EXISTS public.form_fields (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    label text NOT NULL,
    name text NOT NULL UNIQUE,
    type text NOT NULL CHECK (type IN ('text', 'number', 'dropdown', 'checkbox', 'file')),
    required boolean DEFAULT false,
    options text[], -- for dropdowns
    order_index int DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for form_fields
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view form fields" ON public.form_fields;
CREATE POLICY "Public can view form fields" ON public.form_fields FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super Admins can manage form fields" ON public.form_fields;
CREATE POLICY "Super Admins can manage form fields" ON public.form_fields 
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- 4. Update Talent Profiles RLS
DROP POLICY IF EXISTS "Talent profiles are viewable by everyone." ON public.talent_profiles;

CREATE POLICY "Public can view active profiles" 
ON public.talent_profiles FOR SELECT 
USING (is_hidden = false AND deleted_at IS NULL);

-- Super Admin Policies for Talent Profiles
CREATE POLICY "Super Admins can view all profiles"
ON public.talent_profiles FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Super Admins can update all profiles"
ON public.talent_profiles FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Super Admins can delete all profiles"
ON public.talent_profiles FOR DELETE
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Super Admin Policies for Users
CREATE POLICY "Super Admins can view all users"
ON public.users FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Super Admins can update all users"
ON public.users FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Super Admins can delete all users"
ON public.users FOR DELETE
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- 5. Add Custom Fields (JSONB)
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}'::jsonb;

-- 6. Make user_id nullable & add internal fields for admin-created profiles
ALTER TABLE public.talent_profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS internal_name text;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS internal_email text;
ALTER TABLE public.talent_profiles ADD COLUMN IF NOT EXISTS internal_mobile text;
