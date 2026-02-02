-- 1. Update roles to include super_admin
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

-- Super Admin Policies for Users Table
-- Note: Existing policies might conflict if not careful.
-- "Admins can view all users" exists (lines 97-101 in original).
-- We will consolidate or add new ones.

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
